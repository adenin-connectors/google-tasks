'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);
    const response = await api('/tasks/v1/users/@me/lists');
    $.isErrorResponse(activity, response);

    activity.Response.Data = {
      success: response && response.statusCode === 200
    };
  } catch (error) {
    $.handleError(activity, error);
    activity.Response.Data.success = false;
  }
};
