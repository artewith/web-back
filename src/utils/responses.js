const codes = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
};

const messages = {
  // ?: message를 어떻게 보내주는게 최선일까
  OK: "OK",
  UNCAUGHT_ERROR: "uncaught error!",
  RESOURCE_NOT_FOUND: "resource not found",
  INVALID_REQUEST: "invalid request",
  INVALID_USER: "invalid user",
  INVALID_ACCESS_TOKEN: "invalid access_token",
  INVALID_ARTE_TOKEN: "invalid arte_token",
  INVALID_VENDOR: "invalid vendor (social login)",
  OMISSION: "omission",
  BAD_PARAMS: "bad parameters",
  REJECTED_BY_SNS_VENDOR: "rejected by vendor (social login)",
  BAD_PERMISSION_LEVEL: "bad permission level",
};

export { codes, messages };
