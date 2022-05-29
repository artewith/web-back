import mysql from "mysql2/promise";

import pool from "../db";
import myRaw from "../utils/myRaw";
import { constants } from "../utils/offers";
import { deleteObjectByKey, deleteObjects } from "../utils/s3multer";

const detailHouse = async (req, res) => {
  const { houseId } = req.params;

  const houseSql = mysql.format(
    `SELECT O.*, D.name AS district_name, R.id AS region_id, R.name AS region_name, U.name AS user_name
        FROM practice_houses AS O 
        JOIN district AS D ON O.district_id=D.id 
        JOIN region AS R ON D.region_id=R.id
        JOIN users AS U ON O.user_id=U.id
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
    `SELECT O.*, D.name AS district_name, R.id AS region_id, R.name AS region_name, U.name AS user_name
        FROM practice_houses AS O 
        LEFT JOIN practice_houses_facility AS PF ON PF.practice_house_id=O.id
        JOIN district AS D ON O.district_id=D.id 
        JOIN region AS R ON D.region_id=R.id
        JOIN users AS U ON O.user_id=U.id
        WHERE is_fulfilled=false ? ? ?
        GROUP BY O.id
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
    `SELECT O.*, D.name AS district_name, R.id AS region_id, R.name AS region_name, U.name AS user_name
        FROM practice_houses AS O
        JOIN district AS D ON O.district_id=D.id 
        JOIN region AS R ON D.region_id=R.id
        JOIN users AS U ON O.user_id=U.id
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
    `SELECT O.*, D.name AS district_name, R.id AS region_id, R.name AS region_name, U.name AS user_name
        FROM practice_houses AS O
        JOIN district AS D ON O.district_id=D.id 
        JOIN region AS R ON D.region_id=R.id
        JOIN users AS U ON O.user_id=U.id
        WHERE is_fulfilled=false ? ?
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
    `INSERT INTO practice_houses ( user_id, district_id, title, hourly_price,  description, direction, email, phone_number ) 
        VALUES ( ?,?,?,?,?,?,?,?)`,
    [
      req.user.recordId,
      districtId,
      title,
      hourlyPrice,
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

    const [[{ lastInsertHouseId }]] = await connection.query(
      `SELECT LAST_INSERT_ID() AS lastInsertHouseId`
    );

    const lastInsertRoomIds = [];
    for (const el of rooms) {
      const sql = mysql.format(
        `INSERT INTO rooms (practice_house_id, name, instrument, hourly_price )
            VALUES(?,?,?,?)`,
        [lastInsertHouseId, el.name, el.instrument, el.hourlyPrice]
      );
      await connection.query(sql);
      const [[{ lastInsertRoomId }]] = await connection.query(
        `SELECT LAST_INSERT_ID() AS lastInsertRoomId`
      );
      lastInsertRoomIds.push(lastInsertRoomId);
    }
    for (const el of facilityIds) {
      const sql = mysql.format(
        `INSERT INTO practice_houses_facility(practice_house_id, facility_id) 
            VALUES(?,?)`,
        [lastInsertHouseId, el]
      );
      await connection.query(sql);
    }

    return res.status(201).json({ lastInsertHouseId, lastInsertRoomIds });
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
        SET district_id=?, title=?, description=?, email=?, phone_number=?, hourly_price=?, direction=?
        WHERE 1=1 ?`,
    [
      districtId,
      title,
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

    const Objects = [];
    for (const el of rooms) {
      console.log(el);
      if (el.id) {
        if (el.isDeleted) {
          if (!el.imageUrl) {
            return res.status(403).json({ message: "OMISSION IS_DELETED" });
          }
          const sql = mysql.format(
            `DELETE FROM rooms
                WHERE 1=1 ?`,
            [myRaw.where.id(el.id)]
          );
          await connection.query(sql);

          const Key = el.imageUrl.split(".com/")[1];
          Objects.push({ Key });
        } else {
          const sql = mysql.format(
            `UPDATE rooms
                SET name=?, instrument=?, hourly_price=?
                WHERE 1=1 ?`,
            [el.name, el.instrument, el.hourlyPrice, myRaw.where.id(el.id)]
          );
          await connection.query(sql);
        }
      } else if (el.isNew) {
        const sql = mysql.format(
          `INSERT INTO rooms(practice_house_id, name, instrument, hourly_price) 
            VALUES(?,?,?,?)`,
          [houseId, el.name, el.instrument, el.hourlyPrice]
        );
        await connection.query(sql);
      }
    }

    deleteObjects(Objects);

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
    `SELECT id, user_id, image_url FROM practice_houses
        WHERE 1=1 ?`,
    [myRaw.where.id(houseId)]
  );
  const selectRoomsSql = mysql.format(
    `SELECT id, image_url FROM rooms
        WHERE 1=1 ?`,
    [myRaw.where.houseIdRefer(houseId)]
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
    const [exRooms] = await connection.query(selectRoomsSql);

    await connection.query(deleteRoomsSql);
    await connection.query(deletePracticeHousesFacilitiesSql);
    await connection.query(deleteHouseSql);

    if (exHouse.image_url) {
      const Key = exHouse.image_url.split(".com/")[1];
      deleteObjectByKey(Key);
    }

    const Objects = [];
    for (const el of exRooms) {
      if (el.image_url) {
        const Key = el.image_url.split(".com/")[1];
        Objects.push({ Key });
      }
    }
    deleteObjects(Objects);

    return res.status(204).end();
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

const fulfillHouse = async (req, res) => {
  const { houseId } = req.params;
  const { isFulfilled } = req.body;

  if (isFulfilled === undefined) {
    return res.status(403).json({ message: "OMISSION IN REQUEST BODY" });
  }

  const checkExSql = mysql.format(
    `SELECT id, user_id FROM practice_houses
        WHERE 1=1 ?`,
    [myRaw.where.id(houseId)]
  );
  const updateSql = mysql.format(
    `UPDATE practice_houses
        SET is_fulfilled=?
        WHERE 1=1 ?`,
    [isFulfilled, myRaw.where.id(houseId)]
  );

  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const [[exHouse]] = await connection.query(checkExSql);
    if (!exHouse) {
      return res.status(403).json({ message: "RECORD NOT EXISTS" });
    } else if (exHouse.user_id !== req.user.recordId) {
      return res.status(403).json({ message: "INVALID USER" });
    }

    await connection.query(updateSql);

    return res.status(204).end();
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

const putHouseImage = async (req, res) => {
  const { houseId } = req.params;

  if (!req.file) {
    return res.status(403).json({ message: "OMISSION IN FILE" });
  }
  const { location } = req.file;

  const checkExSql = mysql.format(
    `SELECT id, user_id, image_url FROM practice_houses 
        WHERE 1=1 ?`,
    [myRaw.where.id(houseId)]
  );
  const updateSql = mysql.format(
    `UPDATE practice_houses
        SET image_url=?
        WHERE 1=1 ?`,
    [location, myRaw.where.id(houseId)]
  );
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const [[exHouse]] = await connection.query(checkExSql);
    if (!exHouse) {
      return res.status(403).json({ message: "RECORD NOT EXISTS" });
    } else if (exHouse.user_id !== req.user.recordId) {
      return res.status(403).json({ message: "INVALID USER" });
    }

    await connection.query(updateSql);

    if (exHouse.image_url) {
      const imageKey = exHouse.image_url.split(".com/")[1];
      deleteObjectByKey(imageKey);
    }

    return res.status(200).json({ location });
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

const putRoomImages = async (req, res) => {
  const { roomIds } = req.query;
  if (!req.files) {
    return res.status(403).json({ message: "OMISSION IN FILE" });
  }
  const locations = req.files.map((el) => el.location);
  if (roomIds.length !== locations.length) {
    return res.status(403).json({ message: "LENGTH DOES NOT MATCH" });
  }

  const checkExSql = mysql.format(
    `SELECT id, image_url FROM rooms
        WHERE 1=1 ?`,
    [myRaw.where.ids(roomIds)]
  );
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const [exRooms] = await connection.query(checkExSql);
    if (exRooms.length === 0) {
      return res.status(403).json({ message: "RECORD NOT EXISTS" });
    }

    // !: needed to check exRooms more specifically
    for (let i = 0; i < locations.length; i++) {
      const updateSql = mysql.format(
        `UPDATE rooms
            SET image_url=?
            WHERE 1=1 ?`,
        [locations[i], myRaw.where.id(roomIds[i])]
      );
      await connection.query(updateSql);
    }

    const Objects = [];
    for (const el of exRooms) {
      if (el.image_url) {
        const Key = el.image_url.split(".com/")[1];
        Objects.push({ Key });
      }
    }
    deleteObjects(Objects);

    return res.status(200).json({ locations });
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
  fulfillHouse,
  putHouseImage,
  putRoomImages,
};
