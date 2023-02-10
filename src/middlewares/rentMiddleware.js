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

  // - Ao inserir um aluguel, deve verificar se `customerId` se
  // refere a um cliente existente. Se não, deve responder com **status 400**
  const checkCustomerId = await db.query(
    `SELECT name FROM customers WHERE id= '${customerId}'`
  );
  console.log(checkCustomerId.rows[0]);
  if (!checkCustomerId.rows[0])
    return res.status(400).send("Esse cliente não existe");

  // - Ao inserir um aluguel, deve verificar se `gameId` se refere a um jogo existente.
  // Se não, deve responder com **status 400**
  const checkGameId = await db.query(
    `SELECT name FROM games WHERE id= '${gameId}'`
  );
  console.log(checkGameId.rows[0]);
  if (!checkGameId.rows[0]) return res.status(400).send("Esse jogo não existe");

  // - `daysRented` deve ser um número maior que 0. Se não, deve responder com **status 400**
  if (daysRented < 0)
    return res.status(400).send("daysRented é menor que zero");

  // - Ao inserir um aluguel, deve-se validar que existem jogos disponíveis, ou seja,
  // que não tem alugueis em aberto acima da quantidade de jogos em estoque.
  // Caso contrário, deve retornar **status 400**
  // soma o total de aluguel e compara com o total de estoques

  const totalRentalsQuery = await db.query("select * from rentals");
  const totalOpenRentals = totalRentalsQuery.rows.filter(
    (r) => r.returndate === null
  ).length;

  const totalStocksQuery = await db.query("SELECT SUM(stockTotal) FROM games");
  const totalStock = Number(totalStocksQuery.rows[0].sum);

  if (totalOpenRentals > totalStock)
    res.status(400).send("Não há games suficientes para serem alugados");
  console.log(Number(totalOpenRentals), Number(totalStocksQuery.rows[0].sum));

  res.locals.rental = rental;

  next();
}
