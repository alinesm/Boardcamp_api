import dayjs from "dayjs";
import { db } from "../database/database.js";

export async function findRents(req, res) {
  try {
    const rentals = await db.query("SELECT * FROM rentals");
    console.log(rentals.rows);

    // [
    //   {
    //     id: 1,
    //     customerId: 1,
    //     gameId: 1,
    //     rentDate: '2021-06-20',
    //     daysRented: 3,
    //     returnDate: null, // troca pra uma data quando já devolvido
    //     originalPrice: 4500,
    //     delayFee: null,
    //     customer: {
    //      id: 1,
    //      name: 'João Alfredo'
    //     },
    //     game: {
    //       id: 1,
    //       name: 'Banco Imobiliário'
    //     }
    //   }
    // ]

    // const customerQuery = await db.query(
    //   `SELECT rentals.*, customers.id, customers.name from rentals join customers on customerId = customers.id`
    // );
    // const customer = customerQuery.rows;
    // console.log("customers", customer);

    // const game = await db.query(
    //   `SELECT customer.*, games.id, games.name from customer join customer on gameId = games.id`
    // );
    // console.log("games", game.rows);
    res.send(rentals.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Houve um problema no servidor");
  }
}

export async function registerRent(req, res) {
  const { customerId, gameId, daysRented } = res.locals.rental;
  // const { customerId, gameId, daysRented } = req.body;

  const nowDate = dayjs().format("YYYY-MM-DD");
  const gamePriceQuery = await db.query(
    `SELECT games.pricePerDay from rentals join games on rentals.gameId = games.id where games.id= ${gameId}`
  );
  const gamePrice = gamePriceQuery.rows[0];
  // const originalPrice = gamePrice * daysRented;
  const originalPrice = 3200;

  try {
    await db.query(
      `INSERT INTO rentals (customerId, gameId, rentDate, daysRented, returnDate, originalPrice, delayFee) VALUES ( '${customerId}', '${gameId}', '${nowDate}', '${daysRented}', null, '${originalPrice}', null)`
    );
    res.status(201).send("rental inserido com sucesso");
  } catch (error) {
    console.error(error);
    res.status(500).send("Houve um problema no servidor");
  }
}

export async function finalizeRental(req, res) {
  const { id } = req.params;

  const nowDate = dayjs().format("YYYY-MM-DD");
  const rentalDateQuery = await db.query(
    `select rentDate from rentals where id='${id}'`
  );
  const rentalDate = rentalDateQuery.rows[0].rentdate;
  // console.log("rentaldate", new Date(rentalDate));
  // console.log(
  //   "delay",
  //   Math.ceil((new Date(nowDate) - rentalDate) / (1000 * 60 * 60 * 24))
  // );
  // const delayDays =  Math.ceil(
  //   (new Date(nowDate) - rentalDate) / (1000 * 60 * 60 * 24)
  // );
  const gamePriceQuery = await db.query(
    `SELECT rentals.id, games.pricePerDay from rentals join games on rentals.gameId = games.id where rentals.id = '${id}'`
  );
  console.log("gamequery", gamePriceQuery.rows);
  // const delayFee =
  // console.log(delayFee);
  //  - Ao retornar um aluguel, o campo `returnDate` deve ser populado
  // com a data atual do momento do retorno
  // const updatedRental = await db.query(`UPDATE rentals SET returnDate='${nowDate}', delayfee= '${delayFee}' WHERE id = '${id}';`)

  // - Ao retornar um aluguel, o campo `delayFee` deve ser automaticamente
  // populado com um valor equivalente ao número de dias de atraso vezes o preço
  // por dia do jogo no momento do retorno. Exemplo:
  //  - Se o cliente aluguel no dia **20/06** um jogo por **3 dias**,
  // ele deveria devolver no dia **23/06**. Caso ele devolva somente no dia **25/06**,
  //  o sistema deve considerar **2 dias de atraso**. Nesse caso, se o jogo
  //  custava **R$ 15,00** por dia, a `delayFee` deve ser de **R$ 30,00** (3000 centavos)

  // - Ao retornar um aluguel, deve verificar se o `id` do aluguel fornecido existe.
  // Se não, deve responder com **status 404**

  // - Ao retornar um aluguel, deve verificar se o aluguel já não está finalizado.
  // Se estiver, deve responder com **status 400**

  // try {
  //   const customers = await db.query(`SELECT * FROM customers WHERE id = $1;`, [
  //     id,
  //   ]);
  //   res.send(customers.rows[0]);
  // } catch (err) {
  //   res.status(500).send(err.message);
  // }
}

export async function deleteRental(req, res) {
  const { id } = req.params;

  try {
    await db.query(`DELETE * FROM rentals WHERE id = $1;`, [id]);
    res.send("deleted");
  } catch (err) {
    res.status(500).send(err.message);
  }

  //   - Ao excluir um aluguel, deve verificar se o `id`
  //   fornecido existe. Se não, deve responder com **status 404.**

  // - Ao excluir um aluguel, deve verificar se o aluguel já não está
  // finalizado (ou seja, `returnDate` já está preenchido).
  // Se não estiver finalizado, deve responder com **status 400.**
}
