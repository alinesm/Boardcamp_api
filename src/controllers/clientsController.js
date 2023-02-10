import { db } from "../database/database.js";

export async function findClients(req, res) {
  try {
    const clients = await db.query("SELECT * FROM customers");
    console.log(clients.rows);
    res.send(clients.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Houve um problema no servidor");
  }
}

export async function registerClient(req, res) {
  const { name, phone, cpf, birthday } = res.locals.client;

  try {
    await db.query(
      `INSERT INTO customers (name, phone, cpf, birthday) VALUES ( '${name}', '${phone}', '${cpf}', '${birthday}')`
    );
    res.status(201).send("customer inserido com sucesso");
  } catch (error) {
    console.error(error);
    res.status(500).send("Houve um problema no servidor");
  }
}

export async function getClienttById(req, res) {
  const { id } = req.params;

  // Se o cliente com id dado não existir, deve responder com status 404

  const checkCustomerId = await db.query(
    `SELECT name FROM customers WHERE id= '${id}'`
  );
  // console.log(checkCustomerId.rows[0]);
  if (!checkCustomerId.rows[0])
    return res.status(404).send("Esse cliente não existe");

  try {
    const customers = await db.query(`SELECT * FROM customers WHERE id = $1;`, [
      id,
    ]);
    res.send(customers.rows[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

// export async function updateClient(req, res) {
//   try {
//     const { id } = req.params;

//     // const customer = await db.collection('customers').findOne({ _id: new ObjectId(id) });

//     if (!customer) {
//       return res.sendStatus(404);
//     }

//     // await db.collection('customers').updateOne({ _id: customer._id }, { $set: req.body });

//     res.sendStatus(200);
//   } catch (err) {
//     console.log(err);
//     res.sendStatus(500);
//   }
// }
