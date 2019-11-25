const fs = require('fs')
const path = require('path');
const logger = require('../services/log').logger.getLogger('error');

const contentPath = path.resolve(__dirname, '..', 'content', 'current', 'content.json');

module.exports = {

    save(content) {
        try {
            const contentString = JSON.stringify(content);
            return fs.writeFileSync(contentPath, contentString);
        } catch (error) {
            logger.error(error);
        }
    
        
    },
      
    load() {
        try {
            const fileBuffer = fs.readFileSync(contentPath, 'utf-8');
            return contentJson = JSON.parse(fileBuffer);
        } catch (error) {
            logger.error(error);
        }
    }
}

  