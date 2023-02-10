import { db } from "../database/database.js";

export async function findGames(req, res) {
  try {
    const games = await db.query("SELECT * FROM games");
    console.log(games.rows);
    res.send(games.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Houve um problema no servidor");
  }
}

export async function createGame(req, res) {
  const { name, image, stockTotal, pricePerDay } = res.locals.game;
  // console.log(req.body);
  // const { name, image, stockTotal, pricePerDay } = req.body;

  try {
    await db.query(
      `
    INSERT INTO games
    (name, image, "stockTotal", "pricePerDay") 
    VALUES ($1, $2, $3, $4)`,
      [name, image, stockTotal, pricePerDay]
    );
    res.status(201).send("game inserido com sucesso");
  } catch (error) {
    console.error(error);
    res.status(500).send("Houve um problema no servidor");
  }
}
