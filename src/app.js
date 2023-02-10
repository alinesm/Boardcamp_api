import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import clientsRoutes from "./routes/clientsRoutes.js";
import gameRoutes from "./routes/gameRoutes.js";
import rentsRoutes from "./routes/rentsRoutes.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.use([clientsRoutes, gameRoutes, rentsRoutes]);

const port = 5000;
app.listen(port, () => console.log(`Server running in port ${port}`));
