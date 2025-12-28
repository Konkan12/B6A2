import { pool } from "../config/db";

const autoReturnExpiredBookings = async () => {
  const result = await pool.query(`
    SELECT * FROM bookings 
    WHERE status = 'active'
    AND rent_end_date < NOW()::date
  `);

  for (const b of result.rows) {
    await pool.query(`UPDATE bookings SET status = 'returned' WHERE id = $1`, [
      b.id,
    ]);
    await pool.query(
      `UPDATE vehicles SET availability_status = 'available' WHERE id = $1`,
      [b.vehicle_id]
    );
  }
};

export default autoReturnExpiredBookings;