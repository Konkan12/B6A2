import { JwtPayload } from "jsonwebtoken";
import { pool } from "../../config/db";
import calculateBookingPrice from "../../helper/calculateBookingPrice";
import autoReturnExpiredBookings from "../../helper/autoReturnExpiredBookings";

const createBooking = async (
  payload: Record<string, unknown>,
  loggedInUser: JwtPayload
) => {
  const { vehicle_id, rent_start_date, rent_end_date } = payload;
  const customer_id = loggedInUser.id;

  const vehicle = await pool.query(`SELECT * FROM vehicles WHERE id = $1`, [
    vehicle_id,
  ]);

  if (vehicle.rows.length === 0) {
    throw new Error("Vehicle not found");
  }

  if (vehicle.rows[0].availability_status !== "available") {
    throw new Error("Vehicle is not available");
  }

  const total_price = calculateBookingPrice(
    rent_start_date as string,
    rent_end_date as string,
    Number(vehicle.rows[0].daily_rent_price)
  );

  const result = await pool.query(
    `
    INSERT INTO bookings
    (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status)
    VALUES ($1, $2, $3, $4, $5, 'active')
    RETURNING *
    `,
    [customer_id, vehicle_id, rent_start_date, rent_end_date, total_price]
  );

  await pool.query(
    `UPDATE vehicles SET availability_status = 'booked' WHERE id = $1`,
    [vehicle_id]
  );

  return result.rows[0];
};

const updateBooking = async (
  loggedInUser: JwtPayload,
  bookingId: string,
  payload: Record<string, unknown>
) => {
  const booking = await pool.query(`SELECT * FROM bookings WHERE id = $1`, [
    bookingId,
  ]);

  if (booking.rows.length === 0) {
    throw new Error("Booking not found");
  }

  if (loggedInUser.role === "customer") {
    if (loggedInUser.id !== booking.rows[0].customer_id) {
      throw new Error("Unauthorized");
    }

    if (payload.status !== "canceled") {
      throw new Error("Only cancellation allowed");
    }

    const startDate = new Date(booking.rows[0].rent_start_date);
    if (new Date() >= startDate) {
      throw new Error("Cannot cancel after start date");
    }

    const result = await pool.query(
      `UPDATE bookings SET status='canceled' WHERE id=$1 RETURNING *`,
      [bookingId]
    );

    await pool.query(
      `UPDATE vehicles SET availability_status='available' WHERE id=$1`,
      [booking.rows[0].vehicle_id]
    );

    return { success: true, data: result.rows[0] };
  }

  if (loggedInUser.role === "admin") {
    if (payload.status !== "returned") {
      throw new Error("Admin can only mark returned");
    }

    const result = await pool.query(
      `UPDATE bookings SET status='returned' WHERE id=$1 RETURNING *`,
      [bookingId]
    );

    await pool.query(
      `UPDATE vehicles SET availability_status='available' WHERE id=$1`,
      [booking.rows[0].vehicle_id]
    );

    return { success: true, data: result.rows[0] };
  }
};

const getAllBookings = async (loggedInUser: JwtPayload) => {
  await autoReturnExpiredBookings();

  if (loggedInUser.role === "admin") {
    const result = await pool.query(`
      SELECT * FROM bookings ORDER BY id
    `);
    return { success: true, data: result.rows };
  }

  const result = await pool.query(
    `SELECT * FROM bookings WHERE customer_id = $1 ORDER BY id`,
    [loggedInUser.id]
  );

  return { success: true, data: result.rows };
};

export const bookingServices = {
  createBooking,
  updateBooking,
  getAllBookings,
};
