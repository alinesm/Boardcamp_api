import { db } from "../database/database.js";
import { rentalSchema } from "../schemas/rentSchema.js";

export async function rentalSchemaValidation(req, res, next) {
  const { customerId, gameId, daysRented } = req.body;

  const rental = {
    customerId,
    gameId,
    daysRented,
  };

  const { error } = rentalSchema.validate(rental, { abortEarly: false });

  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    return res.status(400).send(errorMessages);
  }

  res.locals.rental = rental;

  next();
}
