'use strict';

const cfActivity = require('@adenin/cf-activity');
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);
    const response = await api('/tasks/v1/users/@me/lists');

    activity.Response.Data = {
      success: response && response.statusCode === 200
    };
  } catch (error) {
    cfActivity.handleError(activity, error);
    activity.Response.Data.success = false;
  }
};
