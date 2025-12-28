import { Router } from "express";


import { vehicleController } from "./vehiciles.controller";
import auth from "../../middleware/auth";

const router = Router();

router.get("/vehicles", vehicleController.getAllVehicles);
router.get("/vehicles/:id", vehicleController.getVehicleById);
router.post("/vehicles", auth("admin"), vehicleController.addNewVehicle);
router.put("/vehicles/:id", auth("admin"), vehicleController.updateVehicleById);
router.delete(
  "/vehicles/:id",
  auth("admin"),
  vehicleController.deleteVehicleById
);

export const vehicleRoutes = router;