import mysql from "mysql2/promise";

import pool from "../db";
import myRaw from "../utils/myRaw";
import { deleteObjectByKey } from "../utils/s3multer";

// !: Add paymentes logic
const detailUser = async (req, res) => {
  const { recordId } = req.user;

  const sql = mysql.format(
    `SELECT U.*, D.name AS district_name, J.name AS job_name, M.name AS major_name, S.name AS sns_api_name from users AS U
        LEFT JOIN district AS D ON U.district_id=D.id
        LEFT JOIN job AS J ON U.job_id=J.id
        LEFT JOIN major AS M ON U.major_id=M.id
        JOIN sns_api AS S ON U.sns_api_id=S.id
        WHERE 1=1 ?`,
    [myRaw.where.uId(recordId)]
  );
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const [[exUser]] = await connection.query(sql);
    if (!exUser) {
      res.status(403).json({ message: "RECORD NOT EXISTS" });
    }

    res.status(200).json(exUser);
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

// ?: Is this essential? this is just a part of updateUser.
const updateUserOnRegister = async (req, res) => {
  const { recordId } = req.user;
  const { isAllowingAds, name, districtId, jobId, majorId } = req.body;

  const checkExSql = mysql.format(
    `SELECT id FROM users
        WHERE 1=1 ?`,
    [myRaw.where.id(recordId)]
  );
  // !: Modify SET part. let's handle only changed items by the client.
  const updateSql = mysql.format(
    `UPDATE users AS U
            SET is_allowing_ads=?, name=?, district_id=?, job_id=?, major_id=?
            WHERE 1=1 ?`,
    [isAllowingAds, name, districtId, jobId, majorId, myRaw.where.uId(recordId)]
  );
  const connection = await pool.getConnection(async (conn) => conn);

  const [[exUser]] = await connection.query(checkExSql);
  if (!exUser) {
    res.status(403).json({ message: "RECORD NOT EXISTS" });
  }
  await connection.query(updateSql);

  res.status(200).end();
};

const putUserImage = async (req, res) => {
  const { recordId } = req.user;
  if (!req.file) {
    return res.status(403).json({ message: "OMISSION IN FILE" });
  }

  const { location } = req.file;
  const checkExSql = mysql.format(
    `SELECT id, image_url FROM users
        WHERE 1=1 ?`,
    [myRaw.where.id(recordId)]
  );
  const updateSql = mysql.format(
    `UPDATE users
        SET image_url=?
        WHERE 1=1 ?`,
    [location, myRaw.where.id(recordId)]
  );
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const [[exUser]] = await connection.query(checkExSql);
    if (!exUser) {
      return res.status(403).json({ message: "RECORD NOT EXISTS" });
    } else if (exUser.id !== recordId) {
      return res.status(403).json({ message: "INVALID USER" });
    }

    await connection.query(updateSql);

    if (exUser.image_url) {
      const Key = exUser.image_url.split(".com/")[1];
      deleteObjectByKey(Key);
    }

    return res.status(200).json({ location });
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

export { detailUser, updateUserOnRegister, putUserImage };
