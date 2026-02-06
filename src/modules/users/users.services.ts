import bcrypt from "bcryptjs";
import { JwtPayload } from "jsonwebtoken";
import { pool } from "../../config/db";

const getAllUsers = async () => {
  return pool.query(`SELECT id, name, email, phone, role FROM users`);
};

const updateUser = async (
  id: string,
  payload: Record<string, unknown>,
  loggedInUser: JwtPayload
) => {
  if (loggedInUser.id != id && loggedInUser.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const user = await pool.query(`SELECT * FROM users WHERE id=$1`, [id]);
  if (user.rows.length === 0) throw new Error("User not found");

  if (payload.password) {
    payload.password = await bcrypt.hash(payload.password as string, 10);
  }

  if (loggedInUser.role !== "admin") {
    delete payload.role;
  }

  const updated = { ...user.rows[0], ...payload };

  return pool.query(
    `
    UPDATE users
    SET name=$1, email=$2, password=$3, phone=$4, role=$5
    WHERE id=$6
    RETURNING id, name, email, phone, role
    `,
    [
      updated.name,
      updated.email,
      updated.password,
      updated.phone,
      updated.role,
      id,
    ]
  );
};

const deleteUserById = async (id: string) => {
  const activeBooking = await pool.query(
    `SELECT * FROM bookings WHERE customer_id=$1 AND status='active'`,
    [id]
  );

  if (activeBooking.rows.length > 0) {
    throw new Error("User has active bookings");
  }

  return pool.query(`DELETE FROM users WHERE id=$1`, [id]);
};

export const userServices = {
  getAllUsers,
  updateUser,
  deleteUserById,
};
