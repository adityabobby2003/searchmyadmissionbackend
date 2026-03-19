import Payment from "../model/paymentModel.js";

export const checkUserPayment = async ({
  email, exam, course, rank, region, category
}) => {

  const record = await Payment.findOne({
    where: { email, exam, course, rank, region, category }
  });

  return !!record;
};

export const createPaymentEntry = async ({
  email, exam, course, rank, region, category
}) => {
//   category.toLowerCase()
//   region.toLowerCase()
//   course.toLowerCase()
//   rank.toLowerCase()
//   exam.toLowerCase()

  return await Payment.create({
    email,
    exam,
    course,
    rank,
    region,
    category,
    paid_at: new Date()
  });

};