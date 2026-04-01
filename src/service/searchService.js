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

function parseRankRange(text) {
  if (!text || text === "-") return null;

  const min = text.match(/Min Rank - (\d+)/);
  const max = text.match(/Max Rank - (\d+)/);

  return {
    min: min ? parseInt(min[1]) : null,
    max: max ? parseInt(max[1]) : null
  };
}

export const getLLBService = async ({ rank, category, region, course }) => {

  const sheet = workbook.Sheets["LLB 2025 Cutoff"];
  const data = XLSX.utils.sheet_to_json(sheet);

  const column = columnMap[category]?.[region];

  if (!column) throw new Error("Invalid category or region");

  const results = [];

  for (let row of data) {

    if (!row.Course || !row.Course.includes(course)) continue;

    const rankText = row[column];
    const range = parseRankRange(rankText);

    if (!range) continue;

    if (rank >= range.min && rank <= range.max) {
      results.push({
        institute: row.Institute,
        course: row.Course,
        minRank: range.min,
        maxRank: range.max,
        region: region,
        category: category,
        round: row.Round,
      });
    }
  }

  // results.sort((a, b) => b.finalScore - a.finalScore);

  return results;
};

export const getBCABBAService = async ({ rank, category, region, course, sheetName }) => {

  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet);

  const column = columnMap[category]?.[region];

  if (!column) throw new Error("Invalid category or region");

  const results = [];

  for (let row of data) {

    if (!row.Course || !row.Course.includes(course)) continue;

    const rankText = row[column];
    const range = parseRankRange(rankText);

    if (!range) continue;

    if (rank >= range.min && rank <= range.max) {

      results.push({
        institute: row.Institute,
        course: row.Course,
        minRank: range.min,
        maxRank: range.max,
        region: region,
        category: category,
        round: row.Round,
      });

    }
  }

  // results.sort((a, b) => b.finalScore - a.finalScore);

  return results;
};

export const getBTechService = async ({ rank, category, course, region }) => {

  const sheet = workbook.Sheets["AKTU BTECH 2025 Cutoff"];

  let reg= null;
  
  if(region=="up"){
    reg= "HS"
  }else{
    reg= "AI"
  }

  const branch= course;

  // Normalize Excel columns once
  const data = XLSX.utils.sheet_to_json(sheet).map(row => ({
    round: row["Round"],
    college: row["College"],
    branch: row["Branch"],
    region: row["Region"],
    category: row["Category "]?.trim(),
    openingRank: Number(row["Opening Rank "]),
    closingRank: Number(row["Closing Rank "])
  }));

  const results = [];

  for (let row of data) {

    if (row.category !== category) continue;

    if (row.branch !== branch) continue;

    if (row.region !== reg) continue;

    if (rank >= row.openingRank && rank <= row.closingRank) {

      results.push({
        institute: row.college,
        course: row.branch,
        minRank: row.openingRank,
        maxRank: row.closingRank,
        round: row.round,
        region: row.region,
        category: row.category
      });

    }

  }

  // results.sort((a, b) => b.finalScore - a.finalScore);

  return results;
};