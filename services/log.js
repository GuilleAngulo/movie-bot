'use strict'

const log4js = require('log4js');
const fs = require('fs');
const config = require('../config/config');
const logConfiguration = require('../config/log4js.json');
const logger = log4js.configure(logConfiguration);

async function setUpLogDirectory() {
    try {
        fs.mkdirSync(config.LOG_PATH);
    } catch (error) {
        if (error.code != 'EEXIST') {
          console.error("Error setting up the log directory:: ", error);
          process.exit(1);
        }
    }
}


module.exports = {
    setUpLogDirectory,
    logger
}