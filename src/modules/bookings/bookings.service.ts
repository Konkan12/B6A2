import { JwtPayload } from "jsonwebtoken";
import { Pool } from "pg";
const pool = new Pool();
import calculateBookingPrice from "../../helper/calculateBookingPrice";
import autoReturnExpiredBookings from "../../helper/autoReturnExpiredBookings";


const createBooking = async (
  payload: Record<string, unknown>,
  loggedInUser: JwtPayload
) => {
  const { customer_id, vehicle_id, rent_start_date, rent_end_date } = payload;

  const customer = await pool.query(`SELECT * FROM users WHERE id = $1`, [
    customer_id,
  ]);

  if (loggedInUser.id != customer.rows[0].id) {
    throw new Error("You are not authorized to book vehicles for other users");
  }

  const vehicle = await pool.query(`SELECT * FROM vehicles WHERE id = $1`, [
    vehicle_id,
  ]);

  if (vehicle.rows.length === 0) {
    throw new Error("Vehicle not found");
  }

  const { vehicle_name, daily_rent_price, availability_status } =
    vehicle.rows[0];

  if (availability_status !== "available") {
    throw new Error("Vehicle is not available for booking");
  }

  const total_price = calculateBookingPrice(
    rent_start_date as string,
    rent_end_date as string,
    daily_rent_price as number
  );

  const result = await pool.query(
    `
        INSERT INTO bookings(customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status) VALUES($1, $2, $3, $4, $5, $6) RETURNING *
    `,
    [
      customer_id,
      vehicle_id,
      rent_start_date,
      rent_end_date,
      total_price,
      "active",
    ]
  );

  const updateVehicleStatus = await pool.query(
    `   
        UPDATE vehicles SET availability_status = 'booked' WHERE id = $1
    `,
    [vehicle_id]
  );

  const data = {
    ...result.rows[0],
    rent_start_date,
    rent_end_date,
    vehicle: {
      vehicle_name,
      daily_rent_price: Number(daily_rent_price),
    },
  };

  return data;
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
    if (loggedInUser.id != booking.rows[0].customer_id) {
      throw new Error("You are not authorized to update other user's booking");
    }

    if (payload.status !== "canceled") {
      throw new Error("You can only cancel a booking");
    }

    const today = new Date();
    const startDate = new Date(booking.rows[0].rent_start_date);

    if (today >= startDate) {
      throw new Error("Cannot cancel after the start date");
    }

    const result = await pool.query(
      `
      UPDATE bookings 
      SET status = 'canceled'
      WHERE id = $1
      RETURNING *
      `,
      [bookingId]
    );

    return {
      success: true,
      message: "Booking canceled successfully",
      data: result.rows[0],
    };
  }

  if (loggedInUser.role === "admin") {
    if (payload.status !== "returned") {
      throw new Error("Admin can only update to 'returned'");
    }

    const updatedBooking = await pool.query(
      `
      UPDATE bookings 
      SET status = 'returned'
      WHERE id = $1
      RETURNING *
      `,
      [bookingId]
    );

    await pool.query(
      `
      UPDATE vehicles
      SET availability_status = 'available'
      WHERE id = $1
      `,
      [booking.rows[0].vehicle_id]
    );

    return {
      success: true,
      message: "Booking marked as returned. Vehicle is now available",
      data: {
        ...updatedBooking.rows[0],
        vehicle: {
          availability_status: "available",
        },
      },
    };
  }
};

const getAllBookings = async (loggedInUser: JwtPayload) => {
  autoReturnExpiredBookings();
  let transformed;

  if (loggedInUser.role !== "admin") {
    const customerBookings = await pool.query(
      `
      SELECT 
        b.*,
        u.name AS customer_name,
        u.email AS customer_email,
        v.vehicle_name,
        v.registration_number,
        v.type
      FROM bookings b
      JOIN users u ON b.customer_id = u.id
      JOIN vehicles v ON b.vehicle_id = v.id
      WHERE b.customer_id = $1
      ORDER BY b.id
      `,
      [loggedInUser.id]
    );

    transformed = customerBookings.rows.map((row) => ({
      id: row.id,
      vehicle_id: row.vehicle_id,
      rent_start_date: row.rent_start_date.toISOString().split("T")[0],
      rent_end_date: row.rent_end_date.toISOString().split("T")[0],
      total_price: row.total_price,
      status: row.status,

      vehicle: {
        vehicle_name: row.vehicle_name,
        registration_number: row.registration_number,
        type: row.type,
      },
    }));

    return {
      success: true,
      message: "Your bookings retrieved successfully",
      data: transformed,
    };
  } else {
    const adminBookings = await pool.query(`
      SELECT 
        b.*,
        u.name AS customer_name,
        u.email AS customer_email,
        v.vehicle_name,
        v.registration_number
      FROM bookings b
      JOIN users u ON b.customer_id = u.id
      JOIN vehicles v ON b.vehicle_id = v.id
      ORDER BY b.id
    `);
    const transformed = adminBookings.rows.map((row) => ({
      id: row.id,
      customer_id: row.customer_id,
      vehicle_id: row.vehicle_id,
      rent_start_date: row.rent_start_date.toISOString().split("T")[0],
      rent_end_date: row.rent_end_date.toISOString().split("T")[0],
      total_price: row.total_price,
      status: row.status,

      customer: {
        name: row.customer_name,
        email: row.customer_email,
      },

      vehicle: {
        vehicle_name: row.vehicle_name,
        registration_number: row.registration_number,
      },
    }));

    return {
      success: true,
      message: "Bookings retrieved successfully",
      data: transformed,
    };
  }
};

export const bookingServices = {
  createBooking,
  updateBooking,
  getAllBookings,
};