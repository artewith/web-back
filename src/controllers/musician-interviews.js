import mysql from "mysql2/promise";

import pool from "../db";
import myRaw from "../utils/myRaw";
import { constants } from "../utils/musician-notes";

// detail
const detailMusicianInterview = async (req, res) => {
  const { interviewId } = req.params;

  const selectInterviewSql = mysql.format(myRaw.select.musicianInterview, [
    myRaw.where.interviewId(interviewId),
  ]);
  const updateViewCountSql = mysql.format(
    myRaw.update.musicianInterviewViewCount,
    [myRaw.where.interviewId(interviewId)]
  );
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const [[interview]] = await connection.query(selectInterviewSql);

    if (!interview) {
      return res.status(403).json({ message: "RECORD NOT EXISTS" });
    }
    await connection.query(updateViewCountSql);

    return res.status(200).json({ interview });
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

// list
const listMusicianInterviews = async (req, res) => {
  const { limit, page, order } = req.query;

  const LIMIT = limit ? limit : constants.DEFAULT_LIMIT;
  const OFFSET = page ? LIMIT * (page - 1) : constants.DEFAULT_OFFSET;

  const selectInterviewsSql = mysql.format(myRaw.select.musicianInterviews, [
    myRaw.orderBy.any(order),
    myRaw.base.limitOffset(LIMIT, OFFSET),
  ]);
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const [interviews] = await connection.query(selectInterviewsSql);

    return res.status(200).json({ interviews });
  } catch (error) {
    return res.status(403).json({ name: error.name, message: error.message });
  } finally {
    connection.release();
  }
};

// recommend
const recommendMusicianInterviews = async (req, res) => {
  const { interviewId } = req.params;
  const { limit, page } = req.query;

  const LIMIT = limit ? limit : constants.DEFAULT_LIMIT;
  const OFFSET = page ? LIMIT * (page - 1) : constants.DEFAULT_OFFSET;

  const selectInterviewsSql = mysql.format(
    myRaw.select.recommendedMusicianInterviews,
    [
      myRaw.where.interviewIdNot(interviewId),
      myRaw.base.limitOffset(LIMIT, OFFSET),
    ]
  );
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const [interviews] = await connection.query(selectInterviewsSql);
    return res.status(200).json({ interviews });
  } catch (error) {
    return res.status(403).json({ name: error.name, message: error.message });
  } finally {
    connection.release();
  }
};

// create
const createMusicianInterview = async (req, res) => {
  const { userId, title, subTitle, content, thumbnailImageUrl } = req.body;
  const essential = [userId, title, content];

  if (essential.includes(undefined)) {
    return res.status(403).json({ message: "OMISSION IN BODY" });
  }

  const jsonContent = JSON.stringify(content);
  const insertInterviewSql = mysql.format(myRaw.insert.musicianInterview, [
    userId,
    title,
    subTitle,
    jsonContent,
    thumbnailImageUrl,
  ]);
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const [{ insertId }] = await connection.query(insertInterviewSql);
    return res.status(201).json({ insertId });
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

// update
const updateMusicianInterview = async (req, res) => {
  const { interviewId } = req.params;
  const { userId, title, subTitle, content, thumbnailImageUrl } = req.body;
  const essential = [userId, title, content];

  if (essential.includes(undefined)) {
    return res.status(403).json({ message: "OMISSION IN BODY" });
  }

  const jsonContent = JSON.stringify(content);
  const checkExInterviewSql = mysql.format(myRaw.select.exMusicianInterview, [
    myRaw.where.interviewId(interviewId),
  ]);
  const updateInterviewSql = mysql.format(myRaw.update.musicianInterview, [
    userId,
    title,
    subTitle,
    jsonContent,
    thumbnailImageUrl,
    myRaw.where.interviewId(interviewId),
  ]);
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const [[exInterview]] = await connection.query(checkExInterviewSql);

    if (!exInterview) {
      return res.status(403).json({ message: "RECORD NOT EXISTS" });
    }

    await connection.query(updateInterviewSql);
    return res.status(204).end();
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

// delete
const deleteMusicianInterview = async (req, res) => {
  const { interviewId } = req.params;

  const checkExInterviewSql = mysql.format(myRaw.select.exMusicianInterview, [
    myRaw.where.interviewId(interviewId),
  ]);
  const deleteInterviewSql = mysql.format(myRaw.delete.musicianInterview, [
    myRaw.where.interviewId(interviewId),
  ]);
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const [[exInterview]] = await connection.query(checkExInterviewSql);
    if (!exInterview) {
      return res.status(403).json({ message: "RECORD NOT EXISTS" });
    }

    await connection.query(deleteInterviewSql);
    return res.status(204).end();
  } catch (error) {
    return res.status(403).json({ name: error.name, message: error.message });
  } finally {
    connection.release();
  }
};

// image
const putMusicianInterviewImage = async (req, res) => {
  if (!req.file) {
    return res.status(403).json({ message: "OMISSION IN FILE" });
  }
  const { location: imageUrl } = req.file;

  return res.status(200).json({ imageUrl });
};

export {
  listMusicianInterviews,
  detailMusicianInterview,
  recommendMusicianInterviews,
  createMusicianInterview,
  updateMusicianInterview,
  deleteMusicianInterview,
  putMusicianInterviewImage,
};
