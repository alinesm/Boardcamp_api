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

  const checkCPF = await db.query(
    `SELECT name FROM customers WHERE cpf= '${cpf}'`
  );

  if (checkCPF.rowCount > 0)
    return res.status(409).send("Esse usuário já existe");

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

  const checkCustomerId = await db.query(
    `SELECT name FROM customers WHERE id= '${id}'`
  );

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

export async function updateClient(req, res) {
  const { id } = req.params;
  const { name, phone, cpf, birthday } = res.locals.client;

  const cpfExists = await db.query(
    "SELECT cpf FROM customers where cpf = $1 AND id <> $2 ",
    [cpf, id]
  );
  if (cpfExists.rowCount !== 0)
    return res.status(409).send("CPF já cadastrado");

  try {
    await db.query(
      "UPDATE customers SET name= $1, phone = $2, cpf = $3, birthday = $4 WHERE id = $5",
      [name, phone, cpf, birthday, id]
    );
    return res.status(200).send("OK");
  } catch (error) {
    console.log(error.message);
    return res.status(500).send("Erro interno");
  }
}
