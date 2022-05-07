import mysql from "mysql2/promise";

import pool from "../db";
import myRaw from "../utils/myRaw";
import { constants } from "../utils/offers";

const detailOffer = async (req, res) => {
  const { offerId } = req.params;

  const offerSql = mysql.format(
    `SELECT O.*, U.name, M.name AS major_name, D.name AS district, R.name AS region, E.institution AS educated_institution, E.major AS educated_major, E.degree AS educated_degree 
        FROM offers AS O 
        JOIN users AS U ON O.user_id=U.id 
        LEFT JOIN major AS M ON O.major_id=M.id 
        JOIN district AS D ON O.district_id=D.id
        LEFT JOIN region AS R ON D.region_id=R.id
        LEFT JOIN educations AS E ON E.offer_id=O.id AND E.is_representative=true
        WHERE 1=1 ?`,
    [myRaw.where.offerId(offerId)]
  );
  const educationsSql = mysql.format(
    `SELECT * FROM educations 
      WHERE 1=1 ?`,
    [myRaw.where.offerIdRefer(offerId)]
  );
  const lecturesSql = mysql.format(
    `SELECT * FROM lectures 
      WHERE 1=1 ?`,
    [myRaw.where.offerIdRefer(offerId)]
  );
  const updateViewCountSql = mysql.format(
    `UPDATE offers AS O 
      SET view_count=view_count+1 
      WHERE 1=1 ?`,
    [myRaw.where.id(offerId)]
  );

  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const [[exOffer]] = await connection.query(offerSql);
    if (!exOffer) {
      return res.status(403).json({ message: "RECORD NOT EXISTS" });
    }
    const [educations] = await connection.query(educationsSql);
    const [lectures] = await connection.query(lecturesSql);
    await connection.query(updateViewCountSql);

    return res.status(200).json({ exOffer, educations, lectures });
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

const listOffers = async (req, res) => {
  if (!req.query.categoryId) {
    return res.status(403).json({ message: "CATEGORY_ID_REQUIRED" });
  }

  const LIMIT = req.query.limit ? req.query.limit : constants.DEFAULT_LIMIT;
  const OFFSET = req.query.page
    ? LIMIT * (req.query.page - 1)
    : constants.DEFAULT_OFFSET;
  const SELECTED_LIMIT = req.query.selectedLimit
    ? req.query.selectedLimit
    : constants.DEFAULT_SELECTED_LIMIT;
  const SELECTED_OFFSET = req.query.selectedPage
    ? SELECTED_LIMIT * (req.query.selectedPage - 1)
    : constants.DEFAULT_OFFSET;
  const districtIds =
    req.query.districtIds && !Array.isArray(req.query.districtIds)
      ? [req.query.districtIds]
      : req.query.districtIds;
  const regionIds =
    req.query.regionIds && !Array.isArray(req.query.regionIds)
      ? [req.query.regionIds]
      : req.query.regionIds;
  const majorIds =
    req.query.majorIds && !Array.isArray(req.query.majorIds)
      ? [req.query.majorIds]
      : req.query.majorIds;

  const currentDate = new Date();

  const commonOfferSql = mysql.format(
    `SELECT  O.*, U.name, M.name AS major_name, D.name AS district, R.name AS region, L.institution AS lectured_institution, E.institution AS educated_institution, E.major AS educated_major, E.degree AS educated_degree 
        FROM offers AS O 
        JOIN users AS U ON O.user_id=U.id 
        LEFT JOIN major AS M ON O.major_id=M.id 
        JOIN district AS D ON O.district_id=D.id
        JOIN region AS R ON D.region_id=R.id
        LEFT JOIN lectures AS L ON L.offer_id=O.id AND L.is_representative=true 
        LEFT JOIN educations AS E ON E.offer_id=O.id AND E.is_representative=true 
        WHERE 1=1 ? ? ? ? ? ? ? ? ? ? 
        ORDER BY selected_until DESC, updated_at DESC 
        ?`,
    [
      myRaw.where.offerCategoryId(req.query.categoryId),
      myRaw.where.districtIds(districtIds, regionIds),
      myRaw.where.workExperiences(req.query.workExperience),
      myRaw.where.majorIds(majorIds),
      myRaw.where.hasLectured(req.query.hasLectured),
      myRaw.where.gender(req.query.gender),
      myRaw.where.hourlyWage(req.query.minHourlyWage, req.query.maxHourlyWage),
      myRaw.where.workForm(req.query.workForm),
      myRaw.where.performerField(req.query.performerField),
      myRaw.where.selectedUntilNullable(currentDate),
      myRaw.base.limitOffset(LIMIT, OFFSET),
    ]
  );
  const selectedOfferSql = mysql.format(
    `SELECT O.*, U.name, M.name AS major_name, D.name AS district, R.name AS region, L.institution AS lectured_institution, E.institution AS educated_institution, E.major AS educated_major, E.degree AS educated_degree 
        FROM offers AS O 
        JOIN users AS U ON O.user_id=U.id 
        LEFT JOIN major AS M ON O.major_id=M.id 
        JOIN district AS D ON O.district_id=D.id
        JOIN region AS R ON D.region_id=R.id
        LEFT JOIN lectures AS L ON L.offer_id=O.id AND L.is_representative=true 
        LEFT JOIN educations AS E ON E.offer_id=O.id AND E.is_representative=true
        WHERE 1=1 ? ? 
        ORDER BY updated_at DESC 
        ?`,
    [
      myRaw.where.offerCategoryId(req.query.categoryId),
      myRaw.where.selectedUntil(currentDate),
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

const recommendOffers = async (req, res) => {
  const { offerId } = req.params;
  const LIMIT = req.query.limit
    ? req.query.limit
    : constants.DEFAULT_RECOMMEND_LIMIT;
  const OFFSET = req.query.page
    ? LIMIT * (req.query.page - 1)
    : constants.DEFAULT_OFFSET;
  const sql = mysql.format(
    `SELECT  O.*, U.name, M.name AS major_name, D.name AS district, R.name AS region, L.institution AS lectured_institution, E.institution AS educated_institution, E.major AS educated_major, E.degree AS educated_degree 
        FROM offers AS O 
        JOIN users AS U ON O.user_id=U.id 
        LEFT JOIN major AS M ON O.major_id=M.id 
        JOIN district AS D ON O.district_id=D.id
        JOIN region AS R ON D.region_id=R.id
        LEFT JOIN lectures AS L ON L.offer_id=O.id AND L.is_representative=true 
        LEFT JOIN educations AS E ON E.offer_id=O.id AND E.is_representative=true 
        WHERE 1=1 ? ? ? 
        ORDER BY selected_until DESC, updated_at DESC 
        ?`,
    [
      myRaw.where.offerCategoryIdByOfferId(offerId),
      myRaw.where.districtIdsByOfferId(offerId),
      myRaw.where.offerIdNot(offerId),
      myRaw.base.limitOffset(LIMIT, OFFSET),
    ]
  );

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

const createOffer = async (req, res) => {
  const categoryId = Number(req.query.categoryId);
  const {
    districtId,
    majorId,
    title,
    imageUrl,
    description,
    email,
    phoneNumber,
    hourlyWage,
    isNegotiable,
    workExperience,
    gender,
    lectures,
    educations,
    direction,
    institution,
    monthlyWage,
    workForm,
    performerField,
  } = req.body;

  if (
    [title, districtId, hourlyWage, description, isNegotiable].includes(
      undefined
    )
  ) {
    return res.status(403).json({ message: "OMISSION IN REQUEST BODY" });
  }

  switch (categoryId) {
    case constants.ENTRANCE_RESUME_ID:
    case constants.ACCOMPANY_RESUME_ID:
      if (!workExperience) {
        return res.status(403).json({ message: "OMISSION IN REQUEST BODY" });
      }

      if (educations) {
        for (const el of educations) {
          if (
            !el.institution ||
            !el.major ||
            el.isRepresentative === undefined
          ) {
            return res.status(403).json({ message: "OMISSION IN educations" });
          }
        }
      }

      if (lectures) {
        for (const el of lectures) {
          if (!el.institution || el.isRepresentative === undefined) {
            return res.status(403).json({ message: "OMISSION IN lectures" });
          }
        }
      }
      break;
    case constants.ACADEMY_RECRUIT_ID:
      if (!institution || !monthlyWage || !workForm || !direction) {
        return res.status(403).json({ message: "OMISSION IN REQUEST BODY" });
      }
      break;
    case constants.ACCOMPANY_RECRUIT_ID:
      if (!performerField) {
        return res.status(403).json({ message: "OMISSION IN REQUEST BODY" });
      }
      break;
    default:
      return res.status(403).json({ message: "CATEGORY_ID NOT VALID" });
  }

  const insertSql = mysql.format(
    `INSERT INTO offers ( user_id, offer_category_id, district_id,  title, image_url, description, email, phone_number, hourly_wage, is_negotiable, major_id, work_experience, gender, direction, institution, monthly_wage, work_form, performer_field, has_lectured ) 
        VALUES ( ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,? )`,
    [
      req.user.recordId,
      categoryId,
      districtId,
      title,
      imageUrl,
      description,
      email,
      phoneNumber,
      hourlyWage,
      isNegotiable,

      majorId,
      workExperience,
      gender,
      direction,
      institution,
      monthlyWage,
      workForm,
      performerField,
      lectures?.length > 0 ? true : false,
    ]
  );
  const checkExSql = mysql.format(
    `SELECT id FROM offers 
      WHERE 1=1 ? ?`,
    [
      myRaw.where.userId(req.user.recordId),
      myRaw.where.offerCategoryId(categoryId),
    ]
  );

  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const [[exOffer]] = await connection.query(checkExSql);
    if (exOffer) {
      return res
        .status(403)
        .json({ message: "OFFER ALREADY EXISTS IN SAME CATEGORY" });
    }

    await connection.query(insertSql);

    const [[{ lastInsertId }]] = await connection.query(
      `SELECT LAST_INSERT_ID() AS lastInsertId`
    );

    if (
      [constants.ENTRANCE_RESUME_ID, constants.ACCOMPANY_RESUME_ID].includes(
        categoryId
      )
    ) {
      for (const el of lectures) {
        const sql = mysql.format(
          `INSERT INTO lectures(offer_id, institution, is_representative) 
            VALUES(?,?,?)`,
          [lastInsertId, el.institution, el.isRepresentative]
        );
        await connection.query(sql);
      }
      for (const el of educations) {
        const sql = mysql.format(
          `INSERT INTO educations(offer_id, institution, major, degree, is_representative) 
            VALUES(?,?,?,?,?)`,
          [
            lastInsertId,
            el.institution,
            el.major,
            el.degree,
            el.isRepresentative,
          ]
        );
        await connection.query(sql);
      }
    }

    return res.status(200).json({ message: "insert success.", lastInsertId });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
};

const updateOffer = async (req, res) => {
  const { offerId } = req.params;
  const {
    districtId,
    majorId,
    title,
    imageUrl,
    description,
    email,
    phoneNumber,
    hourlyWage,
    isNegotiable,
    workExperience,
    gender,
    lectures,
    educations,
    direction,
    institution,
    monthlyWage,
    workForm,
    performerField,
  } = req.body;

  if (
    [title, districtId, hourlyWage, description, isNegotiable].includes(
      undefined
    )
  ) {
    return res.status(403).json({ message: "OMISSION IN REQUEST BODY" });
  }

  const checkExSql = mysql.format(
    `SELECT id, user_id, offer_category_id FROM offers 
      WHERE 1=1 ?`,
    [myRaw.where.id(offerId)]
  );
  const updateSql = mysql.format(
    `UPDATE offers 
      SET district_id=?, title=?, image_url=?, description=?, email=?, phone_number=?, hourly_wage=?, is_negotiable=?, major_id=?, work_experience=?, gender=?, direction=?, institution=?, monthly_wage=?, work_form=?, performer_field=? 
      WHERE 1=1 ?`,
    [
      districtId,
      title,
      imageUrl,
      description,
      email,
      phoneNumber,
      hourlyWage,
      isNegotiable,
      majorId,
      workExperience,
      gender,
      direction,
      institution,
      monthlyWage,
      workForm,
      performerField,
      myRaw.where.id(offerId),
    ]
  );

  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const [[exOffer]] = await connection.query(checkExSql);
    if (!exOffer) {
      return res.status(403).json({ message: "RECORD NOT EXISTS" });
    } else if (exOffer.user_id !== req.user.recordId) {
      return res.status(403).json({ message: "INVALID USER" });
    }

    switch (exOffer.offer_category_id) {
      case constants.ENTRANCE_RESUME_ID:
      case constants.ACCOMPANY_RESUME_ID:
        if (!workExperience) {
          return res.status(403).json({ message: "OMISSION IN REQUEST BODY" });
        }
        if (educations) {
          for (const el of educations) {
            if (
              !el.isDeleted &&
              (!el.institution ||
                !el.major ||
                el.isRepresentative === undefined)
            ) {
              return res
                .status(403)
                .json({ message: "OMISSION IN educations" });
            }
          }
        }
        if (lectures) {
          for (const el of lectures) {
            if (
              !el.isDeleted &&
              (!el.institution || el.isRepresentative === undefined)
            ) {
              return res.status(403).json({ message: "OMISSION IN lectures" });
            }
          }
        }
        break;
      case constants.ACADEMY_RECRUIT_ID:
        if (!institution || !monthlyWage || !workForm || !direction) {
          return res.status(403).json({ message: "OMISSION IN REQUEST BODY" });
        }
        break;
      case constants.ACCOMPANY_RECRUIT_ID:
        if (!performerField) {
          return res.status(403).json({ message: "OMISSION IN REQUEST BODY" });
        }
        break;
    }

    if (
      [constants.ENTRANCE_RESUME_ID, constants.ACCOMPANY_RESUME_ID].includes(
        exOffer.offer_category_id
      )
    ) {
      for (const el of educations) {
        if (el.id) {
          if (el.isDeleted) {
            const deleteSql = mysql.format(
              `DELETE FROM educations 
                  WHERE 1=1 ?`,
              [myRaw.where.id(el.id)]
            );
            await connection.query(deleteSql);
          } else {
            const updateSql = mysql.format(
              `UPDATE educations 
                  SET institution=?, major=?, degree=?, is_representative=? 
                  WHERE 1=1 ?`,
              [
                el.institution,
                el.major,
                el.degree,
                el.isRepresentative,
                myRaw.where.id(el.id),
              ]
            );
            await connection.query(updateSql);
          }
        } else if (el.isNew) {
          const insertSql = mysql.format(
            `INSERT INTO educations(offer_id, institution, major, degree, is_representative) 
                VALUES(?,?,?,?,?)`,
            [offerId, el.institution, el.major, el.degree, el.isRepresentative]
          );
          await connection.query(insertSql);
        }
      }
      for (const el of lectures) {
        if (el.id) {
          if (el.isDeleted) {
            const deleteSql = mysql.format(
              `DELETE FROM lectures 
                  WHERE 1=1 ?`,
              [myRaw.where.id(el.id)]
            );
            await connection.query(deleteSql);
          } else {
            const updateSql = mysql.format(
              `UPDATE lectures 
                  SET institution=?, is_representative=? 
                  WHERE 1=1 ?`,
              [el.institution, el.isRepresentative, myRaw.where.id(el.id)]
            );
            await connection.query(updateSql);
          }
        } else if (el.isNew) {
          const insertSql = mysql.format(
            `INSERT INTO lectures(offer_id, institution, is_representative) 
                VALUES(?,?,?)`,
            [offerId, el.institution, el.isRepresentative]
          );
          await connection.query(insertSql);
        }
      }
    }

    await connection.query(updateSql);
    return res.status(204).end();
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

const deleteOffer = async (req, res) => {
  const { offerId } = req.params;
  const checkExSql = mysql.format(
    `SELECT id, user_id FROM offers 
      WHERE 1=1 ?`,
    [myRaw.where.id(offerId)]
  );
  const deleteEducationSql = mysql.format(
    `DELETE FROM educations 
      WHERE 1=1 ?`,
    [myRaw.where.offerIdRefer(offerId)]
  );
  const deleteLectureSql = mysql.format(
    `DELETE FROM lectures 
      WHERE 1=1 ?`,
    [myRaw.where.offerIdRefer(offerId)]
  );
  const deleteOfferSql = mysql.format(
    `DELETE FROM offers 
      WHERE 1=1 ?`,
    [myRaw.where.id(offerId)]
  );

  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const [[exOffer]] = await connection.query(checkExSql);
    if (!exOffer) {
      return res.status(403).json({ message: "RECORD NOT EXISTS" });
    } else if (exOffer.user_id !== req.user.recordId) {
      return res.status(403).json({ message: "INVALID USER" });
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

export {
  detailOffer,
  listOffers,
  recommendOffers,
  createOffer,
  updateOffer,
  deleteOffer,
};
