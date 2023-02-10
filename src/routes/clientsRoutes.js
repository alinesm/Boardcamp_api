import { Router } from "express";
import {
  findClients,
  getClienttById,
  registerClient,
  // updateClient,
} from "../controllers/clientsController.js";
import { clientSchemaValidation } from "../middlewares/clientsMiddleware.js";

const router = Router();

router.get("/customers", findClients);
router.get("/customers/:id", getClienttById);
router.post("/customers", clientSchemaValidation, registerClient);
// router.put("/customers/:id", updateClient);

export default router;
