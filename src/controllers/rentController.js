import dayjs from "dayjs";
import { db } from "../database/database.js";

export async function findRents(req, res) {
  try {
    const rentals = await db.query(`
    SELECT 
    rentals.*,
    json_build_object(
      'id', customers.id,
      'name', customers.name
    ) AS "customer",
    json_build_object(
      'id', games.id,
      'name', games.name
    ) AS "game"
  FROM rentals 
  JOIN customers 
  ON rentals.customerid = customers.id 
  JOIN games 
  ON rentals.gameid = games.id`);

    res.send(rentals.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Houve um problema no servidor");
  }
}

export async function registerRental(req, res) {
  const { customerId, gameId, daysRented } = res.locals.rental;

  const gamesRentals = await db.query(
    'SELECT * FROM rentals WHERE "gameId" = $1',
    [gameId]
  );

  const checkGameStock = await db.query(
    'SELECT "stockTotal" FROM games WHERE id = $1',
    [gameId]
  );

  if (checkGameStock.rows[0].stockTotal <= gamesRentals.rowCount) {
    return res.status(400).send("Não há games suficientes para serem alugados");
  }
  const nowDate = dayjs().format("YYYY-MM-DD");

  const gamePriceQuery = await db.query(
    `SELECT "pricePerDay" FROM games WHERE id = '${gameId}'`
  );
  const gamePrice = gamePriceQuery.rows[0].pricePerDay;

  const originalPrice = gamePrice * daysRented;

  try {
    await db.query(
      `INSERT INTO rentals ("customerId", "gameId", "daysRented", "rentDate", "originalPrice") 
       VALUES ( '${customerId}', '${gameId}', '${nowDate}' , '${daysRented}', null, '${originalPrice}', null)`
    );

    res.status(201).send("rental inserido com sucesso");
  } catch (error) {
    console.error(error);
    res.status(500).send("Houve um problema no servidor");
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
