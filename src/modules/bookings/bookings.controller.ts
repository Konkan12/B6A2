import { Request, Response } from "express";
import { bookingServices } from "./bookings.service";

import { JwtPayload } from "jsonwebtoken";
import sendJson from "../../helper/sendJson";

const createBooking = async (req: Request, res: Response) => {
  try {
    const result = await bookingServices.createBooking(
      req.body,
      req.user as JwtPayload
    );
    const data = {
      success: true,
      message: "Booking created successfully",
      data: result,
    };
    sendJson(res, data, 201);
  } catch (error: any) {
    const data = {
      success: false,
      message: "Failed to create booking",
      error: error.message,
    };
    sendJson(res, data, 500);
  }
};

const updateBooking = async (req: Request, res: Response) => {
  const { bookingId } = req.params;
  try {
    const result = await bookingServices.updateBooking(
      req.user as JwtPayload,
      bookingId as string,
      req.body
    );
    sendJson(res, result, 200);
  } catch (error: any) {
    const data = {
      success: false,
      message: "Failed to update booking",
      error: error.message,
    };
    sendJson(res, data, 500);
  }
};

const getAllBookings = async (req: Request, res: Response) => {
  try {
    const result = await bookingServices.getAllBookings(req.user as JwtPayload);
    sendJson(res, result, 200);
  } catch (error: any) {
    const data = {
      success: false,
      message: "Failed to get all bookings",
      error: error.message,
    };
    sendJson(res, data, 500);
  }
};

export const bookingController = {
  createBooking,
  updateBooking,
  getAllBookings,
};