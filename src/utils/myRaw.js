import mysql from "mysql2/promise";

const myRaw = {
  select: {
    // check if user exists
    exUserBySNS: `SELECT * FROM users 
                WHERE sns_id=? 
                AND sns_auth_api_id=?`,
    exUser: `SELECT * FROM users 
                WHERE id=?`,
    // detail offer
    lessonResume: `SELECT O.*, U.name AS user_name, U.image_url AS user_image_url, M.name AS major_name, D.name AS district, C.name AS city, E.institution AS educated_institution, E.major AS educated_major, E.degree AS educated_degree 
        FROM lesson_resumes AS O 
        JOIN users AS U ON O.user_id=U.id 
        LEFT JOIN major AS M ON O.major_id=M.id 
        JOIN district AS D ON O.district_id=D.id
        LEFT JOIN city AS C ON D.city_id=C.id
        LEFT JOIN l_educations AS E ON E.resume_id=O.id AND E.is_representative=true
        WHERE 1=1 ?`,
    l_educations: `SELECT * FROM l_educations 
        WHERE 1=1 ?`,
    l_lectures: `SELECT * FROM l_lectures 
        WHERE 1=1 ?`,
    accompanistResume: `SELECT O.*, U.name AS user_name, U.image_url AS user_image_url, M.name AS major_name, D.name AS district, C.name AS city, E.institution AS educated_institution, E.major AS educated_major, E.degree AS educated_degree 
        FROM accompanist_resumes AS O 
        JOIN users AS U ON O.user_id=U.id 
        LEFT JOIN major AS M ON O.major_id=M.id 
        JOIN district AS D ON O.district_id=D.id
        LEFT JOIN city AS C ON D.city_id=C.id
        LEFT JOIN a_educations AS E ON E.resume_id=O.id AND E.is_representative=true
        WHERE 1=1 ?`,
    a_educations: `SELECT * FROM a_educations 
        WHERE 1=1 ?`,
    a_lectures: `SELECT * FROM a_lectures 
        WHERE 1=1 ?`,
    tutorRecruit: `SELECT O.*, U.name AS user_name, U.image_url AS user_image_url, D.name AS district, C.name AS city
        FROM tutor_recruits AS O 
        JOIN users AS U ON O.user_id=U.id 
        JOIN district AS D ON O.district_id=D.id
        LEFT JOIN city AS C ON D.city_id=C.id
        WHERE 1=1 ?`,
    accompanistRecruit: `SELECT O.*, U.name AS user_name, U.image_url AS user_image_url, M.name AS major_name, D.name AS district, C.name AS city
        FROM accompanist_recruits AS O 
        JOIN users AS U ON O.user_id=U.id 
        LEFT JOIN major AS M ON O.major_id=M.id 
        JOIN district AS D ON O.district_id=D.id
        LEFT JOIN city AS C ON D.city_id=C.id
        WHERE 1=1 ?`,

    // list offers
    commonLessonResumes: `SELECT O.*, U.name AS user_name, U.image_url AS user_image_url, M.name AS major_name, D.name AS district, C.name AS city, ll.institution AS lectured_institution, E.institution AS educated_institution, E.major AS educated_major, E.degree AS educated_degree 
        FROM lesson_resumes AS O 
        JOIN users AS U ON O.user_id=U.id 
        LEFT JOIN major AS M ON O.major_id=M.id 
        JOIN district AS D ON O.district_id=D.id
        JOIN city AS C ON D.city_id=C.id
        LEFT JOIN l_lectures AS ll ON ll.resume_id=O.id AND ll.is_representative=true 
        LEFT JOIN l_educations AS E ON E.resume_id=O.id AND E.is_representative=true 
        WHERE 1=1 ? ? ? ? ? ?
        ORDER BY selected_until DESC, updated_at DESC 
        ?`,
    selectedLessonResumes: `SELECT O.*, U.name AS user_name, U.image_url AS user_image_url, M.name AS major_name, D.name AS district, R.name AS city, L.institution AS lectured_institution, E.institution AS educated_institution, E.major AS educated_major, E.degree AS educated_degree 
        FROM lesson_resumes AS O 
        JOIN users AS U ON O.user_id=U.id 
        LEFT JOIN major AS M ON O.major_id=M.id 
        JOIN district AS D ON O.district_id=D.id
        JOIN city AS R ON D.city_id=R.id
        LEFT JOIN l_lectures AS L ON L.resume_id=O.id AND L.is_representative=true 
        LEFT JOIN l_educations AS E ON E.resume_id=O.id AND E.is_representative=true
        WHERE 1=1 ? 
        ORDER BY updated_at DESC 
        ?`,
    commonAccompanistResumes: `SELECT O.*, U.name AS user_name, U.image_url AS user_image_url, M.name AS major_name, D.name AS district, C.name AS city, ll.institution AS lectured_institution, E.institution AS educated_institution, E.major AS educated_major, E.degree AS educated_degree 
        FROM lesson_resumes AS O 
        JOIN users AS U ON O.user_id=U.id 
        LEFT JOIN major AS M ON O.major_id=M.id 
        JOIN district AS D ON O.district_id=D.id
        JOIN city AS C ON D.city_id=C.id
        LEFT JOIN a_lectures AS ll ON ll.resume_id=O.id AND ll.is_representative=true 
        LEFT JOIN a_educations AS E ON E.resume_id=O.id AND E.is_representative=true 
        WHERE 1=1 ? ? ? 
        ORDER BY selected_until DESC, updated_at DESC 
        ?`,
    selectedAccompanistResumes: `SELECT O.*, U.name AS user_name, U.image_url AS user_image_url, M.name AS major_name, D.name AS district, R.name AS city, L.institution AS lectured_institution, E.institution AS educated_institution, E.major AS educated_major, E.degree AS educated_degree 
        FROM lesson_resumes AS O 
        JOIN users AS U ON O.user_id=U.id 
        LEFT JOIN major AS M ON O.major_id=M.id 
        JOIN district AS D ON O.district_id=D.id
        JOIN city AS R ON D.city_id=R.id
        LEFT JOIN l_lectures AS L ON L.resume_id=O.id AND L.is_representative=true 
        LEFT JOIN l_educations AS E ON E.resume_id=O.id AND E.is_representative=true
        WHERE 1=1 ? 
        ORDER BY updated_at DESC 
        ?`,
    commonTutorRecruits: `SELECT O.*, U.name AS user_name, U.image_url AS user_image_url, D.name AS district, C.name AS city
        FROM tutor_recruits AS O 
        JOIN users AS U ON O.user_id=U.id 
        JOIN district AS D ON O.district_id=D.id
        JOIN city AS C ON D.city_id=C.id
        WHERE 1=1 ? ? ? 
        ORDER BY selected_until DESC, updated_at DESC 
        ?`,
    selectedTutorRecruits: `SELECT O.*, U.name AS user_name, U.image_url AS user_image_url, D.name AS district, R.name AS city
        FROM tutor_recruits AS O 
        JOIN users AS U ON O.user_id=U.id 
        JOIN district AS D ON O.district_id=D.id
        JOIN city AS R ON D.city_id=R.id
        WHERE 1=1 ? 
        ORDER BY updated_at DESC 
        ?`,
    commonAccompanistRecruits: `SELECT O.*, U.name AS user_name, U.image_url AS user_image_url, D.name AS district, C.name AS city
        FROM accompanist_recruits AS O 
        JOIN users AS U ON O.user_id=U.id 
        JOIN district AS D ON O.district_id=D.id
        JOIN city AS C ON D.city_id=C.id
        WHERE 1=1 ? ? ? 
        ORDER BY selected_until DESC, updated_at DESC 
        ?`,
    selectedAccompanistRecruits: `SELECT O.*, U.name AS user_name, U.image_url AS user_image_url, D.name AS district, R.name AS city
        FROM accompanist_recruits AS O 
        JOIN users AS U ON O.user_id=U.id 
        JOIN district AS D ON O.district_id=D.id
        JOIN city AS R ON D.city_id=R.id
        WHERE 1=1 ? 
        ORDER BY updated_at DESC 
        ?`,
    // recommend offers
    recommendLessonResumes: `SELECT  O.*, U.name AS user_name, U.image_url AS user_image_url, M.name AS major_name, D.name AS district, R.name AS city, L.institution AS lectured_institution, E.institution AS educated_institution, E.major AS educated_major, E.degree AS educated_degree 
        FROM lesson_resumes AS O 
        JOIN users AS U ON O.user_id=U.id 
        LEFT JOIN major AS M ON O.major_id=M.id 
        JOIN district AS D ON O.district_id=D.id
        JOIN city AS R ON D.city_id=R.id
        LEFT JOIN l_lectures AS L ON L.resume_id=O.id AND L.is_representative=true 
        LEFT JOIN l_educations AS E ON E.resume_id=O.id AND E.is_representative=true 
        WHERE 1=1 ? ?
        ORDER BY selected_until DESC, updated_at DESC 
        ?`,
    recommendAccompanistResumes: `SELECT  O.*, U.name AS user_name, U.image_url AS user_image_url, M.name AS major_name, D.name AS district, R.name AS city, L.institution AS lectured_institution, E.institution AS educated_institution, E.major AS educated_major, E.degree AS educated_degree 
        FROM accompanist_resumes AS O 
        JOIN users AS U ON O.user_id=U.id 
        LEFT JOIN major AS M ON O.major_id=M.id 
        JOIN district AS D ON O.district_id=D.id
        JOIN city AS R ON D.city_id=R.id
        LEFT JOIN l_lectures AS L ON L.resume_id=O.id AND L.is_representative=true 
        LEFT JOIN l_educations AS E ON E.resume_id=O.id AND E.is_representative=true 
        WHERE 1=1 ? ?
        ORDER BY selected_until DESC, updated_at DESC 
        ?`,
    recommendTutorRecruits: `SELECT  O.*, U.name AS user_name, U.image_url AS user_image_url, D.name AS district, R.name AS city
        FROM tutor_recruits AS O 
        JOIN users AS U ON O.user_id=U.id 
        JOIN district AS D ON O.district_id=D.id
        JOIN city AS R ON D.city_id=R.id
        WHERE 1=1 ? ?
        ORDER BY selected_until DESC, updated_at DESC 
        ?`,
    recommendAccompanistRecruits: `SELECT  O.*, U.name AS user_name, U.image_url AS user_image_url, M.name AS major_name, D.name AS district, R.name AS city
        FROM accompanist_recruits AS O 
        JOIN users AS U ON O.user_id=U.id 
        LEFT JOIN major AS M ON O.major_id=M.id 
        JOIN district AS D ON O.district_id=D.id
        JOIN city AS R ON D.city_id=R.id
        WHERE 1=1 ? ?
        ORDER BY selected_until DESC, updated_at DESC 
        ?`,
    // check if offer exists
    exLessonResume: `SELECT id, user_id, image_url FROM lesson_resumes 
        WHERE 1=1 ?`,
    exAccompanistResume: `SELECT id, user_id, image_url FROM accompanist_resumes 
        WHERE 1=1 ?`,
    exTutorRecruit: `SELECT id, user_id, image_url FROM tutor_recruits 
        WHERE 1=1 ?`,
    exAccompanistRecruit: `SELECT id, user_id, image_url FROM accompanist_recruits 
        WHERE 1=1 ?`,

    // detail practice houses
    practiceHouse: `SELECT O.*, D.name AS district_name, C.id AS city_id, C.name AS city_name, U.name AS user_name
        FROM practice_houses AS O 
        JOIN district AS D ON O.district_id=D.id 
        JOIN city AS C ON D.city_id=C.id
        JOIN users AS U ON O.user_id=U.id
        WHERE 1=1 ?`,
    rooms: `SELECT * FROM rooms
        WHERE 1=1 ?`,
    facilities: `SELECT * FROM facility AS F
        WHERE 1=1 ?`,
    // list practice houses
    commonPracticeHouses: `SELECT O.*, D.name AS district_name, C.id AS city_id, C.name AS city_name, U.name AS user_name
        FROM practice_houses AS O 
        LEFT JOIN practice_houses_facility AS PF ON PF.practice_house_id=O.id
        JOIN district AS D ON O.district_id=D.id 
        JOIN city AS C ON D.city_id=C.id
        JOIN users AS U ON O.user_id=U.id
        WHERE 1=1 ? ? ?
        GROUP BY O.id
        ORDER BY selected_until DESC, ? updated_at DESC 
        ?`,
    selectedPracticeHouses: `SELECT O.*, D.name AS district_name, C.id AS city_id, C.name AS city_name, U.name AS user_name
        FROM practice_houses AS O
        JOIN district AS D ON O.district_id=D.id 
        JOIN city AS C ON D.city_id=C.id
        JOIN users AS U ON O.user_id=U.id
        WHERE 1=1 ?
        ORDER BY updated_at DESC
        ?`,
    // recommend practice houses
    recommendPracticeHouses: `SELECT O.*, D.name AS district_name, C.id AS city_id, C.name AS city_name, U.name AS user_name
        FROM practice_houses AS O
        JOIN district AS D ON O.district_id=D.id 
        JOIN city AS C ON D.city_id=C.id
        JOIN users AS U ON O.user_id=U.id
        WHERE 1=1 ? ?
        ORDER BY selected_until DESC, updated_at DESC 
        ?`,
    // check practice house exists
    exPracticeHouse: `SELECT id, user_id, image_url FROM practice_houses 
        WHERE 1=1 ? 
        LIMIT 1`,
    exFacilities: `SELECT facility_id FROM practice_houses_facility 
        WHERE 1=1 ?`,
    // lastInsertId
    lastInsertId: `SELECT LAST_INSERT_ID() AS lastInsertId`,

    // list community posts
    commonCommunityPosts: `SELECT P.id, P.community_category_id, P.title, P.view_count, P.created_at, U.name AS user_name, U.id AS user_id, U.image_url AS user_image_url
        FROM community_posts AS P
        JOIN users AS U ON P.user_id=U.id
        WHERE 1=1 ? ?
        ORDER BY ?
        ?`,
    popularCommunityPosts: `SELECT P.id, P.community_category_id, P.title, P.view_count, P.created_at, U.name AS user_name, U.id AS user_id, U.image_url AS user_image_url
        FROM community_posts AS P
        JOIN users AS U ON P.user_id=U.id
        WHERE 1=1 ? ?
        ORDER BY view_count DESC, created_at DESC
        ?`,

    communityPost: `SELECT P.*, U.id AS user_id, U.name AS user_name, U.image_url AS user_image_url
        FROM community_posts AS P
        JOIN users AS U ON P.user_id=U.id
        WHERE 1=1 ?`,
    exCommunityPost: `SELECT id, user_id FROM community_posts AS P
        WHERE 1=1 ?`,
    communityComments: `SELECT C.*, U.id AS user_id, U.name AS user_name, U.image_url AS user_image_url 
              FROM community_comments AS C
              JOIN users AS U ON C.user_id=U.id
              WHERE 1=1 ?
              ORDER BY created_at DESC`,
    exCommunityComment: `SELECT id, user_id FROM community_comments AS C
        WHERE 1=1 ?`,
  },
  insert: {
    // user
    kakaoUser: `INSERT INTO users (role_id, sns_auth_api_id, sns_id, name, email, image_url, gender, age_range) 
                VALUES (?,?,?,?,?,?,?,?)`,
    naverUser: `INSERT INTO users (role_id, sns_auth_api_id, sns_id, name, email, image_url, gender, age_range, phone_number) 
                VALUES (?,?,?,?,?,?,?,?,?)`,
    googleUser: `INSERT INTO users (role_id, sns_auth_api_id, sns_id, name, email, image_url) 
                VALUES (?,?,?,?,?,?)`,

    // create offer
    lessoneResume: `INSERT INTO lesson_resumes ( user_id, district_id, major_id, title,  description, contact_A, contact_B, contact_C, contact_D, hourly_wage, is_negotiable, work_experience, gender, image_url ) VALUES ( ?,?,?,?,?,?,?,?,?,?,?,?,?,? )`,
    l_lectures: `INSERT INTO l_lectures(resume_id, institution, is_representative) 
        VALUES(?,?,?)`,
    l_educations: `INSERT INTO l_educations(resume_id, institution, major, degree, is_representative) 
        VALUES(?,?,?,?,?)`,
    accompanistResume: `INSERT INTO accompanist_resumes ( user_id, district_id, major_id, title,  description, contact_A, contact_B, contact_C, contact_D, hourly_wage, is_negotiable, work_experience, image_url ) 
        VALUES ( ?,?,?,?,?,?,?,?,?,?,?,?,? )`,
    a_lectures: `INSERT INTO a_lectures(resume_id, institution, is_representative) 
            VALUES(?,?,?)`,
    a_educations: `INSERT INTO a_educations(resume_id, institution, major, degree, is_representative) 
            VALUES(?,?,?,?,?)`,
    tutorRecruit: `INSERT INTO tutor_recruits (user_id, district_id, title, description, hourly_wage, is_negotiable,  contact_A, contact_B, contact_C, contact_D, institution, monthly_wage, direction, work_form, image_url) 
        VALUES ( ?,?,?,?,?,?,?,?,?,?,?,?,?,?,? )`,
    accompanistRecruit: `INSERT INTO accompanist_recruits (user_id, district_id, major_id, title, description, hourly_wage,  is_negotiable, contact_A, contact_B, contact_C, contact_D, image_url) 
        VALUES ( ?,?,?,?,?,?,?,?,?,?,?,? )`,
    // create practice houses
    practiceHouse: `INSERT INTO practice_houses ( user_id, district_id, title, hourly_price,  description, direction, contact_A, contact_B, contact_C, contact_D, image_url ) 
        VALUES ( ?,?,?,?,?,?,?,?,?,?,? )`,
    rooms: `INSERT INTO rooms (practice_house_id, name, instrument, hourly_price, image_url )
            VALUES(?,?,?,?,?)`,
    facilities: `INSERT INTO practice_houses_facility(practice_house_id, facility_id) 
            VALUES(?,?)`,
    // community_posts
    communityPost: `INSERT INTO community_posts(user_id, community_category_id, title, content_quill)
        VALUES(?,?,?,?)`,
    communityComments: `INSERT INTO community_comments(user_id, community_post_id, content)
        VALUES (?,?,?)`,
  },
  update: {
    // increase offer view count
    lessonResumeViewCount: `UPDATE lesson_resumes AS O 
        SET view_count=view_count+1 
        WHERE 1=1 ?`,
    accompanistResumeViewCount: `UPDATE accompanist_resumes AS O 
        SET view_count=view_count+1 
        WHERE 1=1 ?`,
    tutorRecruitViewCount: `UPDATE accompanist_resumes AS O 
        SET view_count=view_count+1 
        WHERE 1=1 ?`,
    accompanistRecruitViewCount: `UPDATE accompanist_recruits AS O 
        SET view_count=view_count+1 
        WHERE 1=1 ?`,
    // update individual offer
    lessonResume: `UPDATE lesson_resumes
        SET district_id=?, major_id=?, title=?, description=?, hourly_wage=?, is_negotiable=?, contact_A=?, contact_B=?, contact_C=?, contact_D=?, work_experience=?, gender=?, image_url=?
        WHERE 1=1 ?`,
    l_educations: `UPDATE l_educations 
                  SET institution=?, major=?, degree=?, is_representative=? 
                  WHERE 1=1 ?`,
    l_lectures: `UPDATE l_lectures 
                  SET institution=?, is_representative=? 
                  WHERE 1=1 ?`,
    accompanistResume: `UPDATE accompanist_resumes
        SET district_id=?, major_id=?, title=?, description=?, hourly_wage=?, is_negotiable=?, contact_A=?, contact_B=?, contact_C=?, contact_D=?, work_experience=?, image_url=?
        WHERE 1=1 ?`,
    a_educations: `UPDATE a_educations 
                  SET institution=?, major=?, degree=?, is_representative=? 
                  WHERE 1=1 ?`,
    a_lectures: `UPDATE a_lectures 
                  SET institution=?, is_representative=? 
                  WHERE 1=1 ?`,
    tutorRecruit: `UPDATE tutor_recruits
        SET district_id=?, title=?, description=?, hourly_wage=?, is_negotiable=?, contact_A=?, contact_B=?, contact_C=?, contact_D=?, institution=?, monthly_wage=?, direction=?, work_form=?, image_url=?
      WHERE 1=1 ?`,
    accompanistRecruit: `UPDATE accompanist_recruits
        SET district_id=?, major_id=?, title=?, description=?, hourly_wage=?, is_negotiable=?, contact_A=?,contact_B=?, contact_C=?, contact_D=?, image_url=?
        WHERE 1=1 ?`,
    // increase
    practiceHouseViewCount: `UPDATE practice_houses 
        SET view_count=view_count+1 
        WHERE 1=1 ?`,
    // update practice_houses
    practiceHouse: `UPDATE practice_houses
        SET district_id=?, title=?, description=?, contact_A=?, contact_B=?, contact_C=?, contact_D=?, hourly_price=?, direction=?, image_url=?
        WHERE 1=1 ?`,
    rooms: `UPDATE rooms
        SET name=?, instrument=?, hourly_price=?, image_url=?
        WHERE 1=1 ?`,
    // update community post
    communityPostViewCount: `UPDATE community_posts AS P
        SET view_count=view_count+1
        WHERE 1=1 ?`,
    communityPost: `UPDATE community_posts AS P
        SET title=?, content_quill=?
        WHERE 1=1 ?`,
    communityComment: `UPDATE community_comments AS C
        SET content=?
        WHERE 1=1 ?`,
  },
  delete: {
    // offers
    l_educations: `DELETE FROM l_educations 
                  WHERE 1=1 ?`,
    l_lectures: `DELETE FROM l_lectures 
                  WHERE 1=1 ?`,
    a_educations: `DELETE FROM a_educations 
                  WHERE 1=1 ?`,
    a_lectures: `DELETE FROM a_lectures 
                  WHERE 1=1 ?`,
    lessonResume: `DELETE FROM lesson_resumes 
        WHERE 1=1 ?`,
    accompanistResume: `DELETE FROM accompanist_resumes
        WHERE 1=1 ?`,
    tutorRecruit: `DELETE FROM tutor_recruits
        WHERE 1=1 ?`,
    accompanistRecruit: `DELETE FROM accompanist_recruits
        WHERE 1=1 ?`,
    // practice_houses
    practiceHouse: `DELETE FROM practice_houses
        WHERE 1=1 ?`,
    rooms: `DELETE FROM rooms
                WHERE 1=1 ?`,
    facilities: `DELETE FROM practice_houses_facility
            WHERE 1=1 ? ?`,
    allFacilities: `DELETE FROM practice_houses_facility
        WHERE 1=1 ?`,
    // community_posts
    communityComments: `DELETE FROM community_comments
        WHERE 1=1 ?`,
    communityPost: `DELETE FROM community_posts AS P
        WHERE 1=1 ?`,
    communityComment: `DELETE FROM community_comments AS C
        WHERE 1=1 ?`,
  },
  where: {
    id: (id) => mysql.raw(id ? `AND id=${id}` : ""),
    uId: (id) => mysql.raw(id ? `AND U.id=${id}` : ""),
    ids: (ids) => mysql.raw(ids ? `AND id IN (${[ids]})` : ""),
    offerCategoryId: (id) =>
      mysql.raw(
        id
          ? `AND offer_category_id=${id}`
          : `AND offer_category_id IN (1,2,3,4)`
      ),
    userId: (id) => mysql.raw(`AND user_id=${id}`),
    districtIds: (d, c) =>
      mysql.raw(
        d?.length && c?.length
          ? `AND O.district_id IN ( 
            SELECT id FROM district 
            WHERE id IN (${[d]}) OR D.city_id IN (
                SELECT id FROM city
                WHERE id IN (${[c]})) 
            )`
          : d?.length
          ? `AND O.district_id IN (${[d]})`
          : c?.length
          ? `AND O.district_id IN ( 
            SELECT id from district 
            WHERE D.city_id IN (
                SELECT id FROM city 
                WHERE id IN (${[c]}))
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
    hasLectured: (has) =>
      mysql.raw(
        has === undefined
          ? ""
          : has === "1"
          ? `AND ll.id IS NOT NULL`
          : has === "0" && `AND ll.id IS NULL`
      ),
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
    resumeIdRefer: (id) => mysql.raw(`AND resume_id=${id}`),
    houseIdRefer: (id) => mysql.raw(`AND practice_house_id=${id}`),
    offerCategoryIdByOfferId: (id) =>
      mysql.raw(
        `AND O.offer_category_id=(
          SELECT offer_category_id FROM offers WHERE id=${id}
      )`
      ),
    districtIdsByOfferId: (id, offertype) =>
      mysql.raw(
        `AND O.district_id IN ((
                SELECT id FROM district 
                WHERE city_id=(
                    SELECT city_id FROM district WHERE id=(
                        SELECT district_id FROM ${offertype} WHERE id=${id}
                        )
                    )
                ))`
      ),
    facilityId: (id) => mysql.raw(`AND facility_id = ${id}`),
    facilityIds: (ids) =>
      mysql.raw(ids ? `AND PF.facility_id IN (${[ids]})` : ""),
    facilitiesByHouseId: (id) =>
      mysql.raw(
        `AND F.id IN (
          SELECT facility_id FROM practice_houses_facility 
          WHERE practice_house_id = ${id}
      )`
      ),
    practiceHouseIdRefer: (id) => mysql.raw(`AND practice_house_id=${id}`),
    communityCategoryId: (id) => mysql.raw(`AND P.community_category_id=${id}`),
    postCreatedSince: (date) =>
      mysql.raw(date ? `AND P.created_at > '${date}'` : ""),
    postId: (id) => mysql.raw(`AND P.id=${id}`),
    postIdRefer: (id) => mysql.raw(`AND community_post_id=${id}`),
    postTitleLike: (term) =>
      mysql.raw(term ? `AND P.title LIKE "%${term}%"` : ""),
    commentId: (id) => mysql.raw(`AND C.id=${id}`),
  },
  base: {
    limitOffset: (limit, offset) =>
      mysql.raw(`LIMIT ${limit} OFFSET ${offset}`),
    justRaw: (param) => (param ? mysql.raw(param) : null),
  },
  orderBy: {
    hourlyPrice: (order) =>
      mysql.raw(order === undefined ? "" : `hourly_price ${order} ,`),
    createdAt: (order) => mysql.raw(order ? `, created_at ${order}` : ""),
    viewCount: (order) => mysql.raw(order ? `, view_count ${order}` : ""),
  },
};

export default myRaw;
