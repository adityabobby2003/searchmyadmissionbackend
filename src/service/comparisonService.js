import XLSX from "xlsx";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, "../public/College Predictor Data.xlsx");

const workbook = XLSX.readFile(filePath);

const columnMap = {
  general: { delhi: "OPNOHS", outside: "OPNOOS" },
  obc: { delhi: "BCNOHS" },
  ews: { delhi: "EWNOHS", outside: "EWNOOS" },
  sc: { delhi: "SCNOHS", outside: "SCNOOS" },
  st: { delhi: "STNOHS", outside: "STNOOS" }
};

function getRoundPriority(round) {
  if (!round) return 999;
  const num = parseInt(round.replace(/\D/g, ""));
  return isNaN(num) ? 999 : num;
}

function dedupeCollegesByBestRound(results) {
  const map = new Map();

  for (const college of results) {
    const key = normalizeName(college.institute);
    const currentPriority = getRoundPriority(college.round);

    if (!map.has(key)) {
      map.set(key, college);
    } else {
      const existing = map.get(key);
      const existingPriority = getRoundPriority(existing.round);

      // Keep the earlier round (smaller number)
      if (currentPriority < existingPriority) {
        map.set(key, college);
      }
    }
  }

  return Array.from(map.values());
}

function normalizeName(name) {
  return name
    ?.toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .trim();
}

const btechRankSheet = workbook.Sheets["AKTU Btech Rank Score"];
const btechRankData = XLSX.utils.sheet_to_json(btechRankSheet);

const btechRankMap = {};
btechRankData.forEach(row => {
  btechRankMap[normalizeName(row["College"])] =
    Number(row["Rank Score"]);
});

const bcaRankSheet = workbook.Sheets["BCA Rank Score"];
const bcaRankData = XLSX.utils.sheet_to_json(bcaRankSheet);

const bcaRankMap = {};
bcaRankData.forEach(row => {
  bcaRankMap[normalizeName(row["Institute"])] =
    Number(row["Rank Score"]);
});

const llbRankSheet = workbook.Sheets["LLB Rank Score"];
const llbRankData = XLSX.utils.sheet_to_json(llbRankSheet);

const llbRankMap = {};
llbRankData.forEach(row => {
  llbRankMap[normalizeName(row["Institute"])] =
    Number(row["Rank Score"]);
});

const bbaRankSheet = workbook.Sheets["BBA Rank Score"];
const bbaRankData = XLSX.utils.sheet_to_json(bbaRankSheet);

const bbaRankMap = {};
bbaRankData.forEach(row => {
  bbaRankMap[normalizeName(row["Institute"])] =
    Number(row["Rank Score"]);
});

/* ================= ATTACH RANK ================= */
function attachRankScore(rawResults, rankMap = null) {
  let counter = 1;

  return rawResults.map(college => {
    if (rankMap) {
      const normalized = normalizeName(college.institute);

      return {
        ...college,
        rankScore: rankMap[normalized] || 999
      };
    }

    // fallback (LLB / BBA)
    return {
      ...college,
      rankScore: counter++
    };
  });
}

function parseRankRange(text) {
  if (!text || text === "-") return null;

  const min = text.match(/Min Rank - (\d+)/);
  const max = text.match(/Max Rank - (\d+)/);

  return {
    min: min ? parseInt(min[1]) : null,
    max: max ? parseInt(max[1]) : null
  };
}

function calculateStrengthScore(college, allColleges) {
  const best = Math.min(...allColleges.map(c => c.minRank));
  const worst = Math.max(...allColleges.map(c => c.maxRank));

  const weighted =
    (college.minRank * 0.7 + college.maxRank * 0.3);

  const score =
    100 - ((weighted - best) / (worst - best)) * 100;

  return Math.round(score);
}

function getCollegeTier(score) {
  if (score >= 90) return "Tier A+";
  else if (score >= 85) return "Tier A";
  else if (score >= 78) return "Tier B";
  else return "Tier C";
}

function getBrandPreference(score) {
  if (score >= 85) return "High";
  else if (score >= 70) return "Medium";
  else return "Low";
}

