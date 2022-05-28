import mysql from "mysql2/promise";

import pool from "../db";
import myRaw from "../utils/myRaw";

const randomAdvertisement = async (req, res) => {
  const sql = mysql.format(
    `SELECT *
            FROM advertisements
            ORDER BY RAND()
            LIMIT 1`
  );
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const [[result]] = await connection.query(sql);
    res.status(200).json(result);
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

export { randomAdvertisement };
