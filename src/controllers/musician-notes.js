import mysql from "mysql2/promise";

import pool from "../db";
import myRaw from "../utils/myRaw";
import { constants } from "../utils/musician-notes";

// detail note
const detailMusicianNote = async (req, res) => {
  const { noteId } = req.params;

  const selectNoteSql = mysql.format(myRaw.select.musicianNote, [
    myRaw.where.noteId(noteId),
  ]);
  const updateViewCountSql = mysql.format(myRaw.update.musicianNoteViewCount, [
    myRaw.where.noteId(noteId),
  ]);
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const [[note]] = await connection.query(selectNoteSql);

    if (!note) {
      return res.status(403).json({ message: "RECORD NOT EXISTS" });
    }
    await connection.query(updateViewCountSql);

    return res.status(200).json({ note });
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

// detail musician
const detailMusicianProfile = async (req, res) => {
  const { musicianId } = req.params;

  const selectMusicianSql = mysql.format(myRaw.select.musicianProfile, [
    myRaw.where.id(musicianId),
  ]);
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const [[musician]] = await connection.query(selectMusicianSql);

    if (!musician) {
      return res.status(403).json({ message: "RECORD NOT EXISTS" });
    }
    if (musician.role_id !== constants.MUSICIAN_ROLE_ID) {
      return res.status(403).json({ message: "WRONG MUSICIAN" });
    }

    return res.status(200).json({ musician });
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

// list notes
const listMusicianNotes = async (req, res) => {
  const { limit, page, order } = req.query;

  const LIMIT = limit ? limit : constants.DEFAULT_LIMIT;
  const OFFSET = page ? LIMIT * (page - 1) : constants.DEFAULT_OFFSET;

  const selectNotesSql = mysql.format(myRaw.select.musicianNotes, [
    myRaw.orderBy.any(order),
    myRaw.base.limitOffset(LIMIT, OFFSET),
  ]);
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const [notes] = await connection.query(selectNotesSql);

    return res.status(200).json({ notes });
  } catch (error) {
    return res.status(403).json({ name: error.name, message: error.message });
  } finally {
    connection.release();
  }
};

// list all main page contents
const listAllMainPage = async (req, res) => {
  const {
    limit,
    page,
    popularLimit,
    popularPage,
    interviewLimit,
    interviewPage,
    musicianLimit,
    musicianPage,
  } = req.query;

  const LIMIT = limit ? limit : constants.DEFAULT_LIMIT;
  const OFFSET = page ? LIMIT * (page - 1) : constants.DEFAULT_OFFSET;
  const POPULAR_LIMIT = popularLimit
    ? popularLimit
    : constants.DEFAULT_POPULAR_LIMIT;
  const POPULAR_OFFSET = popularPage
    ? POPULAR_LIMIT * (popularPage - 1)
    : constants.DEFAULT_OFFSET;
  const INTERVIEW_LIMIT = interviewLimit
    ? interviewLimit
    : constants.DEFAULT_LIMIT;
  const INTERVIEW_OFFSET = interviewPage
    ? INTERVIEW_LIMIT * (interviewPage - 1)
    : constants.DEFAULT_OFFSET;
  const MUSICIAN_LIMIT = musicianLimit
    ? musicianLimit
    : constants.DEFAULT_MUSICIAN_LIMIT;
  const MUSICIAN_OFFSET = musicianPage
    ? MUSICIAN_LIMIT * (musicianPage - 1)
    : constants.DEFAULT_OFFSET;

  const selectRecentNotesSql = mysql.format(myRaw.select.recentMusicianNotes, [
    myRaw.base.limitOffset(LIMIT, OFFSET),
  ]);
  const selectPopularNotesSql = mysql.format(
    myRaw.select.popularMusicianNotes,
    [myRaw.base.limitOffset(POPULAR_LIMIT, POPULAR_OFFSET)]
  );
  const selectInterviewsSql = mysql.format(myRaw.select.musicianInterviews, [
    myRaw.base.limitOffset(INTERVIEW_LIMIT, INTERVIEW_OFFSET),
  ]);
  const selectMusiciansSql = mysql.format(myRaw.select.recommendedMusicians, [
    myRaw.base.limitOffset(MUSICIAN_LIMIT, MUSICIAN_OFFSET),
  ]);

  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const [commonNotes] = await connection.query(selectRecentNotesSql);
    const [popularNotes] = await connection.query(selectPopularNotesSql);
    const [musicians] = await connection.query(selectMusiciansSql);
    const [interviews] = await connection.query(selectInterviewsSql);

    return res
      .status(200)
      .json({ commonNotes, popularNotes, musicians, interviews });
  } catch (error) {
    return res.status(403).json({ name: error.name, message: error.message });
  } finally {
    connection.release();
  }
};

