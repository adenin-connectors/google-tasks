'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);
    const response = await api.getTodaysTasks();

    if ($.isErrorResponse(activity, response)) return;

    let tasks = [];
    if (response.body.items != null) tasks = response.body.items;

    let taskStatus = {
      title: T(activity, 'Active Tasks'),
      link: 'https://mail.google.com/tasks/canvas',
      linkLabel: T(activity, 'All Tasks')
    };

    let taskCount = tasks.length;

    if (taskCount != 0) {
      taskStatus = {
        ...taskStatus,
        description: taskCount > 1 ? T(activity, "You have {0} tasks.", taskCount) : T(activity, "You have 1 task."),
        color: 'blue',
        value: taskCount,
        actionable: true
      };
    } else {
      taskStatus = {
        ...taskStatus,
        description: T(activity, `You have no tasks.`),
        actionable: false
      };
    }

    activity.Response.Data = taskStatus;
  } catch (error) {
    $.handleError(activity, error);
  }
};