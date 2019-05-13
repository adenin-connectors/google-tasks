'use strict';
const api = require('./common/api');

module.exports = async function (activity) {
  try {
    api.initialize(activity);
    let allTasks = [];
    let url = `/tasks/v1/lists/@default/tasks?showCompleted=false&maxResults=100`;
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
    const pagiantedItems = paginateItems(allTasks, pagination);
    activity.Response.Data.items = convertTasks(pagiantedItems);
    activity.Response.Data.title = T(activity, 'Active Tasks');
    activity.Response.Data.link = 'https://mail.google.com/tasks/canvas';
    activity.Response.Data.linkLabel = T(activity, 'All Tasks');
    activity.Response.Data.actionable = value > 0;

    if (value > 0) {
      activity.Response.Data.value = value;
      activity.Response.Data.color = 'blue';
      activity.Response.Data.description = value > 1 ? T(activity, "You have {0} tasks.", value)
        : T(activity, "You have 1 task.");
    } else {
      activity.Response.Data.description = T(activity, `You have no tasks.`);
    }
  } catch (error) {
    $.handleError(activity, error);
  }
};
function paginateItems(items, pagination) {
  let pagiantedItems = [];
  const pageSize = parseInt(pagination.pageSize);
  const offset = (parseInt(pagination.page) - 1) * pageSize;

  if (offset > items.length) return pagiantedItems;

  for (let i = offset; i < offset + pageSize; i++) {
    if (i >= items.length) {
      break;
    }
    pagiantedItems.push(items[i]);
  }
  return pagiantedItems;
}
//**maps response data to items */
function convertTasks(tasks) {
  const items = [];

  for (let i = 0; i < tasks.length; i++) {
    const raw = tasks[i];
    const item = {
      id: raw.id,
      title: raw.title,
      description: raw.notes,
      link: raw.selfLink,
      raw: raw
    };

    items.push(item);
  }

  return { items };
};
/**formats string to match google api requirements*/
function ISODateString(d) {
  function pad(n) {
    return n < 10 ? '0' + n : n;
  }

  return d.getUTCFullYear() + '-' +
    pad(d.getUTCMonth() + 1) + '-' +
    pad(d.getUTCDate()) + 'T' +
    pad(d.getUTCHours()) + ':' +
    pad(d.getUTCMinutes()) + ':' +
    pad(d.getUTCSeconds()) + 'Z';
}