function computeCollegeMetrics({
  userRank,
  R1,
  R2,
  R3,
  collegeStrengthScore
}) {

  let probability;

  if (userRank <= R3) {
    const bufferRatio = (R3 - userRank) / R3;

    if (bufferRatio >= 0.15) probability = 90;
    else if (bufferRatio >= 0.10) probability = 85;
    else if (bufferRatio >= 0.05) probability = 75;
    else probability = 65;
  } else {
    probability = 40;
  }

  let expectedRound;

  if (userRank <= R1) expectedRound = "R1";
  else if (userRank <= R1 * 1.05) expectedRound = "R1–R2";
  else if (userRank <= R2) expectedRound = "R2";
  else if (userRank <= R2 * 1.05) expectedRound = "R2–R3";
  else if (userRank <= R3) expectedRound = "R3";
  else expectedRound = "Needs Consultation";

  /* -------- Seat Security -------- */
  let seatSecurity =
    probability >= 85 ? "High" :
    probability >= 70 ? "Medium" : "Low";

  /* -------- Risk vs Reward -------- */
  let riskReward;

  if (probability >= 80 && collegeStrengthScore >= 85)
    riskReward = "Safe Choice";
  else if (probability >= 65 && collegeStrengthScore >= 85)
    riskReward = "Balanced";
  else if (probability < 65 && collegeStrengthScore >= 85)
    riskReward = "High Reward";
  else
    riskReward = "Stretch / Avoid";

  /* -------- Rank Stability -------- */
  const nearestGap = Math.min(
    Math.abs(userRank - R1),
    Math.abs(userRank - R2),
    Math.abs(userRank - R3)
  );

  let rankStability =
    nearestGap >= 0.15 * R3 ? "Comfortable" :
    nearestGap >= 0.05 * R3 ? "Tight" : "Volatile";

  /* -------- Allotment Confidence -------- */
  let allotmentConfidence;

  if (probability >= 85 && rankStability === "Comfortable")
    allotmentConfidence = "Very High";
  else if (probability >= 75)
    allotmentConfidence = "High";
  else if (probability >= 60)
    allotmentConfidence = "Moderate";
  else
    allotmentConfidence = "Low";

  /* -------- Preference Priority -------- */
  let preferencePriority =
    riskReward === "Safe Choice" ? "First Preference" :
    riskReward === "Balanced" ? "Backup" : "Stretch";

  /* -------- Final Score -------- */
  const finalScore =
    (collegeStrengthScore * 0.6) +
    (probability * 0.4);

  let aiFit;

  if (finalScore >= 85) aiFit = "Excellent Fit";
  else if (finalScore >= 75) aiFit = "Good Fit";
  else if (finalScore >= 65) aiFit = "Moderate Fit";
  else aiFit = "Risky Fit";

  return {
    probability,
    expectedRound,
    seatSecurity,
    riskReward,
    rankStability,
    allotmentConfidence,
    preferencePriority,
    finalScore: Math.round(finalScore),
    aiFit
  };
}

function generateAIVerdict(results) {

  if (!results || results.length === 0) {
    return "No strong college options found for your rank. Consider exploring alternative courses or counselling support.";
  }

  const top = results[0];
  const second = results[1];
  const third = results[2];

  let verdict = "";

  /* -------- TOP COLLEGE -------- */
  verdict += `${top.institute} should be placed as your first preference as it offers a strong combination of `;

  if (top.collegeStrengthScore >= 85 && top.probability >= 80) {
    verdict += `excellent institutional quality and high admission certainty. `;
  } else if (top.collegeStrengthScore >= 85) {
    verdict += `top-tier institutional quality despite moderate admission chances. `;
  } else {
    verdict += `good admission probability with decent overall value. `;
  }

  /* -------- SECOND COLLEGE -------- */
  if (second) {
    verdict += `${second.institute} can be considered as a backup option due to its `;

    if (second.riskReward === "Balanced") {
      verdict += `balanced mix of safety and quality. `;
    } else if (second.riskReward === "Safe Choice") {
      verdict += `high admission safety. `;
    } else {
      verdict += `moderate chances and acceptable quality. `;
    }
  }

  /* -------- THIRD COLLEGE -------- */
  if (third) {
    verdict += `${third.institute} should be treated as a stretch option as it carries `;

    if (third.probability < 65) {
      verdict += `lower admission probability but can offer upside if secured. `;
    } else {
      verdict += `some risk depending on counselling dynamics. `;
    }
  }

  /* -------- FINAL STRATEGY LINE -------- */
  verdict += `Overall, prioritize safer high-quality colleges first, followed by balanced options, and keep stretch choices at lower preference levels to maximize admission success.`;

  return verdict;
}

