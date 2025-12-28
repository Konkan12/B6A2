import { Pool } from "pg";
const pool = new Pool();


const getAllVehicles = async () => {
  const result = await pool.query(`
        SELECT * FROM vehicles;
        `);
  return result;
};

const addNewVehicle = async (payload: Record<string, unknown>) => {
  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  } = payload;
  const result = await pool.query(
    `
        INSERT INTO vehicles
        (vehicle_name, type, registration_number, daily_rent_price, availability_status)
         VALUES ($1, $2, $3, $4, $5) RETURNING *
    `,
    [
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
    ]
  );

  return result;
};

const getVehicleById = async (id: string) => {
  const result = await pool.query(`SELECT * FROM vehicles WHERE id=$1`, [id]);
  return result;
};

const updateVehicleById = async (
  id: string,
  payload: Record<string, unknown>
) => {
  const vehicle = await pool.query(
    `
        SELECT * FROM vehicles WHERE id=$1
        `,
    [id]
  );

  if (vehicle.rows.length === 0) {
    throw new Error(`Vehicle with id ${id} not found`);
  }

  const updatedVehicle = {
    ...vehicle.rows[0],
    ...payload,
    id: vehicle.rows[0].id,
  };

  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  } = updatedVehicle;

  const result = await pool.query(
    `
    UPDATE vehicles
    SET vehicle_name = $1, type = $2, registration_number = $3, daily_rent_price = $4, availability_status = $5
    WHERE id = $6 RETURNING *
    `,
    [
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status,
      id,
    ]
  );

  return result;
};

const deleteVehicleById = async (id: string) => {
  const vehicle = await pool.query(
    `
    SELECT * FROM vehicles WHERE id=$1
    `,
    [id]
  );
  if (vehicle.rows[0].availability_status === "booked") {
    throw new Error("Cannot delete a vehicle that is currently booked");
  }
  const result = await pool.query(
    `
        DELETE FROM vehicles WHERE id = $1
        `,
    [id]
  );
  return result;
};

export const vehicleServices = {
  addNewVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicleById,
  deleteVehicleById,
};