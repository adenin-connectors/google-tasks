'use strict';

const logger = require('@adenin/cf-logger');
const utils = require('./common/utils');

module.exports = async (activity) => {
  try {
    const message = 'This is an empty activity';

    logger.info(message);

    activity.Response.Data = {
      message: message
    };
  } catch (error) {
    utils.handleError(error, activity);
  }
};
