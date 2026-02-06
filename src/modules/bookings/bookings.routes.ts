import { Router } from "express";
import { bookingController } from "./bookings.controller";
import auth from "../../middleware/auth";


const router = Router();
// create booking 
router.post(
  "/bookings",
  auth("admin", "customer"),
  bookingController.createBooking
);
// get all bookings
router.get(
  "/bookings",
  auth("admin", "customer"),
  bookingController.getAllBookings
);
// updatte booking
router.put(
  "/bookings/:bookingId",
  auth("admin", "customer"),
  bookingController.updateBooking
);

export const bookingRoutes = router;