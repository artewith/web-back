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
  // ?: 우리끼리 의미적으로 약속한 code를 만들까? 평소에 코드짜기 쉽게.
  OK_WITH_SINGLE_RECORD: "OK with a single record",
  OK_WITH_MULTIPLE_RECORDS: "OK with multiple records",
  UNCAUGHT_ERROR: "uncaught error!",
  RESOURCE_NOT_FOUND: "resource not found",
  INVALID_REQUEST: "invalid request",
  INVALID_USER: "invalid user",
  INVALID_ACCESS_TOKEN: "invalid access_token",
  INVALID_ARTE_TOKEN: "invalid arte_token",
  INVALID_VENDOR: "invalid vendor (social login)",
  OMISSION: "omission",
  BAD_PARAMS: "bad parameters",
  REJECTED_BY_VENDOR: "rejected by vendor",
};

export { codes, messages };
