import { getLLBService, getBCABBAService, getBTechService } from "../service/searchService.js";

export const getllbController = async (req, res) => {
  try {

    const { rank, category, region, course } = req.body;

    const data = await getLLBService({
      rank: Number(rank),
      category,
      region,
      course
    });

    res.json({
      success: true,
      results: data
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

export const getBCAController = async (req, res) => {

  try {

    const { rank, category, region, course } = req.body;

    const data = await getBCABBAService({
      rank: Number(rank),
      category,
      region,
      course,
      sheetName: "BCA 2025 Cutoff"
    });

    res.json({ success: true, results: data });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }

};

export const getBBAController = async (req, res) => {

  try {

    const { rank, category, region, course } = req.body;

    const data = await getBCABBAService({
      rank: Number(rank),
      category,
      region,
      course,
      sheetName: "BBA 2025 Cutoff"
    });

    res.json({ success: true, results: data });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }

};

export const getBTechController= async (req, res)=>{
    try {

    const { rank, category } = req.body;

    const data = await getBTechService({
      rank: Number(rank),
      category
    });

    res.json({
      success: true,
      results: data
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
}