import { db } from "../database/database.js";
import { rentalSchema } from "../schemas/rentSchema.js";

export async function rentalSchemaValidation(req, res, next) {
  const { customerId, gameId, daysRented } = req.body;

  const rental = {
    customerId,
    gameId,
    // rentDate: dayjs().format("YYYY-MM-DD"),
    daysRented,
    // returnDate: null,
    // originalPrice: game.pricePerDay * daysRented,
    // delayFee: null,
    // ( dayjs().format("YYYY-MM-DD") - rentDate + daysRented) * game.pricePerDay
  };

  const { error } = rentalSchema.validate(rental, { abortEarly: false });

  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    return res.status(400).send(errorMessages);
  }

  const checkCustomerId = await db.query(
    `SELECT name FROM customers WHERE id= '${customerId}'`
  );
  // console.log(checkCustomerId.rows[0]);
  if (!checkCustomerId.rows[0])
    return res.status(400).send("Esse cliente não existe");

  const checkGameId = await db.query(
    `SELECT name FROM games WHERE id= '${gameId}'`
  );
  // console.log(checkGameId.rows[0]);
  if (!checkGameId.rows[0]) return res.status(400).send("Esse jogo não existe");

  res.locals.rental = rental;

  next();
}
