import { Router } from "express";
import { bookingController } from "./bookings.controller";
import auth from "../../middleware/auth";


const router = Router();

router.post(
  "/bookings",
  auth("admin", "customer"),
  bookingController.createBooking
);
router.get(
  "/bookings",
  auth("admin", "customer"),
  bookingController.getAllBookings
);
router.put(
  "/bookings/:bookingId",
  auth("admin", "customer"),
  bookingController.updateBooking
);

export const bookingRoutes = router;