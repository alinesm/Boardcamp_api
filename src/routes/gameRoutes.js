import { Router } from "express";
import { createGame, findGames } from "../controllers/gameController.js";
import { gameSchemaValidation } from "../middlewares/gameMiddleware.js";

const router = Router();

router.get("/games", findGames);
router.post("/games", gameSchemaValidation, createGame);

export default router;
