import pool from "../db";
import filters from "../utils/filters";

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
} = filters;

const filterController = async (req, res) => {
  const { offertype } = req.query;
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
  const [facility] = await connection.query(
    "SELECT * FROM facility ORDER BY id"
  );
  connection.release();

  const filters = {
    region,
    major: offertype === "입시레슨" ? major : null,
    education: offertype === "입시레슨" ? education : null,
    hasLectured: offertype === "입시레슨" ? hasLectured : null,
    gender: offertype === "입시레슨" ? gender : null,
    career:
      (offertype === "입시레슨") | (offertype === "반주자 이력서")
        ? career
        : null,
    wage:
      offertype === "학원강사"
        ? academyWage
        : (offertype === "반주자 공고") | (offertype === "반주자 이력서")
        ? accompanyWage
        : null,
    workForm: offertype === "학원강사" ? workForm : null,
    performerField: offertype === "반주자 공고" ? performerField : null,
    facility: offertype === "연습실" ? facility : null,
    price: offertype === "연습실" ? price : null,
  };
  res.status(200).json(filters);
};

export default filterController;
