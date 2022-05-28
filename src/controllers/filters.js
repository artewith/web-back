import pool from "../db";
import { constants, boxes } from "../utils/filters";

const { LESSON_ID, TUTOR_ID, ACCOMPANIST_RECRUIT_ID, ACCOMPANIST_RESUME_ID } =
  constants;
const {
  education,
  hasLectured,
  gender,
  career,
  academyWage,
  accompanyWage,
  workForm,
  performerField,
  price,
} = boxes;

const offerFilters = async (req, res) => {
  const { categoryId } = req.query;
  const connection = await pool.getConnection(async (conn) => conn);

  const [major] = await connection.query(
    "SELECT id AS 'key', name FROM major ORDER BY id;"
  );
  const [region] = await connection.query(
    "SELECT id AS 'key', name FROM region ORDER BY id;"
  );
  for (let i = 0; i < region.length; i++) {
    const [district] = await connection.query(
      "SELECT id AS 'key', name FROM district WHERE region_id = ? ORDER BY id",
      [i + 1]
    );
    region[i].district = district;
  }
  const numId = Number(categoryId);

  connection.release();

  const filters = {
    region,
    major: numId === LESSON_ID ? major : null,
    education: numId === LESSON_ID ? education : null,
    hasLectured: numId === LESSON_ID ? hasLectured : null,
    gender: numId === LESSON_ID ? gender : null,
    career:
      (numId === LESSON_ID) | (numId === ACCOMPANIST_RESUME_ID) ? career : null,
    wage:
      numId === TUTOR_ID
        ? academyWage
        : (numId === ACCOMPANIST_RECRUIT_ID) | (numId === ACCOMPANIST_RESUME_ID)
        ? accompanyWage
        : null,
    workForm: numId === TUTOR_ID ? workForm : null,
    performerField: numId === ACCOMPANIST_RECRUIT_ID ? performerField : null,
  };
  res.status(200).json(filters);
};

const practiceHouseFilters = async (req, res) => {
  const connection = await pool.getConnection(async (conn) => conn);

  const [region] = await connection.query(
    "SELECT id AS 'key', name FROM region ORDER BY id;"
  );
  const [facility] = await connection.query(
    "SELECT * FROM facility ORDER BY id"
  );

  connection.release();

  const filters = {
    region,
    facility,
    price,
  };

  res.status(200).json(filters);
};

const userFilters = async (req, res) => {
  const connection = await pool.getConnection(async (conn) => conn);

  const [major] = await connection.query(
    `SELECT id AS 'key', name FROM major ORDER BY id`
  );
  const [job] = await connection.query(
    `SELECT id AS 'key', name FROM job ORDER BY id`
  );
  const [region] = await connection.query(
    `SELECT id AS 'key', name FROM region ORDER BY id`
  );

  for (let i = 0; i < region.length; i++) {
    const [district] = await connection.query(
      `SELECT id AS 'key', name FROM district WHERE region_id = ? ORDER BY id`,
      [i + 1]
    );
    region[i].district = district;
  }

  connection.release();

  const filters = {
    region,
    major,
    job,
    gender,
  };

  res.status(200).json(filters);
};

export { offerFilters, practiceHouseFilters, userFilters };
