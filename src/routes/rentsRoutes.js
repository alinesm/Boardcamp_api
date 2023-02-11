import { Router } from "express";
import {
  deleteRental,
  finalizeRental,
  findRents,
  registerRent,
} from "../controllers/rentController.js";
import { rentalSchemaValidation } from "../middlewares/rentMiddleware.js";

const router = Router();

router.get("/rentals", findRents);
router.post("/rentals", rentalSchemaValidation, registerRent);
router.post("/rentals/:id/return", finalizeRental);
router.delete("/rentals/:id", deleteRental);

export default router;
