import mysql from "mysql2/promise";

import pool from "../db";
import myRaw from "../utils/myRaw";
import { constants, functions } from "../utils/offers";
import { deleteObjectByKey, deleteObjects } from "../utils/s3multer";

// detail
const detailHouse = async (req, res) => {
  const { houseId } = req.params;

  const houseSql = mysql.format(myRaw.select.practiceHouse, [
    myRaw.where.offerId(houseId),
  ]);
  const roomsSql = mysql.format(myRaw.select.rooms, [
    myRaw.where.houseIdRefer(houseId),
  ]);
  const facilitiesSql = mysql.format(myRaw.select.facilities, [
    myRaw.where.facilitiesByHouseId(houseId),
  ]);
  const updateViewCountSql = mysql.format(myRaw.update.practiceHouseViewCount, [
    myRaw.where.id(houseId),
  ]);

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

// list
const listHouses = async (req, res) => {
  const {
    limit,
    page,
    selectedLimit,
    selectedPage,
    districtIds,
    cityIds,
    facilityIds,
    priceOrder,
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
  const convertedFacilityIds = functions.convertParamsToArray(facilityIds);
  const now = new Date();

  const commonHouseSql = mysql.format(myRaw.select.commonPracticeHouses, [
    myRaw.where.districtIds(convertedDistrictIds, convertedCityIds),
    myRaw.where.facilityIds(convertedFacilityIds),
    myRaw.where.selectedUntilNullable(now),
    myRaw.orderBy.hourlyPrice(priceOrder),
    myRaw.base.limitOffset(LIMIT, OFFSET),
  ]);
  const selectedHouseSql = mysql.format(myRaw.select.selectedPracticeHouses, [
    myRaw.where.selectedUntil(now),
    myRaw.base.limitOffset(SELECTED_LIMIT, SELECTED_OFFSET),
  ]);

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

// recommend
const recommendHouses = async (req, res) => {
  const { houseId } = req.params;
  const { limit, page } = req.query;

  const LIMIT = limit ? limit : constants.DEFAULT_RECOMMEND_LIMIT;
  const OFFSET = page ? LIMIT * (page - 1) : constants.DEFAULT_OFFSET;

  const sql = mysql.format(myRaw.select.recommendPracticeHouses, [
    myRaw.where.districtIdsByOfferId(houseId, "practice_houses"),
    myRaw.where.offerIdNot(houseId),
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
const createHouse = async (req, res) => {
  const {
    districtId,
    title,
    hourlyPrice,
    description,
    direction,
    contactA,
    contactB,
    contactC,
    contactD,
    rooms,
    facilityIds,
    imageUrl,
  } = req.body;
  const essential = [
    districtId,
    title,
    hourlyPrice,
    rooms,
    facilityIds,
    contactA,
  ];

  if (essential.includes(undefined)) {
    return res.status(403).json({ message: "OMISSION IN BODY" });
  }

  for (const { name, hourlyPrice } of rooms) {
    if ([name, hourlyPrice].includes(undefined)) {
      return res.status(403).json({ message: "OMISSION IN rooms" });
    }
  }
  for (const el of facilityIds) {
    if (!Array.from({ length: 13 }, (_, i) => i + 1).includes(el)) {
      return res.status(403).json({ message: "facilityIds OUT OF RANGE" });
    }
  }

  const checkExSql = mysql.format(myRaw.select.exPracticeHouse, [
    myRaw.where.userId(req.user.userId),
  ]);
  const insertHouseSql = mysql.format(myRaw.insert.practiceHouse, [
    req.user.userId,
    districtId,
    title,
    hourlyPrice,
    description,
    direction,
    contactA,
    contactB,
    contactC,
    contactD,
    imageUrl,
  ]);

  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const [[exHouse]] = await connection.query(checkExSql);
    if (exHouse) {
      return res.status(403).json({ message: "ALREADY EXISTS" });
    }

    const [{ insertId }] = await connection.query(insertHouseSql);

    for (const { name, instrument, hourlyPrice, imageUrl } of rooms) {
      const sql = mysql.format(myRaw.insert.rooms, [
        insertId,
        name,
        instrument,
        hourlyPrice,
        imageUrl,
      ]);
      await connection.query(sql);
    }
    for (const id of facilityIds) {
      const sql = mysql.format(myRaw.insert.facilities, [insertId, id]);
      await connection.query(sql);
    }

    return res.status(201).json({ insertId });
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
    contactA,
    contactB,
    contactC,
    contactD,
    hourlyPrice,
    rooms,
    facilityIds,
    imageUrl,
  } = req.body;
  const essential = [
    districtId,
    title,
    hourlyPrice,
    rooms,
    facilityIds,
    contactA,
  ];
  if (essential.includes(undefined)) {
    return res.status(403).json({ message: "OMISSION IN REQUEST BODY" });
  }

  for (const { isDeleted, name, hourlyPrice } of rooms) {
    if (isDeleted) continue;
    if ([name, hourlyPrice].includes(undefined)) {
      return res.status(403).json({ message: "OMISSION IN rooms" });
    }
  }
  for (const el of facilityIds) {
    if (!Array.from({ length: 13 }, (_, i) => i + 1).includes(el)) {
      return res.status(403).json({ message: "facilityIds OUT OF RANGE" });
    }
  }

  const checkExSql = mysql.format(myRaw.select.exPracticeHouse, [
    myRaw.where.id(houseId),
  ]);
  const updateSql = mysql.format(myRaw.update.practiceHouse, [
    districtId,
    title,
    description,
    contactA,
    contactB,
    contactC,
    contactD,
    hourlyPrice,
    direction,
    imageUrl,
    myRaw.where.id(houseId),
  ]);
  const exFacilitiesSql = mysql.format(myRaw.select.exFacilities, [
    myRaw.where.practiceHouseIdRefer(houseId),
  ]);

  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const [[exHouse]] = await connection.query(checkExSql);
    if (!exHouse) {
      return res.status(403).json({ message: "RECORD NOT EXISTS" });
    } else if (exHouse.user_id !== req.user.userId) {
      return res.status(403).json({ message: "INVALID USER" });
    }

    // facility는 연습방과 달리 isDeleted, isNew 로직을 쓰지 않았음. 음..
    const [exFacilities] = await connection.query(exFacilitiesSql);
    const exFacilityIds = exFacilities.map((el) => el.facility_id);
    const facilityIdsToCreate = facilityIds.filter(
      (el) => !exFacilityIds.includes(el)
    );
    const facilityIdsToDelete = exFacilityIds.filter(
      (el) => !facilityIds.includes(el)
    );

    await connection.query(updateSql);

    const oldImages = [];
    for (const {
      id,
      isDeleted,
      isNew,
      imageUrl,
      name,
      instrument,
      hourlyPrice,
    } of rooms) {
      if (id) {
        if (isDeleted) {
          const deleteSql = mysql.format(myRaw.delete.rooms, [
            myRaw.where.id(id),
          ]);
          await connection.query(deleteSql);
          if (imageUrl) {
            const Key = imageUrl.split(".com/")[1];
            oldImages.push({ Key });
          }
        } else {
          const updateSql = mysql.format(myRaw.update.rooms, [
            name,
            instrument,
            hourlyPrice,
            imageUrl,
            myRaw.where.id(id),
          ]);
          await connection.query(updateSql);
        }
      } else if (isNew) {
        const insertSql = mysql.format(myRaw.insert.rooms, [
          houseId,
          name,
          instrument,
          hourlyPrice,
          imageUrl,
        ]);
        await connection.query(insertSql);
      }
    }

    if (oldImages.length) deleteObjects(oldImages);

    for (const id of facilityIdsToCreate) {
      const insertSql = mysql.format(myRaw.insert.facilities, [houseId, id]);
      await connection.query(insertSql);
    }
    for (const id of facilityIdsToDelete) {
      const deleteSql = mysql.format(myRaw.delete.facilities, [
        myRaw.where.practiceHouseIdRefer(houseId),
        myRaw.where.facilityId(id),
      ]);

      await connection.query(deleteSql);
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

  const checkExSql = mysql.format(myRaw.select.exPracticeHouse, [
    myRaw.where.id(houseId),
  ]);
  const selectRoomsSql = mysql.format(myRaw.select.rooms, [
    myRaw.where.houseIdRefer(houseId),
  ]);
  const deleteRoomsSql = mysql.format(myRaw.delete.rooms, [
    myRaw.where.houseIdRefer(houseId),
  ]);
  const deleteFacilitiesSql = mysql.format(myRaw.delete.allFacilities, [
    myRaw.where.houseIdRefer(houseId),
  ]);
  const deleteHouseSql = mysql.format(myRaw.delete.practiceHouse, [
    myRaw.where.id(houseId),
  ]);

  const connection = await pool.getConnection(async (conn) => conn);
  try {
    const [[exHouse]] = await connection.query(checkExSql);
    if (!exHouse) {
      return res.status(403).json({ message: "RECORD NOT EXISTS" });
    } else if (exHouse.user_id !== req.user.userId) {
      return res.status(403).json({ message: "INVALID USER" });
    }
    const [exRooms] = await connection.query(selectRoomsSql);

    await connection.query(deleteRoomsSql);
    await connection.query(deleteFacilitiesSql);
    await connection.query(deleteHouseSql);

    if (exHouse.image_url) {
      const Key = exHouse.image_url.split(".com/")[1];
      deleteObjectByKey(Key);
    }

    const oldImages = [];
    for (const { image_url } of exRooms) {
      if (image_url) {
        const Key = image_url.split(".com/")[1];
        oldImages.push({ Key });
      }
    }

    if (oldImages.length) deleteObjects(oldImages);

    return res.status(204).end();
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

// image
const putHouseImage = async (req, res) => {
  if (!req.file) {
    return res.status(403).json({ message: "OMISSION IN FILE" });
  }
  const { location: imageUrl } = req.file;

  return res.status(200).json({ imageUrl });
};

const putRoomImage = async (req, res) => {
  if (!req.file) {
    return res.status(403).json({ message: "OMISSION IN FILE" });
  }
  const { location: imageUrl } = req.file;

  return res.status(200).json({ imageUrl });
};

// ?: 이미지들을 한번에 저장했을 때, 각각 알맞은 연습방 개체와 매칭될 보장이 없다. 이 API는 불안정하다.
const putRoomImages = async (req, res) => {
  if (!req.files) {
    return res.status(403).json({ message: "OMISSION IN FILE" });
  }
  const locations = req.files.map((el) => el.location);

  return res.status(200).json({ locations });
};

export {
  detailHouse,
  listHouses,
  recommendHouses,
  createHouse,
  updateHouse,
  deleteHouse,
  putHouseImage,
  putRoomImage,
  putRoomImages,
};