function buildComparisonResults(rawResults, userRank) {

  const processedResults = rawResults.map(college => {
    const strengthScore =
      calculateStrengthScore(college, rawResults);

    const metrics = computeCollegeMetrics({
      userRank,
      R1: college.minRank,
      R2: college.maxRank * 0.95,
      R3: college.maxRank,
      collegeStrengthScore: strengthScore
    });

    return {
      ...college,
      collegeStrengthScore: strengthScore,
      collegeTier: getCollegeTier(strengthScore),
      brandPreference: getBrandPreference(strengthScore),
      ...metrics
    };
  });

  const dedupedResults = dedupeCollegesByBestRound(processedResults);

  const allResults = dedupedResults.sort((a, b) => a.rankScore - b.rankScore);

  const topResults = allResults.slice(0, 5);

  const aiVerdict= generateAIVerdict(topResults);
  // const aiVerdict= generateAIVerdict(allResults);
  return{
    results: topResults,
    // results: allResults,
    aiVerdict
  };
}

export const getLLBService = async ({
  rank,
  category,
  region,
  course
}) => {

  const sheet = workbook.Sheets["LLB 2025 Cutoff"];
  const data = XLSX.utils.sheet_to_json(sheet);

  const column = columnMap[category]?.[region];
  if (!column) throw new Error("Invalid category or region");

  const rawResults = [];

  for (let row of data) {
    if (!row.Course || !row.Course.includes(course)) continue;

    const range = parseRankRange(row[column]);
    if (!range) continue;

    if (rank <= range.max) {
      rawResults.push({
        institute: row.Institute,
        course: row.Course,
        minRank: range.min,
        maxRank: range.max,
        round: row.Round,
        category,
        region
      });
    }
  }

  const withRank = attachRankScore(rawResults, llbRankMap);

  return buildComparisonResults(withRank, rank);
};

export const getBCABBAService = async ({
  rank,
  category,
  region,
  course,
  sheetName
}) => {

  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet);

  const column = columnMap[category]?.[region];
  if (!column) throw new Error("Invalid category or region");

  const rawResults = [];

  for (let row of data) {
    if (!row.Course || !row.Course.includes(course)) continue;

    const range = parseRankRange(row[column]);
    if (!range) continue;

    if (rank <= range.max) {
      rawResults.push({
        institute: row.Institute,
        course: row.Course,
        minRank: range.min,
        maxRank: range.max,
        round: row.Round,
        category,
        region
      });
    }
  }

  const rankMap =
    sheetName.includes("BCA") ? bcaRankMap : bbaRankMap;

  const withRank = attachRankScore(rawResults, rankMap);

  return buildComparisonResults(withRank, rank);
};

export const getBTechService = async ({
  rank,
  category,
  course,
  region
}) => {

  const sheet = workbook.Sheets["AKTU BTECH 2025 Cutoff"];

  const reg = region === "up" ? "HS" : "AI";

  const data = XLSX.utils.sheet_to_json(sheet).map(row => ({
    round: row["Round"],
    institute: row["College"],
    course: row["Branch"],
    region: row["Region"],
    category: row["Category "]?.trim(),
    minRank: Number(row["Opening Rank "]),
    maxRank: Number(row["Closing Rank "])
  }));

  const filtered = data.filter(row =>
    row.category === category &&
    row.course === course &&
    row.region === reg &&
    rank <= row.maxRank
  );

  const withRank = attachRankScore(filtered, btechRankMap);

  return buildComparisonResults(withRank, rank);
};