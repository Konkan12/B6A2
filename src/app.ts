import express, { Request, Response } from "express";
import sendJson from "./helper/sendJson";
import { initDB } from "./config/db";
import { vehicleRoutes } from "./modules/vehicles/vehicles.routes";
import { userRoutes } from "./modules/users/users.routes";
import { authRoutes } from "./modules/auth/auth.routes";
import { bookingRoutes } from "./modules/bookings/bookings.routes";

const app = express();
const baseURL = "/api/v1";

// Parser
app.use(express.json());
// DB
initDB();

app.get("/", (req: Request, res: Response) => {
  const data = {
    success: true,
    message: "Root path, Server is running",
    data: null,
  };
  sendJson(res, data, 200);
});

// vehicle routes
app.use(baseURL, vehicleRoutes);

// user routes
app.use(baseURL, userRoutes);

// auth routes
app.use(baseURL, authRoutes);

// booking routes
app.use(baseURL, bookingRoutes);

// Not found route
app.use((req: Request, res: Response) => {
  const data = {
    success: false,
    message: "Unknown path",
    error: "Path does not exist",
  };
  sendJson(res, data, 404);
});

export default app;