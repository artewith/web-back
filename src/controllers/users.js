import mysql from "mysql2/promise";

import pool from "../db";
import myRaw from "../utils/myRaw";

// read user profile
const detailUser = async (req, res) => {
  const { userId } = req.user;

  const sql = mysql.format(myRaw.select.userProfile, [myRaw.where.uId(userId)]);
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const [[userProfile]] = await connection.query(sql);
    if (!userProfile) {
      res.status(403).json({ message: "RECORD NOT EXISTS" });
    }

    res.status(200).json({ userProfile });
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

// update user profile
const updateInitialUserProfile = async (req, res) => {
  const { userId } = req.user;
  const { isAllowingAds, name, districtId, majorId, gender, imageUrl } =
    req.body;
  const essential = [name, isAllowingAds];

  if (essential.includes(undefined)) {
    return res.status(403).json({ message: "OMISSION IN BODY" });
  }

  const checkExSql = mysql.format(myRaw.select.exUser, [userId]);
  const updateSql = mysql.format(myRaw.update.initialUserProfile, [
    isAllowingAds,
    name,
    districtId,
    majorId,
    gender,
    imageUrl,
    myRaw.where.uId(userId),
  ]);
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const [[exUser]] = await connection.query(checkExSql);
    if (!exUser) {
      res.status(403).json({ message: "RECORD NOT EXISTS" });
    }
    await connection.query(updateSql);

    res.status(204).end();
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

const updateUserProfile = async (req, res) => {
  const { userId } = req.user;
  const {
    isAllowingAds,
    name,
    email,
    phoneNumber,
    districtId,
    majorId,
    gender,
    school,
    description,
    imageUrl,
  } = req.body;
  const essential = [name, email];

  if (essential.includes(undefined)) {
    return res.status(403).json({ message: "OMISSION IN BODY" });
  }

  const checkExSql = mysql.format(myRaw.select.exUser, [userId]);
  const updateSql = mysql.format(myRaw.update.userProfile, [
    isAllowingAds,
    name,
    email,
    phoneNumber,
    districtId,
    majorId,
    gender,
    school,
    description,
    imageUrl,
    myRaw.where.uId(userId),
  ]);
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const [[exUser]] = await connection.query(checkExSql);
    if (!exUser) {
      res.status(403).json({ message: "RECORD NOT EXISTS" });
    }
    await connection.query(updateSql);

    res.status(204).end();
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

// image
const putUserImage = async (req, res) => {
  if (!req.file) {
    return res.status(403).json({ message: "OMISSION IN FILE" });
  }
  const { location: imageUrl } = req.file;

  return res.status(200).json({ imageUrl });
};

export {
  detailUser,
  updateUserProfile,
  updateInitialUserProfile,
  putUserImage,
};
