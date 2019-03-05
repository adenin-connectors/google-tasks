'use strict';

const cfActivity = require('@adenin/cf-activity');
const api = require('./common/api');


module.exports = async function (activity) {

  try {
    api.initialize(activity);

    const response = await api.getTodaysTasks();

    if (!cfActivity.isResponseOk(activity, response)) {
      return;
    }
    
    activity.Response.Data = api.convertTasks(response);
  } catch (error) {
    cfActivity.handleError(activity, error);
  }
};