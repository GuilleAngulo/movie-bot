const fs = require('fs')
const config = require('../config/config');
const logger = require('../services/log').logger.getLogger('error');

module.exports = {

    save(content) {
        try {
            const contentString = JSON.stringify(content);
            return fs.writeFileSync(config.CURRENT_CONTENT_PATH + 'content.json', contentString);
        } catch (error) {
            logger.error(error);
        }
    
        
    },
      
    load() {
        try {
            const fileBuffer = fs.readFileSync(config.CURRENT_CONTENT_PATH + 'content.json', 'utf-8');
            return contentJson = JSON.parse(fileBuffer);
        } catch (error) {
            logger.error(error);
        }
    }
}

  