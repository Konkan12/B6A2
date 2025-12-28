
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../../config";
import { pool } from "../../config/db";

const userRegistration = async (payload: Record<string, unknown>) => {
  const { name, email, password, phone, role } = payload;
  const hashedPassword = await bcrypt.hash(password as string, 10);
  const result = await pool.query(
    `
        INSERT INTO users(name, email, password, phone, role) VALUES($1, $2, $3, $4, $5) RETURNING *
        `,
    [name, email, hashedPassword, phone, role]
  );

  return result;
};

const userLogin = async (email: string, password: string) => {
  const result = await pool.query(
    `
        SELECT * FROM users WHERE email = $1`,
    [email]
  );

  if (result.rows.length === 0) throw new Error("User not found");
  const user = result.rows[0];
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) throw new Error("Invalid password");

  const token = jwt.sign(
    {
      name: user.name,
      email: user.email,
      role: user.role,
      id: user.id,
    },
    config.jwt_secret as string,
    {
      expiresIn: "7d",
    }
  );

  return { user, token };
};

export const authServices = {
  userRegistration,
  userLogin,
};