'use strict';
const api = require('./common/api');

module.exports = async function (activity) {
  try {
    let pagination = $.pagination(activity);
    api.initialize(activity);
    const response = await api.getTodaysTasks(pagination);

    if ($.isErrorResponse(activity, response)) return;

    activity.Response.Data = api.convertTasks(response);
    if (response.body.nextPageToken) activity.Response.Data._nextpage = response.body.nextPageToken;
  } catch (error) {
    $.handleError(activity, error);
  }
};