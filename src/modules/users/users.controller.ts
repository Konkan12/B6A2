import { Request, Response } from "express";
import { userServices } from "./users.services";

import { JwtPayload } from "jsonwebtoken";
import sendJson from "../../helper/sendJson";

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await userServices.getAllUsers();
    if (result.rows.length === 0) {
      const data = {
        success: true,
        message: "No users found",
        data: [],
      };
      sendJson(res, data, 200);
    } else {
      const data = {
        success: true,
        message: "Users retrieved successfully",
        data: result.rows,
      };
      sendJson(res, data, 200);
    }
  } catch (error: any) {
    const data = {
      success: false,
      message: "Failed to retrieved users",
      error: error.message,
    };
    sendJson(res, data, 500);
  }
};

const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await userServices.updateUser(
      id as string,
      req.body,
      req.user as JwtPayload
    );
    const data = {
      success: true,
      message: "User updated successfully",
      data: result.rows[0],
    };
    sendJson(res, data, 200);
  } catch (error: any) {
    const data = {
      success: false,
      message: "Failed to update user",
      error: error.message,
    };
    sendJson(res, data, 500);
  }
};

const deleteUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await userServices.deleteUserById(id!);
    const data = {
      success: true,
      message: "User deleted successfully",
    };
    sendJson(res, data, 200);
  } catch (error: any) {
    const data = {
      success: false,
      message: "Failed to delete user",
      error: error.message,
    };
    sendJson(res, data, 500);
  }
};

export const userController = {
  getAllUsers,
  updateUser,
  deleteUserById,
};