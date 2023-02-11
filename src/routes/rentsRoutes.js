import { Router } from "express";
import {
  deleteRental,
  finalizeRental,
  findRents,
  registerRental,
} from "../controllers/rentController.js";
import { rentalSchemaValidation } from "../middlewares/rentMiddleware.js";

const router = Router();

router.get("/rentals", findRents);
router.post("/rentals", rentalSchemaValidation, registerRental);
router.post("/rentals/:id/return", finalizeRental);
router.delete("/rentals/:id", deleteRental);

export default router;
