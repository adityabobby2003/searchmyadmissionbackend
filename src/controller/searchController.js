import { getLLBService, getBCABBAService, getBTechService } from "../service/searchService.js";
import { checkUserPayment, createPaymentEntry } from "../service/paymentService.js";

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

    const results = isPaid ? data : data.slice(0, 5);

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

    const results = isPaid ? data : data.slice(0, 5);

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

    const results = isPaid ? data : data.slice(0, 5);

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

    const results = isPaid ? data : data.slice(0, 5);

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

export const paymentController = async (req, res) => {
  try {

    const {
      email,
      exam,
      course,
      rank,
      region,
      category,
      payment
    } = req.body;

    if (!payment) {
      return res.status(400).json({
        success: false,
        message: "Payment not completed"
      });
    }

    await createPaymentEntry({
      email,
      exam,
      course,
      rank: Number(rank),
      region,
      category
    });

    res.json({
      success: true,
      message: "Payment recorded successfully"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};