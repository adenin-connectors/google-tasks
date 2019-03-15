'use strict';

const cfActivity = require('@adenin/cf-activity');
const api = require('./common/api');


module.exports = async function (activity) {

  try {
    api.initialize(activity);
    let pagination = cfActivity.pagination(activity);
    const response = await api.getTodaysTasks(pagination);

    if (!cfActivity.isResponseOk(activity, response)) {
      return;
    }
    
    activity.Response.Data = api.convertTasks(response);
    if(response.body.nextPageToken){
      activity.Response.Data._nextpage = response.body.nextPageToken;
    }
  } catch (error) {
    cfActivity.handleError(activity, error);
  }
};