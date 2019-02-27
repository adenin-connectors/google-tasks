'use strict';

const cfActivity = require('@adenin/cf-activity');
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);

    const response = await api.getTodaysTasks();

    if (!cfActivity.isResponseOk(activity, response)) {
      return;
    }

    let tasks = response.body.items;

    let taskStatus = {
      title: 'Active Tasks',
      url: 'https://mail.google.com/tasks/canvas',
      urlLabel: 'All tasks',
    };

    let taskCount = tasks.length;

    if (taskCount != 0) {
      taskStatus = {
        ...taskStatus,
        description: `You have ${taskCount > 1 ? taskCount + " tasks" : taskCount + " task"} today.`,
        color: 'blue',
        value: taskCount,
        actionable: true
      };
    } else {
      taskStatus = {
        ...taskStatus,
        description: `You have no tasks today.`,
        actionable: false
      };
    }

    activity.Response.Data = taskStatus;

  } catch (error) {

    cfActivity.handleError(error, activity);
  }
};