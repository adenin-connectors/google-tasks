'use strict';
const api = require('./common/api');

module.exports = async function (activity) {
  try {
    api.initialize(activity);

    var dateRange = $.dateRange(activity);
    let timeMin = api.ISODateString(new Date(dateRange.startDate));
    let timeMax = api.ISODateString(new Date(dateRange.endDate));

    let allTasks = [];
    let url = `/tasks/v1/lists/@default/tasks?showCompleted=true&maxResults=100&dueMin=${timeMin}&dueMax=${timeMax}`;
    let response = await api(url);
    $.isErrorResponse(activity, response);

    if (response.body.items) {
      allTasks.push(...response.body.items);
    }

    let etag = response.body.etag;
    let nextPageToken = null;
    if (response.body.nextPageToken) nextPageToken = response.body.nextPageToken;
    while (nextPageToken) {
      let nextPageUrl = url + `&pageToken=${nextPageToken}`;
      response = await api(nextPageUrl);
      $.isErrorResponse(activity, response);
      allTasks.push(...response.body.items);
      if (etag != response.body.etag || response.body.nextPageToken != nextPageToken) {
        nextPageToken = response.body.nextPageToken;
      } else {
        nextPageToken = null;
      }
      etag = response.body.etag;
    }

    const value = allTasks.length;
    const pagination = $.pagination(activity);
    const pagiantedItems = api.paginateItems(allTasks, pagination);
    activity.Response.Data.items = api.convertTasks(pagiantedItems);
    if (parseInt(pagination.page) == 1) {
      activity.Response.Data.title = T(activity, 'All Tasks');
      activity.Response.Data.link = 'https://mail.google.com/tasks/canvas';
      activity.Response.Data.linkLabel = T(activity, 'All Tasks');
      activity.Response.Data.actionable = value > 0;

      if (value > 0) {
        activity.Response.Data.value = value;
        // items are alrady sorted by date descending (higest value first) in api request
        // request wasn't changed it's just tested to see how it is sorted
        // sortby and sorttype can't be added request
        activity.Response.Data.date = new Date(allTasks[0].updated).toISOString();
        activity.Response.Data.color = 'blue';
        activity.Response.Data.description = value > 1 ? T(activity, "You have {0} tasks.", value)
          : T(activity, "You have 1 task.");
      } else {
        activity.Response.Data.description = T(activity, `You have no tasks.`);
      }
    }
  } catch (error) {
    $.handleError(activity, error);
  }
};