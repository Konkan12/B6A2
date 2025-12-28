import { Request, Response } from "express";
import { authServices } from "./auth.service";
import sendJson from "../../helper/sendJson";


const userRegistration = async (req: Request, res: Response) => {
  try {
    const result = await authServices.userRegistration(req.body);
    if (result.rows.length === 0) {
      const data = {
        success: false,
        message: "Failed to register user",
        error:
          "Required filed values might be missing or does not meet the constrains",
      };
      sendJson(res, data, 500);
    }
    const userData = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      email: result.rows[0].email,
      phone: result.rows[0].phone,
      role: result.rows[0].role,
    };
    const data = {
      success: true,
      message: "User registered successfully",
      data: userData,
    };
    sendJson(res, data, 201);
  } catch (error: any) {
    const data = {
      success: false,
      message: "Failed to register user",
      error: error.message,
    };
    sendJson(res, data, 500);
  }
};

const userLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const result = await authServices.userLogin(email, password);
    const { user, token } = result;
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };
    const data = {
      success: true,
      message: "Login successful",
      data: {
        token,
        user: userData,
      },
    };
    sendJson(res, data, 200);
  } catch (error: any) {
    const data = {
      success: false,
      message: "Login failed",
      error: error.message,
    };
    sendJson(res, data, 500);
  }
};
export const authConroller = {
  userRegistration,
  userLogin,
};