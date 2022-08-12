import mysql from "mysql2/promise";

import pool from "../db";
import myRaw from "../utils/myRaw";
import { constants } from "../utils/community";

// list posts
const listPosts = async (req, res) => {
  const {
    categoryId,
    searchTerm,
    limit,
    page,
    popularLimit,
    popularOffset,
    orderBy,
  } = req.query;

  // !: 상수화 필요
  const categoryIdRange = [1, 2, 3, 4, 5];
  if (!categoryIdRange.includes(Number(categoryId))) {
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

  const commonSql = mysql.format(myRaw.select.commonCommunityPosts, [
    myRaw.where.communityCategoryId(categoryId),
    myRaw.where.postTitleLike(searchTerm),
    myRaw.base.justRaw(orderBy),
    myRaw.base.limitOffset(LIMIT, OFFSET),
  ]);
  const popularSql = mysql.format(myRaw.select.popularCommunityPosts, [
    myRaw.where.communityCategoryId(categoryId),
    myRaw.where.postCreatedSince(dateAWeekAgo),
    myRaw.base.limitOffset(POPULAR_LIMIT, POPULAR_OFFSET),
  ]);
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

// detail post
const detailPost = async (req, res) => {
  const { postId } = req.params;

  const postSql = mysql.format(myRaw.select.communityPost, [
    myRaw.where.postId(postId),
  ]);
  const updateViewCountSql = mysql.format(myRaw.update.communityPostViewCount, [
    myRaw.where.postId(postId),
  ]);
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

// create post
const createPost = async (req, res) => {
  const { categoryId } = req.query;
  const { title, content } = req.body;
  const essential = [title, content];

  if (![1, 2, 3, 4, 5].includes(Number(categoryId))) {
    return res.status(403).json({ message: "CATEGORY_ID OUT OF RANGE" });
  }
  if (essential.includes(undefined)) {
    return res.status(403).json({ message: "OMISSION IN BODY" });
  }

  const jsonContent = JSON.stringify(content);
  const insertSql = mysql.format(myRaw.insert.communityPost, [
    req.user.userId,
    categoryId,
    title,
    jsonContent,
  ]);
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const [{ insertId }] = await connection.query(insertSql);
    return res.status(201).json({ insertId });
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

// update post
const updatePost = async (req, res) => {
  const { postId } = req.params;
  const { title, content } = req.body;
  const essential = [title, content];

  if (essential.includes(undefined)) {
    return res.status(403).json({ message: "OMISSION IN BODY" });
  }

  const jsonContent = JSON.stringify(content);
  const checkExSql = mysql.format(myRaw.select.exCommunityPost, [
    myRaw.where.postId(postId),
  ]);
  const updateSql = mysql.format(myRaw.update.communityPost, [
    title,
    jsonContent,
    myRaw.where.postId(postId),
  ]);
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const [[exPost]] = await connection.query(checkExSql);

    if (!exPost) {
      return res.status(403).json({ message: "RECORD NOT EXISTS" });
    } else if (exPost.user_id !== req.user.userId) {
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

// delete post
const deletePost = async (req, res) => {
  const { postId } = req.params;

  if (!Number.isInteger(Number(postId))) {
    return res.status(403).json({ message: "INVALID POST_ID" });
  }

  const checkExSql = mysql.format(myRaw.select.exCommunityPost, [
    myRaw.where.postId(postId),
  ]);
  const deleteCommentsSql = mysql.format(myRaw.delete.communityComments, [
    myRaw.where.postIdRefer(postId),
  ]);
  const deletePostSql = mysql.format(myRaw.delete.communityPost, [
    myRaw.where.postId(postId),
  ]);
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const [[exPost]] = await connection.query(checkExSql);
    if (!exPost) {
      return res.status(403).json({ message: "RECORD NOT EXISTS" });
    } else if (exPost.user_id !== req.user.userId) {
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

// list comments
const listComments = async (req, res) => {
  const { postId } = req.params;

  if (!Number.isInteger(Number(postId))) {
    return res.status(403).json({ message: "INVALID POST_ID" });
  }

  const checkExSql = mysql.format(myRaw.select.exCommunityPost, [
    myRaw.where.postId(postId),
  ]);
  const commentsSql = mysql.format(myRaw.select.communityComments, [
    myRaw.where.postIdRefer(postId),
  ]);
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

// create comment
const createComment = async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;

  if (content === undefined) {
    return res.status(403).json({ message: "OMISSION IN BODY" });
  }

  const checkExSql = mysql.format(myRaw.select.exCommunityPost, [
    myRaw.where.postId(postId),
  ]);
  const insertCommentSql = mysql.format(myRaw.insert.communityComments, [
    req.user.userId,
    postId,
    content,
  ]);
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const [[exPost]] = await connection.query(checkExSql);
    if (!exPost) {
      return res.status(403).json({ message: "RECORD NOT EXISTS" });
    }
    const [{ insertId }] = await connection.query(insertCommentSql);
    return res.status(201).json({ insertId });
  } catch (error) {
    return res.status(403).json({ message: error.message });
  } finally {
    connection.release();
  }
};

// update comment
const updateComment = async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (content === undefined) {
    return res.status(403).json({ message: "OMISSION IN BODY" });
  }

  const checkExSql = mysql.format(myRaw.select.exCommunityComment, [
    myRaw.where.commentId(commentId),
  ]);
  const updateSql = mysql.format(myRaw.update.communityComment, [
    content,
    myRaw.where.commentId(commentId),
  ]);
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const [[exComment]] = await connection.query(checkExSql);
    if (!exComment) {
      return res.status(403).json({ message: "RECORD NOT EXISTS" });
    } else if (exComment.user_id !== req.user.userId) {
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

// delete comment
const deleteComment = async (req, res) => {
  const { commentId } = req.params;

  const checkExSql = mysql.format(myRaw.select.exCommunityComment, [
    myRaw.where.commentId(commentId),
  ]);
  const deleteSql = mysql.format(myRaw.delete.communityComment, [
    myRaw.where.commentId(commentId),
  ]);
  const connection = await pool.getConnection(async (conn) => conn);

  try {
    const [[exComment]] = await connection.query(checkExSql);
    if (!exComment) {
      return res.status(403).json({ message: "RECORD NOT EXISTS" });
    } else if (exComment.user_id !== req.user.userId) {
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

// !: image API
const putCommunityContentImage = async (req, res) => {
  if (!req.file) {
    return res.status(403).json({ message: "OMISSION IN FILE" });
  }
  const { location: imageUrl } = req.file;

  return res.status(200).json({ imageUrl });
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
  putCommunityContentImage,
};
