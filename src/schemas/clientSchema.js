import joi from "joi";

export const clientSchema = joi.object({
  name: joi.string().min(1).required(),
  phone: joi
    .alternatives()
    .try(
      joi.string().length(10).pattern(/^\d+$/).required(),
      joi.string().length(11).pattern(/^\d+$/).required()
    ),
  cpf: joi.string().length(11).pattern(/^\d+$/).required(),
  birthday: joi
    .string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required(),
});
