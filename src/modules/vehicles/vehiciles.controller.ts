import { Request, Response } from "express";

import { vehicleServices } from "./vehicles.service";
import sendJson from "../../helper/sendJson";

const getAllVehicles = async (req: Request, res: Response) => {
  try {
    const result = await vehicleServices.getAllVehicles();
    if (result.rows.length === 0) {
      const data = {
        success: true,
        message: "No vehicles found",
        data: [],
      };
      sendJson(res, data, 200);
    } else {
      const data = {
        success: true,
        message: "Vehicles retrieved successfully",
        data: result.rows,
      };
      sendJson(res, data, 200);
    }
  } catch (error: any) {
    const data = {
      success: false,
      message: "Failed to retrieved vehicles",
      error: error.message,
    };
    sendJson(res, data, 500);
  }
};

const getVehicleById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await vehicleServices.getVehicleById(id as string);
    if (result.rows.length === 0) {
      const data = {
        success: false,
        message: `Vehicle with id ${id} not found`,
        data: [],
      };
      sendJson(res, data, 404);
    } else {
      const data = {
        success: true,
        message: "Vehicle retrieved successfully",
        data: result.rows[0],
      };
      sendJson(res, data, 200);
    }
  } catch (error: any) {
    const data = {
      success: false,
      message: "Could not find the vehicle",
      error: error.message,
    };
    sendJson(res, data, 404);
  }
};

const addNewVehicle = async (req: Request, res: Response) => {
  const payload = req.body;
  try {
    const result = await vehicleServices.addNewVehicle(payload);
    if (result.rows.length === 0) {
      const data = {
        success: false,
        message: "Failed to add new vehicle",
        error:
          "Required filed values might be missing or does not meet the constrains",
      };
      sendJson(res, data, 500);
    } else {
      const data = {
        success: true,
        message: "Vehicle created successfully",
        data: result.rows[0],
      };

      sendJson(res, data, 201);
    }
  } catch (error: any) {
    const data = {
      success: false,
      message: "Failed to add new vehicle",
      error: error.message,
    };
    sendJson(res, data, 500);
  }
};

const updateVehicleById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await vehicleServices.updateVehicleById(
      id as string,
      req.body
    );
    sendJson(res, result.rows[0], 200);
  } catch (error: any) {
    const data = {
      success: false,
      message: "Failed to update vehicle",
      error: error.message,
    };
    sendJson(res, data, 500);
  }
};

const deleteVehicleById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await vehicleServices.deleteVehicleById(id as string);
    if (result.rowCount === 0) {
      const data = {
        success: false,
        message: "Vehicle was not found",
      };
      sendJson(res, data, 404);
      return;
    }
    const data = {
      success: true,
      message: "Vehicle deleted successfully",
    };
    sendJson(res, data, 200);
  } catch (error: any) {
    const data = {
      success: false,
      message: "Failed to delete vehicle",
      error: error.message,
    };
    sendJson(res, data, 500);
  }
};

export const vehicleController = {
  addNewVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicleById,
  deleteVehicleById,
};