import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const config = {
  port: process.env.PORT,
  connection_string: process.env.CONNECTION_STRING,
  jwt_secret: process.env.JWT_SECRET,
};

export default config;