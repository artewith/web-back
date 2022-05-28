import mysql from "mysql2/promise";

const myRaw = {
  where: {
    id: (id) => mysql.raw(id ? `AND id=${id}` : ""),
    ids: (ids) => mysql.raw(ids ? `AND id IN (${[ids]})` : ""),
    offerCategoryId: (id) =>
      mysql.raw(
        id
          ? `AND offer_category_id=${id}`
          : `AND offer_category_id IN (1,2,3,4)`
      ),
    userId: (id) => mysql.raw(`AND user_id=${id}`),
    districtIds: (d, r) =>
      mysql.raw(
        d?.length && r?.length
          ? `AND O.district_id IN ( 
            SELECT id FROM district 
            WHERE id IN (${[d]}) OR D.region_id IN (
                SELECT id FROM region 
                WHERE id IN (${[r]})) 
            )`
          : d?.length
          ? `AND O.district_id IN (${[d]})`
          : r?.length
          ? `AND O.district_id IN ( 
            SELECT id from district 
            WHERE D.region_id IN (
                SELECT id FROM region 
                WHERE id IN (${[r]}))
            )`
          : ""
      ),
    workExperiences: (w) =>
      mysql.raw(w ? `AND O.work_experience IN (${[w]})` : ""),
    majorIds: (m) => mysql.raw(m ? `AND O.major_id IN (${[m]})` : ""),
    hasLectured: (h) => mysql.raw(h ? `AND O.has_lectured = ${h}` : ""),
    gender: (g) => mysql.raw(g ? `AND O.gender = ${g}` : ""),
    hourlyWage: (min, max) =>
      mysql.raw(
        min || max
          ? `AND O.hourly_wage BETWEEN ${min ? min : 0} AND ${
              max ? max : 200000
            }`
          : ""
      ),
    workForm: (w) => mysql.raw(w ? `AND O.work_form='${w}'` : ""),
    performerField: (p) => mysql.raw(p ? `AND O.performer_field='${p}'` : ""),
    selectedUntil: (date) =>
      mysql.raw(`AND selected_until > '${date.toISOString().split(".")[0]}'`),
    selectedUntilNullable: (date) =>
      mysql.raw(
        `AND (selected_until IS NULL OR selected_until > '${
          date.toISOString().split(".")[0]
        }')`
      ),
    offerId: (id) => mysql.raw(`AND O.id=${id}`),
    offerIdNot: (id) => mysql.raw(`AND O.id!=${id}`),
    offerIdRefer: (id) => mysql.raw(`AND offer_id=${id}`),
    houseIdRefer: (id) => mysql.raw(`AND practice_house_id=${id}`),
    offerCategoryIdByOfferId: (id) =>
      mysql.raw(
        `AND O.offer_category_id=(
          SELECT offer_category_id FROM offers WHERE id=${id}
      )`
      ),
    districtIdsByOfferId: (id) =>
      mysql.raw(
        `AND O.district_id IN ((
                SELECT id FROM district 
                WHERE region_id=(
                    SELECT region_id FROM district WHERE id=(
                        SELECT district_id FROM offers WHERE id=${id}
                        )
                    )
                ))`
      ),
    facilityIds: (ids) =>
      mysql.raw(ids ? `AND PF.facility_id IN (${[ids]})` : ""),
    facilitiesByHouseId: (id) =>
      mysql.raw(
        `AND F.id IN (
          SELECT facility_id FROM practice_houses_facility 
          WHERE practice_house_id = ${id}
      )`
      ),
    communityCategoryId: (id) => mysql.raw(`AND P.community_category_id=${id}`),
    postCreatedSince: (date) =>
      mysql.raw(date ? `AND P.created_at > '${date}'` : ""),
    postId: (id) => mysql.raw(`AND P.id=${id}`),
    postIdRefer: (id) => mysql.raw(`AND community_post_id=${id}`),
    commentId: (id) => mysql.raw(`AND C.id=${id}`),
  },
  base: {
    limitOffset: (limit, offset) =>
      mysql.raw(`LIMIT ${limit} OFFSET ${offset}`),
  },
  orderBy: {
    hourlyPrice: (order) =>
      mysql.raw(order === undefined ? "" : `hourly_price ${order} ,`),
    postTitleLike: (term) =>
      mysql.raw(term ? `P.title LIKE "%${term}%" DESC, ` : ""),
  },
};

export default myRaw;
