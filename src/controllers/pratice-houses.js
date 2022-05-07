import mysql from "mysql2/promise";

import pool from "../db";
import myRaw from "../utils/myRaw";
import { constants } from "../utils/offers";

const detailHouse = async (req, res) => {
  const { houseId } = req.params;

  const houseSql = mysql.format(
    `SELECT O.* FROM practice_houses AS O 
      WHERE 1=1 ?`,
    [myRaw.where.offerId(houseId)]
  );
  const roomsSql = mysql.format(
    `SELECT * FROM rooms
      WHERE 1=1 ?`,
    [myRaw.where.houseIdRefer(houseId)]
  );
  const facilitiesSql = mysql.format(
    `SELECT * FROM facility AS F
      WHERE 1=1 ?`,
    [myRaw.where.facilitiesByHouseId(houseId)]
  );
  const updateViewCountSql = mysql.format(
    `UPDATE practice_houses 
      SET view_count=view_count+1 
      WHERE 1=1 ?`,
    [myRaw.where.id(houseId)]
  );

  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const [[exHouse]] = await connection.query(houseSql);
    if (!exHouse) {
      return res.status(403).json({ message: "RECORD NOT EXISTS" });
    }
    const [rooms] = await connection.query(roomsSql);
    const [facilities] = await connection.query(facilitiesSql);
    await connection.query(updateViewCountSql);

    return res.status(200).json({ exHouse, rooms, facilities });
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

const listHouses = async (req, res) => {
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
  const facilityIds =
    req.query.facilityIds && !Array.isArray(req.query.facilityIds)
      ? [req.query.facilityIds]
      : req.query.facilityIds;
  const currentDate = new Date();

  const commonHouseSql = mysql.format(
    `SELECT O.* FROM practice_houses AS O
      LEFT JOIN practice_houses_facility AS PF ON PF.practice_house_id=O.id
      WHERE 1=1 ? ? ? 
      ORDER BY selected_until DESC, ? updated_at DESC 
      ?`,
    [
      myRaw.where.districtIds(districtIds, regionIds),
      myRaw.where.facilityIds(facilityIds),
      myRaw.where.selectedUntilNullable(currentDate),
      myRaw.orderBy.hourlyPrice(req.query.priceOrder),
      myRaw.base.limitOffset(LIMIT, OFFSET),
    ]
  );
  const selectedHouseSql = mysql.format(
    `SELECT O.* FROM practice_houses AS O
      WHERE 1=1 ?
      ORDER BY updated_at DESC
      ?`,
    [
      myRaw.where.selectedUntil(currentDate),
      myRaw.base.limitOffset(SELECTED_LIMIT, SELECTED_OFFSET),
    ]
  );

  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const [common] = await connection.query(commonHouseSql);
    const [selected] = await connection.query(selectedHouseSql);

    return res.json({ common, selected });
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

const recommendHouses = async (req, res) => {
  const { houseId } = req.params;

  const LIMIT = req.query.limit
    ? req.query.limit
    : constants.DEFAULT_RECOMMEND_LIMIT;
  const OFFSET = req.query.page
    ? LIMIT * (req.query.page - 1)
    : constants.DEFAULT_OFFSET;

  const sql = mysql.format(
    `SELECT  O.*
        FROM practice_houses AS O 
        WHERE 1=1 ? ?
        ORDER BY selected_until DESC, updated_at DESC 
        ?`,
    [
      myRaw.where.districtIdsByOfferId(houseId),
      myRaw.where.offerIdNot(houseId),
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

const createHouse = async (req, res) => {
  const {
    districtId,
    title,
    hourlyPrice,
    description,
    direction,
    imageUrl,
    email,
    phoneNumber,
    rooms,
    facilityIds,
  } = req.body;

  if (
    [districtId, title, hourlyPrice, rooms, facilityIds].includes(undefined)
  ) {
    return res.status(403).json({ message: "OMISSION IN BODY" });
  }

  for (const el of rooms) {
    if (!el.name || !el.hourlyPrice) {
      return res.status(403).json({ message: "OMISSION IN rooms" });
    }
  }
  for (const el of facilityIds) {
    if (!Array.from({ length: 13 }, (_, i) => i + 1).includes(el)) {
      return res.status(403).json({ message: "facilityIds OUT OF RANGE" });
    }
  }

  const checkExSql = mysql.format(
    `SELECT id FROM practice_houses 
      WHERE 1=1 ? 
      LIMIT 1`,
    [myRaw.where.userId(req.user.recordId)]
  );
  const insertHouseSql = mysql.format(
    `INSERT INTO practice_houses ( user_id, district_id, title, hourly_price, image_url, description, direction, email, phone_number ) 
      VALUES ( ?,?,?,?,?,?,?,?,?)`,
    [
      req.user.recordId,
      districtId,
      title,
      hourlyPrice,
      imageUrl,
      description,
      direction,
      email,
      phoneNumber,
    ]
  );

  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const [[exHouse]] = await connection.query(checkExSql);
    if (exHouse) {
      return res.status(403).json({ message: "ALREADY EXISTS" });
    }

    await connection.query(insertHouseSql);

    const [[{ lastInsertId }]] = await connection.query(
      `SELECT LAST_INSERT_ID() AS lastInsertId`
    );

    for (const el of rooms) {
      const sql = mysql.format(
        `INSERT INTO rooms (practice_house_id, name, instrument, hourly_price, image_url ) 
          VALUES(?,?,?,?,?)`,
        [lastInsertId, el.name, el.instrument, el.hourlyPrice, el.imageUrl]
      );
      await connection.query(sql);
    }
    for (const el of facilityIds) {
      const sql = mysql.format(
        `INSERT INTO practice_houses_facility(practice_house_id, facility_id) 
          VALUES(?,?)`,
        [lastInsertId, el]
      );
      await connection.query(sql);
    }

    return res.status(201).json({ lastInsertId });
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

const updateHouse = async (req, res) => {
  const { houseId } = req.params;
  const {
    districtId,
    title,
    imageUrl,
    description,
    direction,
    email,
    phoneNumber,
    hourlyPrice,
    rooms,
    facilityIds,
  } = req.body;

  if (
    [districtId, title, hourlyPrice, rooms, facilityIds].includes(undefined)
  ) {
    return res.status(403).json({ message: "OMISSION IN REQUEST BODY" });
  }

  for (const el of rooms) {
    if (!el.isDeleted && (!el.name || !el.hourlyPrice)) {
      return res.status(403).json({ message: "OMISSION IN rooms" });
    }
  }
  for (const el of facilityIds) {
    if (!Array.from({ length: 13 }, (_, i) => i + 1).includes(el)) {
      return res.status(403).json({ message: "facilityIds OUT OF RANGE" });
    }
  }

  const checkExSql = mysql.format(
    `SELECT id, user_id FROM practice_houses 
      WHERE 1=1 ?`,
    [myRaw.where.id(houseId)]
  );
  const updateSql = mysql.format(
    `UPDATE practice_houses
      SET district_id=?, title=?, image_url=?, description=?, email=?, phone_number=?, hourly_price=?, direction=?
      WHERE 1=1 ?`,
    [
      districtId,
      title,
      imageUrl,
      description,
      email,
      phoneNumber,
      hourlyPrice,
      direction,
      myRaw.where.id(houseId),
    ]
  );
  const exFacilitiesSql = mysql.format(
    `SELECT facility_id FROM practice_houses_facility 
      WHERE practice_house_id=?`,
    [houseId]
  );

  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const [[exHouse]] = await connection.query(checkExSql);
    if (!exHouse) {
      return res.status(403).json({ message: "RECORD NOT EXISTS" });
    } else if (exHouse.user_id !== req.user.recordId) {
      return res.status(403).json({ message: "INVALID USER" });
    }

    const [exFacilities] = await connection.query(exFacilitiesSql);
    const exFacilityIds = exFacilities.map((el) => el.facility_id);
    const facilityIdsToCreate = facilityIds.filter(
      (el) => !exFacilityIds.includes(el)
    );
    const facilityIdsToDelete = exFacilityIds.filter(
      (el) => !facilityIds.includes(el)
    );

    await connection.query(updateSql);

    for (const el of rooms) {
      if (el.id) {
        if (el.isDeleted) {
          const sql = mysql.format(
            `DELETE FROM rooms
            WHERE 1=1 ?`,
            [myRaw.where.id(el.id)]
          );
          await connection.query(sql);
        } else {
          const sql = mysql.format(
            `UPDATE rooms
            SET name=?, instrument=?, hourly_price=?, image_url=?
            WHERE 1=1 ?`,
            [
              el.name,
              el.instrument,
              el.hourlyPrice,
              el.imageUrl,
              myRaw.where.id(el.id),
            ]
          );
          await connection.query(sql);
        }
      } else if (el.isNew) {
        const sql = mysql.format(
          `INSERT INTO rooms(practice_house_id, name, instrument, hourly_price, image_url) 
          VALUES(?,?,?,?,?)`,
          [houseId, el.name, el.instrument, el.hourlyPrice, el.imageUrl]
        );
        await connection.query(sql);
      }
    }

    for (const el of facilityIdsToCreate) {
      const sql = mysql.format(
        `INSERT INTO practice_houses_facility(practice_house_id, facility_id) 
        VALUES(?,?)`,
        [houseId, el]
      );
      await connection.query(sql);
    }
    for (const el of facilityIdsToDelete) {
      const sql = mysql.format(
        `DELETE FROM practice_houses_facility
        WHERE practice_house_id=? AND facility_id=?`,
        [houseId, el]
      );
      await connection.query(sql);
    }

    return res.status(204).end();
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

const deleteHouse = async (req, res) => {
  const { houseId } = req.params;

  const checkExSql = mysql.format(
    `SELECT id, user_id FROM practice_houses
      WHERE 1=1 ?`,
    [myRaw.where.id(houseId)]
  );
  const deleteRoomsSql = mysql.format(
    `DELETE FROM rooms
      WHERE 1=1 ?`,
    [myRaw.where.houseIdRefer(houseId)]
  );
  const deletePracticeHousesFacilitiesSql = mysql.format(
    `DELETE FROM practice_houses_facility
      WHERE 1=1 ?`,
    [myRaw.where.houseIdRefer(houseId)]
  );
  const deleteHouseSql = mysql.format(
    `DELETE FROM practice_houses
      WHERE 1=1 ?`,
    [myRaw.where.id(houseId)]
  );

  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const [[exHouse]] = await connection.query(checkExSql);
    if (!exHouse) {
      return res.status(403).json({ message: "RECORD NOT EXISTS" });
    } else if (exHouse.user_id !== req.user.recordId) {
      return res.status(403).json({ message: "INVALID USER" });
    }

    await connection.query(deleteRoomsSql);
    await connection.query(deletePracticeHousesFacilitiesSql);
    await connection.query(deleteHouseSql);
    return res.status(204).end();
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

export {
  detailHouse,
  listHouses,
  recommendHouses,
  createHouse,
  updateHouse,
  deleteHouse,
};
