import mysql from "mysql2/promise";

const myRaw = {
  where: {
    offerCategoryId: (id, isFirst) =>
      mysql.raw(
        id
          ? `${isFirst ? "" : "AND "} offer_category_id=${id}`
          : `${isFirst ? "" : "AND "} offer_category_id IN (1,2,3,4)`
      ),
    userId: (id, isFirst) =>
      mysql.raw(`${isFirst ? "" : "AND "} user_id=${id}`),
    districtIds: (d, r, isFirst) =>
      mysql.raw(
        d?.length && r?.length
          ? `${isFirst ? "" : "AND "} O.district_id IN ( 
            SELECT id FROM district 
            WHERE id IN (${[d]}) OR D.region_id IN (
                SELECT id FROM region 
                WHERE id IN (${[r]})) 
            )`
          : d?.length
          ? `${isFirst ? "" : "AND "} O.district_id IN (${[d]})`
          : r?.length
          ? `${isFirst ? "" : "AND "}  O.district_id IN ( 
            SELECT id from district 
            WHERE D.region_id IN (
                SELECT id FROM region 
                WHERE id IN (${[r]}))
            )`
          : ""
      ),
    workExperiences: (w, isFirst) =>
      mysql.raw(
        w ? `${isFirst ? "" : "AND "} O.work_experience IN (${[w]})` : ""
      ),
    majorIds: (m, isFirst) =>
      mysql.raw(m ? `${isFirst ? "" : "AND "} O.major_id IN (${[m]})` : ""),
    hasLectured: (h, isFirst) =>
      mysql.raw(h ? `${isFirst ? "" : "AND "} O.has_lectured = ${h}` : ""),
    gender: (g, isFirst) =>
      mysql.raw(g ? `${isFirst ? "" : "AND "} O.gender = ${g}` : ""),
    hourlyWage: (min, max, isFirst) =>
      mysql.raw(
        min || max
          ? `${isFirst ? "" : "AND "} O.hourly_wage BETWEEN ${
              min ? min : 0
            } AND ${max ? max : 200000}`
          : ""
      ),
    workForm: (w, isFirst) =>
      mysql.raw(w ? `${isFirst ? "" : "AND "} O.work_form='${w}'` : ""),
    performerField: (p, isFirst) =>
      mysql.raw(p ? `${isFirst ? "" : "AND "} O.performer_field='${p}'` : ""),
    selectedUntil: (date, isFirst) =>
      mysql.raw(
        `${isFirst ? "" : "AND "} selected_until > '${
          date.toISOString().split(".")[0]
        }'`
      ),
    selectedUntilNullable: (date, isFirst) =>
      mysql.raw(
        `${
          isFirst ? "" : "AND "
        } (selected_until IS NULL OR selected_until > '${
          date.toISOString().split(".")[0]
        }')`
      ),
    offerId: (id, isFirst) => mysql.raw(`${isFirst ? "" : "AND "} O.id=${id}`),
    offerIdNot: (id, isFirst) =>
      mysql.raw(`${isFirst ? "" : "AND "} O.id!=${id}`),
    offerIdRefer: (id, isFirst) =>
      mysql.raw(`${isFirst ? "" : "AND "} offer_id=${id}`),
    offerCategoryIdByOfferId: (id, isFirst) =>
      mysql.raw(
        `${isFirst ? "" : "AND "} O.offer_category_id=(
          SELECT offer_category_id FROM offers WHERE id=${id}
      )`
      ),
    districtIdsByOfferId: (id, isFirst) =>
      mysql.raw(
        `${isFirst ? "" : "AND "} O.district_id IN ((
                SELECT id FROM district 
                WHERE region_id=(
                    SELECT region_id FROM district WHERE id=(
                        SELECT district_id FROM offers WHERE id=${id}
                        )
                    )
                ))`
      ),
  },
  base: {
    limitOffset: (limit, offset) =>
      mysql.raw(`LIMIT ${limit} OFFSET ${offset}`),
  },
};

export default myRaw;
