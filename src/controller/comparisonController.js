import { getLLBService, getBCABBAService, getBTechService } from "../service/comparisonService.js";
import { checkUserPayment } from "../service/paymentService.js";

export const getllbController = async (req, res) => {
  try {

    const { rank, category, region, course, email, exam } = req.body;

    const isPaid = await checkUserPayment({
      email,
      exam,
      course,
      rank: Number(rank),
      region,
      category
    });

    const data = await getLLBService({
      rank: Number(rank),
      category,
      region,
      course
    });

    const results= data;

    res.json({
      success: true,
      paid: isPaid,
      results
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

    const { rank, category, region, course, email, exam } = req.body;

    const isPaid = await checkUserPayment({
      email,
      exam,
      course,
      rank: Number(rank),
      region,
      category
    });

    const data = await getBCABBAService({
      rank: Number(rank),
      category,
      region,
      course,
      sheetName: "BCA 2025 Cutoff"
    });

    // const results = isPaid ? data : data.slice(0, 5);
    const results= data;

     res.json({
      success: true,
      paid: isPaid,
      results
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }

};

export const getBBAController = async (req, res) => {

  try {

    const { rank, category, region, course, email, exam } = req.body;

    const isPaid = await checkUserPayment({
      email,
      exam,
      course,
      rank: Number(rank),
      region,
      category
    });

    const data = await getBCABBAService({
      rank: Number(rank),
      category,
      region,
      course,
      sheetName: "BBA 2025 Cutoff"
    });

    // const results = isPaid ? data : data.slice(0, 5);
    const results= data;

    res.json({
      success: true,
      paid: isPaid,
      results
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }

};

export const getBTechController= async (req, res)=>{
    try {

    const { rank, category, region, course, email, exam } = req.body;

    const isPaid = await checkUserPayment({
      email,
      exam,
      course,
      rank: Number(rank),
      region,
      category
    });

    const data = await getBTechService({
      rank: Number(rank),
      category,
      course,
      region
    });

    // const results = isPaid ? data : data.slice(0, 5);
    const results= data;

    res.json({
      success: true,
      paid: isPaid,
      results
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
}
