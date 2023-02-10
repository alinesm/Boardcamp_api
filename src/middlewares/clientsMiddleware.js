import { db } from "../database/database.js";
import { clientSchema } from "../schemas/clientSchema.js";

export async function clientSchemaValidation(req, res, next) {
  const client = req.body;
  const { error } = clientSchema.validate(client, { abortEarly: false });

  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    return res.status(400).send(errorMessages);
  }

  const checkCPF = await db.query(
    `SELECT name FROM customers WHERE cpf= '${client.cpf}'`
  );
  console.log(checkCPF.rows[0]);
  if (checkCPF.rows[0]) return res.status(409).send("Esse usuário já existe");

  res.locals.client = client;

  next();
}

// {
//   "name": "João fulano4",
//   "phone" : "23456789101" ,
//   "cpf": "19873455009",
//   "birthday": "1992-10-05"
// }

// {
//   "customerId": 1,
//   "gameId": 2,
//    "daysRented": 5
//  }

// {
//   "name": "jogo da velha",
//   "image" : "www.//" ,
//   "stockTotal": 4,
//   "pricePerDay": 2000
// }