// list all musician channel contents
const listAllMusicianChannel = async (req, res) => {
  const { musicianId } = req.params;
  const { limit, page, order, musicianLimit, musicianPage } = req.query;

  const LIMIT = limit ? limit : constants.DEFAULT_LIMIT;
  const OFFSET = page ? LIMIT * (page - 1) : constants.DEFAULT_OFFSET;
  const MUSICIAN_LIMIT = musicianLimit
    ? musicianLimit
    : constants.DEFAULT_MUSICIAN_LIMIT;
  const MUSICIAN_OFFSET = musicianPage
    ? MUSICIAN_LIMIT * (musicianPage - 1)
    : constants.DEFAULT_OFFSET;

  const selectNotesSql = mysql.format(myRaw.select.musicianNotes, [
    myRaw.orderBy.any(order),
    myRaw.base.limitOffset(LIMIT, OFFSET),
  ]);
  const selectMusicianSql = mysql.format(myRaw.select.musicianProfile, [
    myRaw.where.id(musicianId),
  ]);
  const selectMusiciansSql = mysql.format(myRaw.select.recommendedMusicians, [
    myRaw.base.limitOffset(MUSICIAN_LIMIT, MUSICIAN_OFFSET),
  ]);

  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const [notes] = await connection.query(selectNotesSql);
    const [[musician]] = await connection.query(selectMusicianSql);
    const [musicians] = await connection.query(selectMusiciansSql);

    if (!musician) {
      return res.status(403).json({ message: "RECORD NOT EXISTS" });
    }
    if (musician.role_id !== constants.MUSICIAN_ROLE_ID) {
      return res.status(403).json({ message: "WRONG MUSICIAN" });
    }

    return res.status(200).json({ musician, musicians, notes });
  } catch (error) {
    return res.status(403).json({ name: error.name, message: error.message });
  } finally {
    connection.release();
  }
};

// recommend notes (random)
const recommendMusicianNotes = async (req, res) => {
  const { noteId } = req.params;
  const { limit, page } = req.query;

  const LIMIT = limit ? limit : constants.DEFAULT_LIMIT;
  const OFFSET = page ? LIMIT * (page - 1) : constants.DEFAULT_OFFSET;

  const selectNotesSql = mysql.format(myRaw.select.recommendedMusicianNotes, [
    myRaw.where.noteIdNot(noteId),
    myRaw.base.limitOffset(LIMIT, OFFSET),
  ]);
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const [notes] = await connection.query(selectNotesSql);
    return res.status(200).json({ notes });
  } catch (error) {
    return res.status(403).json({ name: error.name, message: error.message });
  } finally {
    connection.release();
  }
};

// recommend musicians (random)
const recommendMusicians = async (req, res) => {
  const { limit, page } = req.query;

  const LIMIT = limit ? limit : constants.DEFAULT_MUSICIAN_LIMIT;
  const OFFSET = page ? LIMIT * (page - 1) : constants.DEFAULT_OFFSET;

  const selectMusiciansSql = mysql.format(myRaw.select.recommendedMusicians, [
    myRaw.base.limitOffset(LIMIT, OFFSET),
  ]);
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const [musicians] = await connection.query(selectMusiciansSql);
    return res.status(200).json({ musicians });
  } catch (error) {
    return res.status(403).json({ name: error.name, message: error.message });
  } finally {
    connection.release();
  }
};

// permission level : only for admin
// create
const createMusicianNote = async (req, res) => {
  const { userId, title, content, thumbnailImageUrl } = req.body;
  const essential = [userId, title, content];

  if (essential.includes(undefined)) {
    return res.status(403).json({ message: "OMISSION IN BODY" });
  }

  const jsonContent = JSON.stringify(content);
  const insertNoteSql = mysql.format(myRaw.insert.musicianNote, [
    userId,
    title,
    jsonContent,
    thumbnailImageUrl,
  ]);
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const [{ insertId }] = await connection.query(insertNoteSql);
    return res.status(201).json({ insertId });
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

// update
const updateMusicianNote = async (req, res) => {
  const { noteId } = req.params;
  const { userId, title, content, thumbnailImageUrl } = req.body;
  const essential = [userId, title, content];

  if (essential.includes(undefined)) {
    return res.status(403).json({ message: "OMISSION IN BODY" });
  }

  const jsonContent = JSON.stringify(content);
  const checkExNoteSql = mysql.format(myRaw.select.exMusicianNote, [
    myRaw.where.noteId(noteId),
  ]);
  const updateNoteSql = mysql.format(myRaw.update.musicianNote, [
    userId,
    title,
    jsonContent,
    thumbnailImageUrl,
    myRaw.where.noteId(noteId),
  ]);
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const [[exNote]] = await connection.query(checkExNoteSql);

    if (!exNote) {
      return res.status(403).json({ message: "RECORD NOT EXISTS" });
    }

    await connection.query(updateNoteSql);
    return res.status(204).end();
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

// delete
const deleteMusicianNote = async (req, res) => {
  const { noteId } = req.params;

  const checkExNoteSql = mysql.format(myRaw.select.exMusicianNote, [
    myRaw.where.noteId(noteId),
  ]);
  const deleteNoteSql = mysql.format(myRaw.delete.musicianNote, [
    myRaw.where.noteId(noteId),
  ]);
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const [[exNote]] = await connection.query(checkExNoteSql);
    if (!exNote) {
      return res.status(403).json({ message: "RECORD NOT EXISTS" });
    }

    await connection.query(deleteNoteSql);
    return res.status(204).end();
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

// image
const putMusicianNoteImage = async (req, res) => {
  if (!req.file) {
    return res.status(403).json({ message: "OMISSION IN FILE" });
  }
  const { location: imageUrl } = req.file;

  return res.status(200).json({ imageUrl });
};

export {
  detailMusicianNote,
  detailMusicianProfile,
  listMusicianNotes,
  listAllMainPage,
  listAllMusicianChannel,
  recommendMusicianNotes,
  recommendMusicians,
  createMusicianNote,
  updateMusicianNote,
  deleteMusicianNote,
  putMusicianNoteImage,
};
