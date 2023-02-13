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
  try {
    const rentalObj = await db.query("SELECT * FROM rentals WHERE id = $1 ", [
      id,
    ]);
    if (rentalObj.rowCount < 1) return res.status(404).send("Não encontrado");
    const rental = rentalObj.rows[0];

    if (rental.returnDate) return res.status(400).send("Já finalizado");

    const rentalDate = new Date(rental.rentDate);

    const dueDate = new Date(
      rentalDate.getTime() + rental.daysRented * 1000 * 60 * 60 * 24
    );

    const today = new Date();

    today.setTime(today.setHours(0, 0, 0, 0));

    const timeDiff = today.getTime() - dueDate.getTime();
    const daysDiff =
      timeDiff > 0 ? Math.floor(timeDiff / (1000 * 60 * 60 * 24)) : 0;

    const feePerDay = Math.floor(rental.originalPrice / rental.daysRented);
    const delayFee = daysDiff ? daysDiff * feePerDay : null;

    await db.query(
      `
      UPDATE rentals
      SET 
        "returnDate" = Now(),
        "delayFee" = $1
      WHERE 
        id = $2
    `,
      [delayFee, id]
    );

    return res.status(200).send("OK");
  } catch (error) {
    console.log(error.message);
    return res.status(500).send("Erro interno");
  }
}

export async function deleteRental(req, res) {
  const { id } = req.params;

  try {
    const rentalObj = await db.query("SELECT * FROM rentals WHERE id = $1", [
      id,
    ]);

    if (rentalObj.rowCount < 1) return res.status(404).send("Não encontrado");

    if (!rentalObj.rows[0].returnDate)
      return res.status(400).send("Não finalizado");

    await db.query("DELETE FROM rentals WHERE id = $1", [id]);

    return res.status(200).send("Apagado com sucesso");
  } catch (error) {
    console.log(error.message);
    return res.status(500).send("Erro interno");
  }
}
