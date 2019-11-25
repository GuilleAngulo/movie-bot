'use strict';

const moviedbAPI = require('../services/moviedb-api');
const config = require('../config/config');
const metadata = require('../services/metadata');
const image = require('../services/image');
const youtube = require('../services/youtube');
const text = require('../services/text');
const log = require('../services/log');
const cache = require('../services/cache');
const logger = log.logger.getLogger('error');

let terminate = false;

module.exports = {
    async init(req, res) {
        console.log('> --------------------');
        console.log('> [movie-bot] Request submitted.');
        await cache.cleanPreviousContent();
        await log.setUpLogDirectory();
        await discoverMovie(req, res);
        if (terminate) {
            console.log('> [movie-bot] Stopped. Try again with different media criteria.');
            return;
        } 
        if (await cache.isContentStored()) {
            await cache.decompressContent();
        } else {
            await text.init();
            await image.init();
            await youtube.init();
            await cache.compressContent();
        }
    }    
}

async function discoverMovie(req, res) {
    const type = req.body.conversation.memory['recording'].type;
    const genreId = req.body.conversation.memory['genre'].id;
    const nationality = req.body.conversation.memory['nationality'];
    const genre = (config.MOVIE_GENRE.find(e => e.id == genreId)).name;

    console.log(`> [movie-bot] Searching for - ${genre} ${type} (${nationality.long})`);

    try {
        const response =  await moviedbAPI.discoverMovies(type, genreId, nationality.short);
        const result = response.data.results;

        if (result.length === 0) {
            console.log('> [movie-bot] Could not find any results...');
            terminate = true;
            return res.status(204).send({ error: 'Not content found' });
        }

        let resultLength;
        (result.length < config.NUMBER_RESULTS) ?  
            resultLength = result.length 
            : 
            resultLength = config.NUMBER_RESULTS;
        
        console.log('> List of suggestions:');
        console.log('> --------------------');
        result.slice(0, resultLength).map((content, index) => {
            if (type == "movie") 
                console.log(`> ${index + 1}) ${content.title} (${content.release_date.slice(0, 4)})`)
            else
                console.log(`> ${index + 1}) ${content.original_name} (${content.first_air_date.slice(0, 4)})`)
        });
        console.log('> --------------------');
        
        const titleSelected = result.slice(0, resultLength)[getRandomInt(0, resultLength)];
        titleSelected.type = type;
       
        if (type == "movie") 
            console.log(`> [movie-bot] Chosen movie: ${titleSelected.title} (${titleSelected.release_date.slice(0, 4)})`); 
        else if (type == "tv") 
            console.log(`> [movie-bot] Chosen TV serie: ${titleSelected.original_name} (${titleSelected.first_air_date.slice(0, 4)})`);
        
        metadata.save(titleSelected);
        return;

    } catch (error) {
        logger.error(error);
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}



