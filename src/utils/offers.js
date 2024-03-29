const constants = {
  ENTRANCE_RESUME_ID: 1,
  ACADEMY_RECRUIT_ID: 2,
  ACCOMPANY_RECRUIT_ID: 3,
  ACCOMPANY_RESUME_ID: 4,

  DEFAULT_LIMIT: 20,
  DEFAULT_OFFSET: 0,
  DEFAULT_SELECTED_LIMIT: 6,
  DEFAULT_RECOMMEND_LIMIT: 6,
};

const functions = {
  convertParamsToArray: (param) =>
    param && !Array.isArray(param) ? [param] : param,
};

export { constants, functions };
