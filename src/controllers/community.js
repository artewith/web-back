import mysql from "mysql2/promise";

import pool from "../db";
import myRaw from "../utils/myRaw";
import { constants } from "../utils/community";

const listPosts = async (req, res) => {
  const { categoryId, searchTerm, limit, page, popularLimit, popularOffset } =
    req.query;

  if (![1, 2, 3, 4, 5].includes(Number(categoryId))) {
    return res.status(403).json({ message: "CATEGORY_ID OUT OF RANGE" });
  }

  const LIMIT = limit ? limit : constants.DEFAULT_LIMIT;
  const OFFSET = page ? LIMIT * (page - 1) : constants.DEFAULT_OFFSET;
  const POPULAR_LIMIT = popularLimit
    ? popularLimit
    : constants.DEFAULT_POPULAR_LIMIT;
  const POPULAR_OFFSET = popularOffset
    ? popularOffset
    : constants.DEFAULT_OFFSET;
  const date = new Date();
  date.setDate(date.getDate() - 7);
  const dateAWeekAgo = date.toISOString().split(".")[0];

  const commonSql = mysql.format(
    `SELECT P.*, U.name AS user_name, U.id AS user_id FROM community_posts AS P
        JOIN users AS U ON P.user_id=U.id
        WHERE 1=1 ?
        ORDER BY ? created_at DESC
        ?
  `,
    [
      myRaw.where.communityCategoryId(categoryId),
      myRaw.orderBy.postTitleLike(searchTerm),
      myRaw.base.limitOffset(LIMIT, OFFSET),
    ]
  );
  const popularSql = mysql.format(
    `SELECT P.*, U.name AS user_name, U.id AS user_id FROM community_posts AS P
        JOIN users AS U ON P.user_id=U.id
        WHERE 1=1 ? ?
        ORDER BY view_count DESC, created_at DESC
        ?
  `,
    [
      myRaw.where.communityCategoryId(categoryId),
      myRaw.where.postCreatedSince(dateAWeekAgo),
      myRaw.base.limitOffset(POPULAR_LIMIT, POPULAR_OFFSET),
    ]
  );
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const [common] = await connection.query(commonSql);
    const [popular] = await connection.query(popularSql);
    res.status(200).json({ common, popular });
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

const detailPost = async (req, res) => {
  const { postId } = req.params;

  if (!Number.isInteger(Number(postId))) {
    return res.status(403).json({ message: "INVALID POST_ID" });
  }

  const postSql = mysql.format(
    `SELECT P.*, U.id AS user_id, U.name AS user_name FROM community_posts AS P
        JOIN users AS U ON P.user_id=U.id
        WHERE 1=1 ?
    `,
    [myRaw.where.postId(postId)]
  );
  const updateViewCountSql = mysql.format(
    `UPDATE community_posts AS P
        SET view_count=view_count+1
        WHERE 1=1 ?
    `,
    [myRaw.where.postId(postId)]
  );
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const [[post]] = await connection.query(postSql);
    if (!post) {
      return res.status(403).json({ message: "RECORD NOT EXISTS" });
    }
    await connection.query(updateViewCountSql);
    return res.status(200).json(post);
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

const createPost = async (req, res) => {
  const { recordId } = req.user;
  const { categoryId } = req.query;
  const { title, content } = req.body;

  if (![1, 2, 3, 4, 5].includes(Number(categoryId))) {
    return res.status(403).json({ message: "CATEGORY_ID OUT OF RANGE" });
  }
  if (!title || !content) {
    return res.status(403).json({ message: "OMISSION IN BODY" });
  }

  const insertSql = mysql.format(
    `INSERT INTO community_posts(user_id, community_category_id, title, content)
        VALUES(?,?,?,?)
    `,
    [recordId, categoryId, title, content]
  );
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    await connection.query(insertSql);
    const [[{ lastInsertId }]] = await connection.query(
      `SELECT LAST_INSERT_ID() AS lastInsertId`
    );
    return res.status(201).json({ lastInsertId });
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};
const updatePost = async (req, res) => {
  const { recordId } = req.user;
  const { postId } = req.params;
  const { title, content } = req.body;

  if (!Number.isInteger(Number(postId))) {
    return res.status(403).json({ message: "INVALID POST_ID" });
  }
  if (!title || !content) {
    return res.status(403).json({ message: "OMISSION IN BODY" });
  }

  const checkExSql = mysql.format(
    `SELECT id, user_id FROM community_posts AS P
        WHERE 1=1 ?
    `,
    [myRaw.where.postId(postId)]
  );
  const updateSql = mysql.format(
    `UPDATE community_posts AS P
        SET title=?, content=?
        WHERE 1=1 ?
    `,
    [title, content, myRaw.where.postId(postId)]
  );
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const [[exPost]] = await connection.query(checkExSql);

    if (!exPost) {
      return res.status(403).json({ message: "RECORD NOT EXISTS" });
    } else if (exPost.user_id !== recordId) {
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
const deletePost = async (req, res) => {
  const { recordId } = req.user;
  const { postId } = req.params;

  if (!Number.isInteger(Number(postId))) {
    return res.status(403).json({ message: "INVALID POST_ID" });
  }

  const checkExSql = mysql.format(
    `SELECT id, user_id FROM community_posts AS P
        WHERE 1=1 ?
    `,
    [myRaw.where.postId(postId)]
  );
  const deleteCommentsSql = mysql.format(
    `DELETE FROM community_comments
        WHERE 1=1 ?
    `,
    [myRaw.where.postIdRefer(postId)]
  );
  const deletePostSql = mysql.format(
    `DELETE FROM community_posts AS P
        WHERE 1=1 ?
    `,
    [myRaw.where.postId(postId)]
  );
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const [[exPost]] = await connection.query(checkExSql);
    if (!exPost) {
      return res.status(403).json({ message: "RECORD NOT EXISTS" });
    } else if (exPost.user_id !== recordId) {
      return res.status(403).json({ message: "INVALID USER" });
    }

    await connection.query(deleteCommentsSql);
    await connection.query(deletePostSql);
    return res.status(204).end();
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

const listComments = async (req, res) => {
  const { postId } = req.params;

  if (!Number.isInteger(Number(postId))) {
    return res.status(403).json({ message: "INVALID POST_ID" });
  }

  const checkExSql = mysql.format(
    `SELECT id, user_id FROM community_posts AS P
        WHERE 1=1 ?
    `,
    [myRaw.where.postId(postId)]
  );
  const commentsSql = mysql.format(
    `SELECT C.*, U.id AS user_id, U.name AS user_name FROM community_comments AS C
        JOIN users AS U ON C.user_id=U.id
        WHERE 1=1 ?
        ORDER BY created_at DESC
    `,
    [myRaw.where.postIdRefer(postId)]
  );
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const [[exPost]] = await connection.query(checkExSql);
    if (!exPost) {
      return res.status(403).json({ message: "RECORD NOT EXISTS" });
    }
    const [comments] = await connection.query(commentsSql);
    return res.status(200).json(comments);
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};
const createComment = async (req, res) => {
  const { recordId } = req.user;
  const { postId } = req.params;
  const { content } = req.body;

  if (!Number.isInteger(Number(postId))) {
    return res.status(403).json({ message: "INVALID POST_ID" });
  }
  if (!content) {
    return res.status(403).json({ message: "OMISSION IN BODY" });
  }

  const checkExSql = mysql.format(
    `SELECT id, user_id FROM community_posts AS P
        WHERE 1=1 ?
    `,
    [myRaw.where.postId(postId)]
  );
  const insertCommentSql = mysql.format(
    `INSERT INTO community_comments(user_id, community_post_id, content)
        VALUES (?,?,?)
    `,
    [recordId, postId, content]
  );
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const [[exPost]] = await connection.query(checkExSql);
    if (!exPost) {
      return res.status(403).json({ message: "RECORD NOT EXISTS" });
    }
    await connection.query(insertCommentSql);
    const [[{ lastInsertId }]] = await connection.query(
      `SELECT LAST_INSERT_ID() AS lastInsertId`
    );
    return res.status(201).json({ lastInsertId });
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};
const updateComment = async (req, res) => {
  const { recordId } = req.user;
  const { commentId } = req.params;
  const { content } = req.body;

  if (!Number.isInteger(Number(commentId))) {
    return res.status(403).json({ message: "INVALID COMMENT_ID" });
  }
  if (!content) {
    return res.status(403).json({ message: "OMISSION IN BODY" });
  }

  const checkExSql = mysql.format(
    `SELECT id, user_id FROM community_comments AS C
        WHERE 1=1 ?
    `,
    [myRaw.where.commentId(commentId)]
  );
  const updateSql = mysql.format(
    `UPDATE community_comments AS C
        SET content=?
        WHERE 1=1 ?
    `,
    [content, myRaw.where.commentId(commentId)]
  );
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const [[exComment]] = await connection.query(checkExSql);
    if (!exComment) {
      return res.status(403).json({ message: "RECORD NOT EXISTS" });
    } else if (exComment.user_id !== recordId) {
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
const deleteComment = async (req, res) => {
  const { recordId } = req.user;
  const { commentId } = req.params;

  if (!Number.isInteger(Number(commentId))) {
    return res.status(403).json({ message: "INVALID COMMENT_ID" });
  }

  const checkExSql = mysql.format(
    `SELECT id, user_id FROM community_comments AS C
        WHERE 1=1 ?
    `,
    [myRaw.where.commentId(commentId)]
  );
  const deleteSql = mysql.format(
    `DELETE FROM community_comments AS C
        WHERE 1=1 ?
    `,
    [myRaw.where.commentId(commentId)]
  );
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const [[exComment]] = await connection.query(checkExSql);
    if (!exComment) {
      return res.status(403).json({ message: "RECORD NOT EXISTS" });
    } else if (exComment.user_id !== recordId) {
      return res.status(403).json({ message: "INVALID USER" });
    }

    await connection.query(deleteSql);
    return res.status(204).end();
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

export {
  listPosts,
  detailPost,
  createPost,
  updatePost,
  deletePost,
  listComments,
  createComment,
  updateComment,
  deleteComment,
};
