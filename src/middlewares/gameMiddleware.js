import { db } from "../database/database.js";
import { gameSchema } from "../schemas/gameSchema.js";

export async function gameSchemaValidation(req, res, next) {
  const game = req.body;

  const { error } = gameSchema.validate(game, { abortEarly: false });

  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    return res.status(400).send(errorMessages);
  }

  const checkName = await db.query(
    `SELECT name FROM games WHERE name= '${game.name}'`
  );
  console.log(checkName.rows[0]);
  if (checkName.rows[0]) return res.status(409).send("Esse usuário já existe");

  res.locals.game = game;

  next();
}
