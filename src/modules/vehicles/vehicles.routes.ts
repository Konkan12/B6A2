import { Router } from "express";


import { vehicleController } from "./vehiciles.controller";
import auth from "../../middleware/auth";

const router = Router();
//all
router.get("/vehicles", vehicleController.getAllVehicles);
//singel
router.get("/vehicles/:id", vehicleController.getVehicleById);
//create post admin only
router.post("/vehicles", auth("admin"), vehicleController.addNewVehicle);
//update update admin only
router.put("/vehicles/:id", auth("admin"), vehicleController.updateVehicleById);
//delete admin only
router.delete(
  "/vehicles/:id",
  auth("admin"),
  vehicleController.deleteVehicleById
);

export const vehicleRoutes = router;