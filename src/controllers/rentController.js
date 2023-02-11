import dayjs from "dayjs";
import { db } from "../database/database.js";

export async function findRents(req, res) {
  try {
    const rentals = await db.query(`
    SELECT
      rentals.*,
      json_build_object('id', customers.id, 'name', customers.name) AS customer,
      json_build_object('id', games.id, 'name', games.name) AS game
    FROM
      rentals
      JOIN customers ON rentals."customerId" = customers.id
      JOIN games ON rentals."gameId" = games.id;
    `);
    res.send(rentals.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Houve um problema no servidor");
  }
}

export async function registerRental(req, res) {
  const { customerId, gameId, daysRented } = req.body;
  try {
    const existingGame = await db.query("SELECT * FROM games WHERE id = $1", [
      gameId,
    ]);
    if (existingGame.rowCount !== 1) {
      return res.sendStatus(400);
    }

    const existingCustomer = await db.query(
      "SELECT * FROM customers WHERE id = $1",
      [customerId]
    );
    if (existingCustomer.rowCount !== 1) {
      return res.sendStatus(400);
    }

    const openRentals = await db.query(
      'SELECT * FROM rentals WHERE "gameId" = $1',
      [gameId]
    );

    const checkStock = await db.query(
      'SELECT "stockTotal" FROM games WHERE id = $1',
      [gameId]
    );
    if (checkStock.rows[0].stockTotal <= openRentals.rowCount) {
      return res.sendStatus(400);
    }

    const rental = await db.query(
      `
    INSERT INTO rentals ("customerId", "gameId", "daysRented", "rentDate", "originalPrice")
    VALUES ($1, $2, $3, NOW(), (SELECT "pricePerDay" FROM games WHERE id = $2) * $3);
    `,
      [customerId, gameId, daysRented]
    );

    if (rental.rowCount === 1) {
      res.sendStatus(201);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
}

export async function finalizeRental(req, res) {
  const { id } = req.params;

  const checkRentalId = await db.query(
    `SELECT * FROM rentals WHERE id= '${id}'`
  );

  if (!checkRentalId.rows[0])
    return res.status(404).send("Esse aluguel não existe");

  if (checkRentalId.rows[0].returnDate)
    return res.status(400).send("Esse aluguel já foi finalizado");

  const nowDate = dayjs().format("YYYY-MM-DD");

  const rentalDateQuery = await db.query(
    `select "rentDate" from rentals where id='${id}'`
  );
  const rentalDate = rentalDateQuery.rows[0].rentDate;

  const delayDays = Math.ceil(
    (new Date(nowDate) - new Date(rentalDate)) / (1000 * 60 * 60 * 24)
  );

  const gamePriceQuery = await db.query(
    `SELECT rentals.id, games.priceperday from rentals join games on rentals.gameid = games.id where rentals.id = '${id}'`
  );

  const delayFee = gamePriceQuery.rows[0].priceperday * delayDays;

  try {
    await db.query(
      `UPDATE rentals SET "returnDate"='${nowDate}', "delayFee"= '${delayFee}' WHERE id = '${id}';`
    );
    res.send("rent finalized");
  } catch (err) {
    res.status(500).send(err.message);
  }
}

export async function deleteRental(req, res) {
  const { id } = req.params;

  const checkRentalId = await db.query(
    `SELECT * FROM rentals WHERE id= '${id}'`
  );

  if (!checkRentalId.rows[0])
    return res.status(404).send("Esse aluguel não existe");

  if (!checkRentalId.rows[0].returndate)
    return res.status(400).send("Esse aluguel não foi finalizado");

  try {
    await db.query(`DELETE FROM rentals WHERE id = $1;`, [id]);
    res.send("deleted");
  } catch (err) {
    res.status(500).send(err.message);
  }
}
