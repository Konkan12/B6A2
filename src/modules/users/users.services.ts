import { JwtPayload } from "jsonwebtoken";
import { pool } from "../../config/db";

const getAllUsers = async () => {
  const result = await pool.query(`
    SELECT id, name, email, phone, role FROM users;
    `);
  return result;
};

const updateUser = async (
  id: string,
  payload: Record<string, unknown>,
  loggedInUser: JwtPayload
) => {
  if (loggedInUser.id != id && loggedInUser.role !== "admin") {
    throw new Error("You are not authorized to update this user");
  }

  const targetUser = await pool.query(
    `
        SELECT * FROM users WHERE id = $1
        `,
    [id]
  );

  if (targetUser.rows.length === 0) {
    throw new Error(`User with id ${id} not found`);
  }

  if (loggedInUser.role !== "admin" && payload?.role) {
    delete payload.role;
  }

  const updatedUser = {
    ...targetUser.rows[0],
    ...payload,
    id: targetUser.rows[0].id,
  };
  const { name, email, password, phone, role } = updatedUser;

  const result = await pool.query(
    `
        UPDATE users SET name = $1, email = $2, password = $3, phone = $4, role = $5 WHERE id = $6 RETURNING *

        `,
    [name, email, password, phone, role, id]
  );
  return result;
};

const deleteUserById = async (id: string) => {
  const targetUser = await pool.query(
    `
        SELECT * FROM users WHERE id = $1
        `,
    [id]
  );

  if (targetUser.rows.length === 0) {
    throw new Error(`User with id ${id} not found`);
  }
  const user = await pool.query(
    `
        SELECT * FROM bookings WHERE customer_id = $1
        `,
    [id]
  );
  if (user.rows.length !== 0) {
    throw new Error("User has active bookings");
  }
  const result = await pool.query(
    `
        DELETE FROM users WHERE id = $1
        `,
    [id]
  );
  return result;
};

export const userServices = {
  getAllUsers,
  updateUser,
  deleteUserById,
};