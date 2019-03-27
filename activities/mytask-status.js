'use strict';
const api = require('./common/api');

module.exports = async (activity) => {
  try {
    const response = await api.getTodaysTasks();

    if (Activity.isErrorResponse(response)) return;

    let tasks = [];
    if (response.body.items != null) {
      tasks = response.body.items;
    }

    let taskStatus = {
      title: T('Active Tasks'),
      link: 'https://mail.google.com/tasks/canvas',
      linkLabel: T('All Tasks')
    };

    let taskCount = tasks.length;

    if (taskCount != 0) {
      taskStatus = {
        ...taskStatus,
        description: taskCount > 1 ? T("You have {0} tasks.", taskCount) : T("You have 1 task."),
        color: 'blue',
        value: taskCount,
        actionable: true
      };
    } else {
      taskStatus = {
        ...taskStatus,
        description: T(`You have no tasks.`),
        actionable: false
      };
    }

    activity.Response.Data = taskStatus;
  } catch (error) {
    Activity.handleError(error);
  }
};