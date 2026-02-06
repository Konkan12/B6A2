import { pool } from "../../config/db";

const getAllVehicles = async () => {
  return pool.query(`SELECT * FROM vehicles`);
};

const addNewVehicle = async (payload: Record<string, unknown>) => {
  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
  } = payload;

  return pool.query(
    `
    INSERT INTO vehicles
    (vehicle_name, type, registration_number, daily_rent_price, availability_status)
    VALUES ($1, $2, $3, $4, 'available')
    RETURNING *
    `,
    [vehicle_name, type, registration_number, daily_rent_price]
  );
};

const getVehicleById = async (id: string) => {
  return pool.query(`SELECT * FROM vehicles WHERE id=$1`, [id]);
};

const updateVehicleById = async (id: string, payload: Record<string, unknown>) => {
  const vehicle = await pool.query(`SELECT * FROM vehicles WHERE id=$1`, [id]);

  if (vehicle.rows.length === 0) {
    throw new Error("Vehicle not found");
  }

  const updated = { ...vehicle.rows[0], ...payload };

  return pool.query(
    `
    UPDATE vehicles
    SET vehicle_name=$1, type=$2, registration_number=$3,
        daily_rent_price=$4, availability_status=$5
    WHERE id=$6
    RETURNING *
    `,
    [
      updated.vehicle_name,
      updated.type,
      updated.registration_number,
      updated.daily_rent_price,
      updated.availability_status,
      id,
    ]
  );
};

const deleteVehicleById = async (id: string) => {
  const vehicle = await pool.query(`SELECT * FROM vehicles WHERE id=$1`, [id]);

  if (vehicle.rows.length === 0) {
    throw new Error("Vehicle not found");
  }

  if (vehicle.rows[0].availability_status === "booked") {
    throw new Error("Vehicle is currently booked");
  }

  return pool.query(`DELETE FROM vehicles WHERE id=$1`, [id]);
};

export const vehicleServices = {
  getAllVehicles,
  addNewVehicle,
  getVehicleById,
  updateVehicleById,
  deleteVehicleById,
};
