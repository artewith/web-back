import pool from "../db";
import { constants, boxes } from "../utils/filters";

const { LESSON_ID, TUTOR_ID, ACCOMPANIST_RECRUIT_ID, ACCOMPANIST_RESUME_ID } =
  constants;
const {
  degrees,
  hasLectureds,
  genders,
  careers,
  academyWages,
  accompanyWages,
  workForms,
  performerFields,
  prices,
} = boxes;

const offerFilters = async (req, res) => {
  const { categoryId } = req.query;
  const connection = await pool.getConnection(async (conn) => conn);

  const [majors] = await connection.query(
    "SELECT id AS 'key', name FROM major ORDER BY id;"
  );
  const [regions] = await connection.query(
    "SELECT id AS 'key', name FROM region ORDER BY id;"
  );
  for (let i = 0; i < regions.length; i++) {
    const [districts] = await connection.query(
      "SELECT id AS 'key', name FROM district WHERE region_id = ? ORDER BY id",
      [i + 1]
    );
    regions[i].districts = districts;
  }
  const numId = Number(categoryId);

  connection.release();

  const filters = {
    regions,
    majors: numId === LESSON_ID ? majors : null,
    degrees: numId === LESSON_ID ? degrees : null,
    hasLectureds: numId === LESSON_ID ? hasLectureds : null,
    genders: numId === LESSON_ID ? genders : null,
    careers:
      (numId === LESSON_ID) | (numId === ACCOMPANIST_RESUME_ID)
        ? careers
        : null,
    wages:
      numId === TUTOR_ID
        ? academyWages
        : (numId === ACCOMPANIST_RECRUIT_ID) | (numId === ACCOMPANIST_RESUME_ID)
        ? accompanyWages
        : null,
    workForms: numId === TUTOR_ID ? workForms : null,
    performerFields: numId === ACCOMPANIST_RECRUIT_ID ? performerFields : null,
  };
  res.status(200).json(filters);
};

const practiceHouseFilters = async (req, res) => {
  const connection = await pool.getConnection(async (conn) => conn);

  const [regions] = await connection.query(
    "SELECT id AS 'key', name FROM region ORDER BY id;"
  );
  const [facilities] = await connection.query(
    "SELECT * FROM facility ORDER BY id"
  );

  connection.release();

  const filters = {
    regions,
    facilities,
    prices,
  };

  res.status(200).json(filters);
};

const userFilters = async (req, res) => {
  const connection = await pool.getConnection(async (conn) => conn);

  const [majors] = await connection.query(
    `SELECT id AS 'key', name FROM major ORDER BY id`
  );
  const [jobs] = await connection.query(
    `SELECT id AS 'key', name FROM job ORDER BY id`
  );
  const [regions] = await connection.query(
    `SELECT id AS 'key', name FROM region ORDER BY id`
  );

  for (let i = 0; i < regions.length; i++) {
    const [districts] = await connection.query(
      `SELECT id AS 'key', name FROM district WHERE region_id = ? ORDER BY id`,
      [i + 1]
    );
    regions[i].districts = districts;
  }

  connection.release();

  const filters = {
    regions,
    majors,
    jobs,
    genders,
  };

  res.status(200).json(filters);
};

export { offerFilters, practiceHouseFilters, userFilters };
