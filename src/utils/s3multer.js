const multer = require("multer");
const multerS3 = require("multer-s3");
const AWS = require("aws-sdk");
import { v4 } from "uuid";

const credentials = new AWS.SharedIniFileCredentials({
  profile: process.env.AWS_PROFILE,
});
AWS.config.credentials = credentials;
AWS.config.region = process.env.AWS_REGION;

const s3 = new AWS.S3();

// initializeUpload : return a function upload, which is returned by multer
const initializeUpload = (folder) =>
  multer(
    {
      storage: multerS3({
        s3,
        bucket: process.env.AWS_BUCKET_NAME,
        acl: process.env.AWS_BUCKET_ACL,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: (req, file, cb) => {
          cb(
            null,
            `${folder}/${v4().toString().replaceAll("-", "")}.${file.mimetype
              .split("/")
              .pop()}`
          );
        },
      }),
      limits: { files: 12, fileSize: 1000 * 1000 * 100 },
    },
    "NONE"
  );

const deleteObjectByKey = (Key) =>
  s3.deleteObject(
    {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key,
    },
    // !: needs Refactoring
    (err, data) => {
      if (err) {
        throw err;
      }
    }
  );

const deleteObjects = (Objects) =>
  s3.deleteObjects(
    {
      Bucket: process.env.AWS_BUCKET_NAME,
      Delete: {
        Objects,
        Quiet: false,
      },
    },
    // !: needs Refactoring
    (err, data) => {
      if (err) {
        throw err;
      }
    }
  );

export { initializeUpload, deleteObjectByKey, deleteObjects };
