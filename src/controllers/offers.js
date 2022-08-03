import mysql from "mysql2/promise";

import pool from "../db";
import myRaw from "../utils/myRaw";
import { constants, functions } from "../utils/offers";
import { deleteObjectByKey } from "../utils/s3multer";

// detail
const detailLessonResume = async (req, res) => {
  const { offerId } = req.params;

  const offerSql = mysql.format(myRaw.select.lessonResume, [
    myRaw.where.offerId(offerId),
  ]);
  const educationsSql = mysql.format(myRaw.select.l_educations, [
    myRaw.where.resumeIdRefer(offerId),
  ]);
  const lecturesSql = mysql.format(myRaw.select.l_lectures, [
    myRaw.where.resumeIdRefer(offerId),
  ]);
  const updateViewCountSql = mysql.format(myRaw.update.lessonResumeViewCount, [
    myRaw.where.id(offerId),
  ]);

  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const [[resume]] = await connection.query(offerSql);
    if (!resume) {
      return res.status(403).json({ message: "RECORD NOT EXISTS" });
    }
    const [educations] = await connection.query(educationsSql);
    const [lectures] = await connection.query(lecturesSql);
    await connection.query(updateViewCountSql);

    return res.status(200).json({ resume, educations, lectures });
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

const detailAccompanistResume = async (req, res) => {
  const { offerId } = req.params;

  const offerSql = mysql.format(myRaw.select.accompanistResume, [
    myRaw.where.offerId(offerId),
  ]);
  const educationsSql = mysql.format(myRaw.select.a_educations, [
    myRaw.where.resumeIdRefer(offerId),
  ]);
  const lecturesSql = mysql.format(myRaw.select.a_lectures, [
    myRaw.where.resumeIdRefer(offerId),
  ]);
  const updateViewCountSql = mysql.format(
    myRaw.update.accompanistResumeViewCount,
    [myRaw.where.id(offerId)]
  );

  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const [[resume]] = await connection.query(offerSql);
    if (!resume) {
      return res.status(403).json({ message: "RECORD NOT EXISTS" });
    }
    const [educations] = await connection.query(educationsSql);
    const [lectures] = await connection.query(lecturesSql);
    await connection.query(updateViewCountSql);

    return res.status(200).json({ resume, educations, lectures });
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

const detailTutorRecruit = async (req, res) => {
  const { offerId } = req.params;

  const offerSql = mysql.format(myRaw.select.tutorRecruit, [
    myRaw.where.offerId(offerId),
  ]);
  const updateViewCountSql = mysql.format(myRaw.update.tutorRecruitViewCount, [
    myRaw.where.id(offerId),
  ]);

  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const [[recruit]] = await connection.query(offerSql);
    if (!recruit) {
      return res.status(403).json({ message: "RECORD NOT EXISTS" });
    }
    await connection.query(updateViewCountSql);

    return res.status(200).json({ recruit });
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

const detailAccompanistRecruit = async (req, res) => {
  const { offerId } = req.params;

  const offerSql = mysql.format(myRaw.select.accompanistRecruit, [
    myRaw.where.offerId(offerId),
  ]);
  const updateViewCountSql = mysql.format(
    myRaw.update.accompanistRecruitViewCount,
    [myRaw.where.id(offerId)]
  );

  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const [[recruit]] = await connection.query(offerSql);
    if (!recruit) {
      return res.status(403).json({ message: "RECORD NOT EXISTS" });
    }
    await connection.query(updateViewCountSql);

    return res.status(200).json({ recruit });
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

// list
const listLessonResumes = async (req, res) => {
  const {
    limit,
    page,
    selectedLimit,
    selectedPage,
    districtIds,
    cityIds,
    majorIds,
    workExperience,
    gender,
    minHourlyWage,
    maxHourlyWage,
    hasLectured,
  } = req.query;

  const LIMIT = limit ? limit : constants.DEFAULT_LIMIT;
  const OFFSET = page ? LIMIT * (page - 1) : constants.DEFAULT_OFFSET;
  const SELECTED_LIMIT = selectedLimit
    ? selectedLimit
    : constants.DEFAULT_SELECTED_LIMIT;
  const SELECTED_OFFSET = selectedPage
    ? SELECTED_LIMIT * (selectedPage - 1)
    : constants.DEFAULT_OFFSET;
  const convertedDistrictIds = functions.convertParamsToArray(districtIds);
  const convertedCityIds = functions.convertParamsToArray(cityIds);
  const convertedMajorIds = functions.convertParamsToArray(majorIds);
  const now = new Date();

  const commonOfferSql = mysql.format(myRaw.select.commonLessonResumes, [
    myRaw.where.districtIds(convertedDistrictIds, convertedCityIds),
    myRaw.where.workExperiences(workExperience),
    myRaw.where.majorIds(convertedMajorIds),
    myRaw.where.gender(gender),
    myRaw.where.hourlyWage(minHourlyWage, maxHourlyWage),
    myRaw.where.hasLectured(hasLectured),
    myRaw.base.limitOffset(LIMIT, OFFSET),
  ]);
  const selectedOfferSql = mysql.format(myRaw.select.selectedLessonResumes, [
    myRaw.where.selectedUntil(now),
    myRaw.base.limitOffset(SELECTED_LIMIT, SELECTED_OFFSET),
  ]);

  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const [common] = await connection.query(commonOfferSql);
    const [selected] = await connection.query(selectedOfferSql);

    return res.status(200).json({ common, selected });
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

const listAccompanistResumes = async (req, res) => {
  const {
    limit,
    page,
    selectedLimit,
    selectedPage,
    districtIds,
    cityIds,
    workExperience,
    minHourlyWage,
    maxHourlyWage,
  } = req.query;

  const LIMIT = limit ? limit : constants.DEFAULT_LIMIT;
  const OFFSET = page ? LIMIT * (page - 1) : constants.DEFAULT_OFFSET;
  const SELECTED_LIMIT = selectedLimit
    ? selectedLimit
    : constants.DEFAULT_SELECTED_LIMIT;
  const SELECTED_OFFSET = selectedPage
    ? SELECTED_LIMIT * (selectedPage - 1)
    : constants.DEFAULT_OFFSET;
  const convertedDistrictIds = functions.convertParamsToArray(districtIds);
  const convertedCityIds = functions.convertParamsToArray(cityIds);
  const now = new Date();

  const commonOfferSql = mysql.format(myRaw.select.commonAccompanistResumes, [
    myRaw.where.districtIds(convertedDistrictIds, convertedCityIds),
    myRaw.where.workExperiences(workExperience),
    myRaw.where.hourlyWage(minHourlyWage, maxHourlyWage),
    myRaw.base.limitOffset(LIMIT, OFFSET),
  ]);
  const selectedOfferSql = mysql.format(myRaw.select.selectedLessonResumes, [
    myRaw.where.selectedUntil(now),
    myRaw.base.limitOffset(SELECTED_LIMIT, SELECTED_OFFSET),
  ]);

  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const [common] = await connection.query(commonOfferSql);
    const [selected] = await connection.query(selectedOfferSql);

    return res.status(200).json({ common, selected });
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

const listTutorRecruits = async (req, res) => {
  const {
    limit,
    page,
    selectedLimit,
    selectedPage,
    districtIds,
    cityIds,
    workForm,
    minHourlyWage,
    maxHourlyWage,
  } = req.query;

  const LIMIT = limit ? limit : constants.DEFAULT_LIMIT;
  const OFFSET = page ? LIMIT * (page - 1) : constants.DEFAULT_OFFSET;
  const SELECTED_LIMIT = selectedLimit
    ? selectedLimit
    : constants.DEFAULT_SELECTED_LIMIT;
  const SELECTED_OFFSET = selectedPage
    ? SELECTED_LIMIT * (selectedPage - 1)
    : constants.DEFAULT_OFFSET;
  const convertedDistrictIds = functions.convertParamsToArray(districtIds);
  const convertedCityIds = functions.convertParamsToArray(cityIds);
  const now = new Date();

  const commonOfferSql = mysql.format(myRaw.select.commonTutorRecruits, [
    myRaw.where.districtIds(convertedDistrictIds, convertedCityIds),
    myRaw.where.workForm(workForm),
    myRaw.where.hourlyWage(minHourlyWage, maxHourlyWage),
    myRaw.base.limitOffset(LIMIT, OFFSET),
  ]);
  const selectedOfferSql = mysql.format(myRaw.select.selectedTutorRecruits, [
    myRaw.where.selectedUntil(now),
    myRaw.base.limitOffset(SELECTED_LIMIT, SELECTED_OFFSET),
  ]);

  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const [common] = await connection.query(commonOfferSql);
    const [selected] = await connection.query(selectedOfferSql);

    return res.status(200).json({ common, selected });
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

const listAccompanistRecruits = async (req, res) => {
  const {
    limit,
    page,
    selectedLimit,
    selectedPage,
    districtIds,
    cityIds,
    majorIds,
    minHourlyWage,
    maxHourlyWage,
  } = req.query;

  const LIMIT = limit ? limit : constants.DEFAULT_LIMIT;
  const OFFSET = page ? LIMIT * (page - 1) : constants.DEFAULT_OFFSET;
  const SELECTED_LIMIT = selectedLimit
    ? selectedLimit
    : constants.DEFAULT_SELECTED_LIMIT;
  const SELECTED_OFFSET = selectedPage
    ? SELECTED_LIMIT * (selectedPage - 1)
    : constants.DEFAULT_OFFSET;
  const convertedDistrictIds = functions.convertParamsToArray(districtIds);
  const convertedCityIds = functions.convertParamsToArray(cityIds);
  const convertedMajorIds = functions.convertParamsToArray(majorIds);
  const now = new Date();

  const commonOfferSql = mysql.format(myRaw.select.commonAccompanistRecruits, [
    myRaw.where.districtIds(convertedDistrictIds, convertedCityIds),
    myRaw.where.majorIds(convertedMajorIds),
    myRaw.where.hourlyWage(minHourlyWage, maxHourlyWage),
    myRaw.base.limitOffset(LIMIT, OFFSET),
  ]);
  const selectedOfferSql = mysql.format(
    myRaw.select.selectedAccompanistRecruits,
    [
      myRaw.where.selectedUntil(now),
      myRaw.base.limitOffset(SELECTED_LIMIT, SELECTED_OFFSET),
    ]
  );

  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const [common] = await connection.query(commonOfferSql);
    const [selected] = await connection.query(selectedOfferSql);

    return res.status(200).json({ common, selected });
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

// recommend
const recommendLessonResumes = async (req, res) => {
  const { offerId } = req.params;

  const LIMIT = req.query.limit
    ? req.query.limit
    : constants.DEFAULT_RECOMMEND_LIMIT;
  const OFFSET = req.query.page
    ? LIMIT * (req.query.page - 1)
    : constants.DEFAULT_OFFSET;

  const sql = mysql.format(myRaw.select.recommendLessonResumes, [
    myRaw.where.districtIdsByOfferId(offerId, "lesson_resumes"),
    myRaw.where.offerIdNot(offerId),
    myRaw.base.limitOffset(LIMIT, OFFSET),
  ]);

  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const [result] = await connection.query(sql);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

const recommendAccompanistResumes = async (req, res) => {
  const { offerId } = req.params;

  const LIMIT = req.query.limit
    ? req.query.limit
    : constants.DEFAULT_RECOMMEND_LIMIT;
  const OFFSET = req.query.page
    ? LIMIT * (req.query.page - 1)
    : constants.DEFAULT_OFFSET;

  const sql = mysql.format(myRaw.select.recommendAccompanistResumes, [
    myRaw.where.districtIdsByOfferId(offerId, "accompanist_resumes"),
    myRaw.where.offerIdNot(offerId),
    myRaw.base.limitOffset(LIMIT, OFFSET),
  ]);

  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const [result] = await connection.query(sql);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

const recommendTutorRecruits = async (req, res) => {
  const { offerId } = req.params;

  const LIMIT = req.query.limit
    ? req.query.limit
    : constants.DEFAULT_RECOMMEND_LIMIT;
  const OFFSET = req.query.page
    ? LIMIT * (req.query.page - 1)
    : constants.DEFAULT_OFFSET;

  const sql = mysql.format(myRaw.select.recommendTutorRecruits, [
    myRaw.where.districtIdsByOfferId(offerId, "tutor_recruits"),
    myRaw.where.offerIdNot(offerId),
    myRaw.base.limitOffset(LIMIT, OFFSET),
  ]);

  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const [result] = await connection.query(sql);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

const recommendAccompanistRecruits = async (req, res) => {
  const { offerId } = req.params;

  const LIMIT = req.query.limit
    ? req.query.limit
    : constants.DEFAULT_RECOMMEND_LIMIT;
  const OFFSET = req.query.page
    ? LIMIT * (req.query.page - 1)
    : constants.DEFAULT_OFFSET;

  const sql = mysql.format(myRaw.select.recommendAccompanistRecruits, [
    myRaw.where.districtIdsByOfferId(offerId, "accompanist_recruits"),
    myRaw.where.offerIdNot(offerId),
    myRaw.base.limitOffset(LIMIT, OFFSET),
  ]);

  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const [result] = await connection.query(sql);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

// create
const createLessonResume = async (req, res) => {
  const {
    districtId,
    majorId,
    title,
    description,
    contactA,
    contactB,
    contactC,
    contactD,
    hourlyWage,
    isNegotiable,
    workExperience,
    gender,
    lectures,
    educations,
    imageUrl,
  } = req.body;
  const essential = [
    title,
    districtId,
    hourlyWage,
    description,
    isNegotiable,
    workExperience,
    contactA,
  ];

  if (essential.includes(undefined))
    return res.status(403).json({ message: "OMISSION IN REQUEST BODY" });
  if (educations) {
    for (const { institution, major, isRepresentative } of educations) {
      if ([institution, major, isRepresentative].includes(undefined)) {
        return res.status(403).json({ message: "OMISSION IN educations" });
      }
    }
  }
  if (lectures) {
    for (const { institution, isRepresentative } of lectures) {
      if ([institution, isRepresentative].includes(undefined)) {
        return res.status(403).json({ message: "OMISSION IN lectures" });
      }
    }
  }

  const insertSql = mysql.format(myRaw.insert.lessoneResume, [
    req.user.id,
    districtId,
    majorId,
    title,
    description,
    contactA,
    contactB,
    contactC,
    contactD,
    hourlyWage,
    isNegotiable,
    workExperience,
    gender,
    imageUrl,
  ]);
  const checkExSql = mysql.format(myRaw.select.exLessonResume, [
    myRaw.where.userId(req.user.id),
  ]);

  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const [[resume]] = await connection.query(checkExSql);
    if (resume)
      return res.status(403).json({ message: "RECORD ALREADY EXISTS" });

    const [{ insertId }] = await connection.query(insertSql);

    for (const { institution, isRepresentative } of lectures) {
      const sql = mysql.format(myRaw.insert.l_lectures, [
        insertId,
        institution,
        isRepresentative,
      ]);
      await connection.query(sql);
    }
    for (const { institution, major, degree, isRepresentative } of educations) {
      const sql = mysql.format(myRaw.insert.l_educations, [
        insertId,
        institution,
        major,
        degree,
        isRepresentative,
      ]);
      await connection.query(sql);
    }

    return res.status(200).json({ message: "insert success.", insertId });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
};

const createAccompanistResume = async (req, res) => {
  const {
    districtId,
    majorId,
    title,
    description,
    contactA,
    contactB,
    contactC,
    contactD,
    hourlyWage,
    isNegotiable,
    workExperience,
    imageUrl,
    educations,
    lectures,
  } = req.body;
  const essential = [
    title,
    districtId,
    hourlyWage,
    description,
    isNegotiable,
    workExperience,
    contactA,
  ];

  if (essential.includes(undefined))
    return res.status(403).json({ message: "OMISSION IN REQUEST BODY" });
  if (educations) {
    for (const { institution, major, isRepresentative } of educations) {
      if ([institution, major, isRepresentative].includes(undefined)) {
        return res.status(403).json({ message: "OMISSION IN educations" });
      }
    }
  }
  if (lectures) {
    for (const { institution, isRepresentative } of lectures) {
      if ([institution, isRepresentative].includes(undefined)) {
        return res.status(403).json({ message: "OMISSION IN lectures" });
      }
    }
  }

  const insertSql = mysql.format(myRaw.insert.accompanistResume, [
    req.user.id,
    districtId,
    majorId,
    title,
    description,
    contactA,
    contactB,
    contactC,
    contactD,
    hourlyWage,
    isNegotiable,
    workExperience,
    imageUrl,
  ]);
  const checkExSql = mysql.format(myRaw.select.exAccompanistResume, [
    myRaw.where.userId(req.user.id),
  ]);

  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const [[resume]] = await connection.query(checkExSql);
    if (resume)
      return res.status(403).json({ message: "RECORD ALREADY EXISTS" });

    const [{ insertId }] = await connection.query(insertSql);

    for (const { institution, isRepresentative } of lectures) {
      const sql = mysql.format(myRaw.insert.a_lectures, [
        insertId,
        institution,
        isRepresentative,
      ]);
      await connection.query(sql);
    }
    for (const { institution, major, degree, isRepresentative } of educations) {
      const sql = mysql.format(myRaw.insert.a_educations, [
        insertId,
        institution,
        major,
        degree,
        isRepresentative,
      ]);
      await connection.query(sql);
    }

    return res.status(200).json({ message: "insert success.", insertId });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
};

const createTutorRecruit = async (req, res) => {
  const {
    districtId,
    title,
    description,
    contactA,
    contactB,
    contactC,
    contactD,
    hourlyWage,
    isNegotiable,
    direction,
    institution,
    monthlyWage,
    workForm,
    imageUrl,
  } = req.body;
  const essential = [
    title,
    districtId,
    hourlyWage,
    description,
    isNegotiable,
    institution,
    workForm,
    contactA,
  ];

  if (essential.includes(undefined))
    return res.status(403).json({ message: "OMISSION IN REQUEST BODY" });

  const insertSql = mysql.format(myRaw.insert.tutorRecruit, [
    req.user.id,
    districtId,
    title,
    description,
    hourlyWage,
    isNegotiable,
    contactA,
    contactB,
    contactC,
    contactD,
    institution,
    monthlyWage,
    direction,
    workForm,
    imageUrl,
  ]);
  const checkExSql = mysql.format(myRaw.select.exTutorRecruit, [
    myRaw.where.userId(req.user.id),
  ]);

  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const [[recruit]] = await connection.query(checkExSql);
    if (recruit)
      return res.status(403).json({ message: "RECORD ALREADY EXISTS" });

    const [{ insertId }] = await connection.query(insertSql);

    return res.status(200).json({ message: "insert success.", insertId });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
};

const createAccompanistRecruit = async (req, res) => {
  const {
    districtId,
    majorId,
    title,
    description,
    hourlyWage,
    isNegotiable,
    contactA,
    contactB,
    contactC,
    contactD,
    imageUrl,
  } = req.body;
  const essential = [
    title,
    districtId,
    majorId,
    hourlyWage,
    description,
    isNegotiable,
    contactA,
  ];

  if (essential.includes(undefined))
    return res.status(403).json({ message: "OMISSION IN REQUEST BODY" });

  const insertSql = mysql.format(myRaw.insert.accompanistRecruit, [
    req.user.id,
    districtId,
    majorId,
    title,
    description,
    hourlyWage,
    isNegotiable,
    contactA,
    contactB,
    contactC,
    contactD,
    imageUrl,
  ]);
  const checkExSql = mysql.format(myRaw.select.exAccompanistRecruit, [
    myRaw.where.userId(req.user.id),
  ]);

  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const [[recruit]] = await connection.query(checkExSql);
    if (recruit)
      return res.status(403).json({ message: "RECORD ALREADY EXISTS" });

    const [{ insertId }] = await connection.query(insertSql);

    return res.status(200).json({ message: "insert success.", insertId });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
};

// update
const updateLessonResume = async (req, res) => {
  const { offerId } = req.params;
  const {
    districtId,
    majorId,
    title,
    description,
    hourlyWage,
    isNegotiable,
    contactA,
    contactB,
    contactC,
    contactD,
    workExperience,
    gender,
    lectures,
    educations,
    imageUrl,
  } = req.body;
  const essential = [
    title,
    districtId,
    hourlyWage,
    description,
    isNegotiable,
    contactA,
  ];

  if (essential.includes(undefined))
    return res.status(403).json({ message: "OMISSION IN REQUEST BODY" });

  if (educations) {
    for (const {
      isDeleted,
      institution,
      major,
      isRepresentative,
    } of educations) {
      if (isDeleted) continue;
      if ([institution, major, isRepresentative].includes(undefined)) {
        return res.status(403).json({ message: "OMISSION IN educations" });
      }
    }
  }
  if (lectures) {
    for (const { isDeleted, institution, isRepresentative } of lectures) {
      if (isDeleted) continue;
      if ([institution, isRepresentative].includes(undefined)) {
        return res.status(403).json({ message: "OMISSION IN lectures" });
      }
    }
  }

  const checkExSql = mysql.format(myRaw.select.exLessonResume, [
    myRaw.where.id(offerId),
  ]);
  const updateSql = mysql.format(myRaw.update.lessonResume, [
    districtId,
    majorId,
    title,
    description,
    hourlyWage,
    isNegotiable,
    contactA,
    contactB,
    contactC,
    contactD,
    workExperience,
    gender,
    imageUrl,
    myRaw.where.id(offerId),
  ]);

  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const [[exOffer]] = await connection.query(checkExSql);
    if (!exOffer) return res.status(403).json({ message: "RECORD NOT EXISTS" });
    if (exOffer.user_id !== req.user.id)
      return res.status(403).json({ message: "INVALID USER" });

    await connection.query(updateSql);

    for (const {
      id,
      isDeleted,
      isNew,
      institution,
      major,
      degree,
      isRepresentative,
    } of educations) {
      if (id) {
        if (isDeleted) {
          const deleteSql = mysql.format(myRaw.delete.l_educations, [
            myRaw.where.id(id),
          ]);
          await connection.query(deleteSql);
        } else {
          const updateSql = mysql.format(myRaw.update.l_educations, [
            institution,
            major,
            degree,
            isRepresentative,
            myRaw.where.id(id),
          ]);
          await connection.query(updateSql);
        }
      } else if (isNew) {
        const insertSql = mysql.format(myRaw.insert.l_educations, [
          offerId,
          institution,
          major,
          degree,
          isRepresentative,
        ]);
        await connection.query(insertSql);
      }
    }
    for (const {
      id,
      isDeleted,
      isNew,
      institution,
      isRepresentative,
    } of lectures) {
      if (id) {
        if (isDeleted) {
          const deleteSql = mysql.format(myRaw.delete.l_lectures, [
            myRaw.where.id(id),
          ]);
          await connection.query(deleteSql);
        } else {
          const updateSql = mysql.format(myRaw.update.l_lectures, [
            institution,
            isRepresentative,
            myRaw.where.id(id),
          ]);
          await connection.query(updateSql);
        }
      } else if (isNew) {
        const insertSql = mysql.format(
          myRaw.insert.l_lectures,

          [offerId, institution, isRepresentative]
        );
        await connection.query(insertSql);
      }
    }

    return res.status(204).end();
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

const updateAccompanistResume = async (req, res) => {
  const { offerId } = req.params;
  const {
    districtId,
    majorId,
    title,
    description,
    hourlyWage,
    isNegotiable,
    contactA,
    contactB,
    contactC,
    contactD,
    workExperience,
    lectures,
    educations,
    imageUrl,
  } = req.body;
  const essential = [
    title,
    districtId,
    hourlyWage,
    description,
    isNegotiable,
    contactA,
  ];

  if (essential.includes(undefined)) {
    return res.status(403).json({ message: "OMISSION IN REQUEST BODY" });
  }
  if (educations) {
    for (const {
      isDeleted,
      institution,
      major,
      isRepresentative,
    } of educations) {
      if (isDeleted) continue;
      if ([institution, major, isRepresentative].includes(undefined)) {
        return res.status(403).json({ message: "OMISSION IN educations" });
      }
    }
  }
  if (lectures) {
    for (const { isDeleted, institution, isRepresentative } of lectures) {
      if (isDeleted) continue;
      if ([institution, isRepresentative].includes(undefined)) {
        return res.status(403).json({ message: "OMISSION IN lectures" });
      }
    }
  }

  const checkExSql = mysql.format(myRaw.select.exAccompanistResume, [
    myRaw.where.id(offerId),
  ]);
  const updateSql = mysql.format(myRaw.update.accompanistResume, [
    districtId,
    majorId,
    title,
    description,
    hourlyWage,
    isNegotiable,
    contactA,
    contactB,
    contactC,
    contactD,
    workExperience,
    imageUrl,
    myRaw.where.id(offerId),
  ]);

  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const [[exOffer]] = await connection.query(checkExSql);
    if (!exOffer) return res.status(403).json({ message: "RECORD NOT EXISTS" });
    if (exOffer.user_id !== req.user.id)
      return res.status(403).json({ message: "INVALID USER" });

    await connection.query(updateSql);

    for (const {
      id,
      isDeleted,
      isNew,
      institution,
      major,
      degree,
      isRepresentative,
    } of educations) {
      if (id) {
        if (isDeleted) {
          const deleteSql = mysql.format(myRaw.delete.a_educations, [
            myRaw.where.id(id),
          ]);
          await connection.query(deleteSql);
        } else {
          const updateSql = mysql.format(myRaw.update.a_educations, [
            institution,
            major,
            degree,
            isRepresentative,
            myRaw.where.id(id),
          ]);
          await connection.query(updateSql);
        }
      } else if (isNew) {
        const insertSql = mysql.format(myRaw.insert.a_educations, [
          offerId,
          institution,
          major,
          degree,
          isRepresentative,
        ]);
        await connection.query(insertSql);
      }
    }
    for (const {
      id,
      isDeleted,
      isNew,
      institution,
      isRepresentative,
    } of lectures) {
      if (id) {
        if (isDeleted) {
          const deleteSql = mysql.format(myRaw.delete.a_lectures, [
            myRaw.where.id(id),
          ]);
          await connection.query(deleteSql);
        } else {
          const updateSql = mysql.format(myRaw.update.a_lectures, [
            institution,
            isRepresentative,
            myRaw.where.id(id),
          ]);
          await connection.query(updateSql);
        }
      } else if (isNew) {
        const insertSql = mysql.format(myRaw.insert.a_lectures, [
          offerId,
          institution,
          isRepresentative,
        ]);
        await connection.query(insertSql);
      }
    }

    return res.status(204).json({ message: "success" });
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

const updateTutorRecruit = async (req, res) => {
  const { offerId } = req.params;
  const {
    districtId,
    title,
    description,
    hourlyWage,
    isNegotiable,
    contactA,
    contactB,
    contactC,
    contactD,
    institution,
    monthlyWage,
    direction,
    workForm,
    imageUrl,
  } = req.body;
  const essential = [
    districtId,
    description,
    title,
    hourlyWage,
    isNegotiable,
    contactA,
    institution,
    workForm,
  ];
  if (essential.includes(undefined))
    return res.status(403).json({ message: "OMISSION IN REQUEST BODY" });

  const checkExSql = mysql.format(myRaw.select.exTutorRecruit, [
    myRaw.where.id(offerId),
  ]);
  const updateSql = mysql.format(myRaw.update.tutorRecruit, [
    districtId,
    title,
    description,
    hourlyWage,
    isNegotiable,
    contactA,
    contactB,
    contactC,
    contactD,
    institution,
    monthlyWage,
    direction,
    workForm,
    imageUrl,
    myRaw.where.id(offerId),
  ]);

  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const [[exOffer]] = await connection.query(checkExSql);

    if (!exOffer) return res.status(403).json({ message: "RECORD NOT EXISTS" });
    if (exOffer.user_id !== req.user.id)
      return res.status(403).json({ message: "INVALID USER" });

    await connection.query(updateSql);
    return res.status(204).end();
  } catch (error) {
    return res.status(403).json({ message: error.message, code: error.code });
  } finally {
    connection.release();
  }
};

const updateAccompanistRecruit = async (req, res) => {
  const { offerId } = req.params;
  const {
    districtId,
    majorId,
    title,
    description,
    hourlyWage,
    isNegotiable,
    contactA,
    contactB,
    contactC,
    contactD,
    imageUrl,
  } = req.body;
  const essential = [
    title,
    districtId,
    majorId,
    hourlyWage,
    description,
    isNegotiable,
    contactA,
  ];

  if (essential.includes(undefined))
    return res.status(403).json({ message: "OMISSION IN REQUEST BODY" });

  const checkExSql = mysql.format(myRaw.select.exAccompanistRecruit, [
    myRaw.where.id(offerId),
  ]);
  const updateSql = mysql.format(myRaw.update.accompanistRecruit, [
    districtId,
    majorId,
    title,
    description,
    hourlyWage,
    isNegotiable,
    contactA,
    contactB,
    contactC,
    contactD,
    imageUrl,
    myRaw.where.id(offerId),
  ]);

  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const [[exOffer]] = await connection.query(checkExSql);
    if (exOffer === undefined)
      return res.status(403).json({ message: "RECORD NOT EXISTS" });
    if (exOffer.user_id !== req.user.id)
      return res.status(403).json({ message: "INVALID USER" });

    await connection.query(updateSql);
    return res.status(204).end();
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

// delete
const deletelessonResume = async (req, res) => {
  const { offerId } = req.params;
  const checkExSql = mysql.format(myRaw.select.exLessonResume, [
    myRaw.where.id(offerId),
  ]);
  const deleteEducationSql = mysql.format(myRaw.delete.l_educations, [
    myRaw.where.resumeIdRefer(offerId),
  ]);
  const deleteLectureSql = mysql.format(myRaw.delete.l_lectures, [
    myRaw.where.resumeIdRefer(offerId),
  ]);
  const deleteOfferSql = mysql.format(myRaw.delete.lessonResume, [
    myRaw.where.id(offerId),
  ]);

  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const [[exOffer]] = await connection.query(checkExSql);
    if (exOffer === undefined)
      return res.status(403).json({ message: "RECORD NOT EXISTS" });
    if (exOffer.user_id !== req.user.id)
      return res.status(403).json({ message: "INVALID USER" });
    if (exOffer.image_url) {
      const imageKey = exOffer.image_url.split(".com/")[1];
      deleteObjectByKey(imageKey);
    }

    await connection.query(deleteEducationSql);
    await connection.query(deleteLectureSql);
    await connection.query(deleteOfferSql);

    return res.status(204).end();
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

const deleteAccompanistResume = async (req, res) => {
  const { offerId } = req.params;
  const checkExSql = mysql.format(myRaw.select.exAccompanistResume, [
    myRaw.where.id(offerId),
  ]);
  const deleteEducationSql = mysql.format(myRaw.delete.a_educations, [
    myRaw.where.resumeIdRefer(offerId),
  ]);
  const deleteLectureSql = mysql.format(myRaw.delete.a_lectures, [
    myRaw.where.resumeIdRefer(offerId),
  ]);
  const deleteOfferSql = mysql.format(myRaw.delete.accompanistResume, [
    myRaw.where.id(offerId),
  ]);

  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const [[exOffer]] = await connection.query(checkExSql);
    if (exOffer === undefined)
      return res.status(403).json({ message: "RECORD NOT EXISTS" });
    if (exOffer.user_id !== req.user.id)
      return res.status(403).json({ message: "INVALID USER" });
    if (exOffer.image_url) {
      const imageKey = exOffer.image_url.split(".com/")[1];
      deleteObjectByKey(imageKey);
    }

    await connection.query(deleteEducationSql);
    await connection.query(deleteLectureSql);
    await connection.query(deleteOfferSql);

    return res.status(204).end();
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

const deleteTutorRecruit = async (req, res) => {
  const { offerId } = req.params;
  const checkExSql = mysql.format(myRaw.select.exTutorRecruit, [
    myRaw.where.id(offerId),
  ]);
  const deleteOfferSql = mysql.format(myRaw.delete.tutorRecruit, [
    myRaw.where.id(offerId),
  ]);

  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const [[exOffer]] = await connection.query(checkExSql);
    if (exOffer === undefined)
      return res.status(403).json({ message: "RECORD NOT EXISTS" });
    if (exOffer.user_id !== req.user.id)
      return res.status(403).json({ message: "INVALID USER" });
    if (exOffer.image_url) {
      const imageKey = exOffer.image_url.split(".com/")[1];
      deleteObjectByKey(imageKey);
    }

    await connection.query(deleteOfferSql);

    return res.status(204).end();
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

const deleteAccompanistRecruit = async (req, res) => {
  const { offerId } = req.params;
  const checkExSql = mysql.format(myRaw.select.exAccompanistRecruit, [
    myRaw.where.id(offerId),
  ]);
  const deleteOfferSql = mysql.format(myRaw.delete.accompanistRecruit, [
    myRaw.where.id(offerId),
  ]);

  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const [[exOffer]] = await connection.query(checkExSql);
    if (exOffer === undefined)
      return res.status(403).json({ message: "RECORD NOT EXISTS" });
    if (exOffer.user_id !== req.user.id)
      return res.status(403).json({ message: "INVALID USER" });
    if (exOffer.image_url) {
      const imageKey = exOffer.image_url.split(".com/")[1];
      deleteObjectByKey(imageKey);
    }

    await connection.query(deleteOfferSql);

    return res.status(204).end();
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

// image
const putOfferImage = async (req, res) => {
  if (!req.file) {
    return res.status(403).json({ message: "OMISSION IN FILE" });
  }
  const { location: imageUrl } = req.file;

  return res.status(200).json({ imageUrl });
};

export {
  detailLessonResume,
  detailAccompanistResume,
  detailTutorRecruit,
  detailAccompanistRecruit,
  listLessonResumes,
  listAccompanistResumes,
  listTutorRecruits,
  listAccompanistRecruits,
  recommendLessonResumes,
  recommendAccompanistResumes,
  recommendTutorRecruits,
  recommendAccompanistRecruits,
  createLessonResume,
  createAccompanistResume,
  createTutorRecruit,
  createAccompanistRecruit,
  updateLessonResume,
  updateAccompanistResume,
  updateTutorRecruit,
  updateAccompanistRecruit,
  deletelessonResume,
  deleteAccompanistResume,
  deleteTutorRecruit,
  deleteAccompanistRecruit,
  putOfferImage,
};
