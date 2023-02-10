import joi from "joi";

export const rentalSchema = joi.object({
  customerId: joi.number().integer().greater(0).required(),
  gameId: joi.number().integer().greater(0).required(),
  // rentDate: joi
  //   .string()
  //   .pattern(/^\d{4}-\d{2}-\d{2}$/)
  //   .required(),
  daysRented: joi.number().integer().greater(0).required(),
  // returnDate: joi
  //   .string()
  //   .pattern(/^\d{4}-\d{2}-\d{2}$/)
  //   .allow(null)
  //   .required(),
  // originalPrice: joi.number().greater(0).required(),
  // delayFee: joi.number().integer().greater(0).allow(null).required(),
});
