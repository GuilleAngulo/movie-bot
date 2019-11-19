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


module.exports = {
    async robot(req, res) {
        console.log('> --------------------');
        console.log('> [movie-bot] Request submitted.');
        await cache.cleanPreviousContent();
        await log.setUpLogDirectory();
        await discoverMovie(req, res);
        if (await cache.isContentStored()) {
            await cache.decompressContent();
        } else {
            await text.robot();
            await image.robot();
            await youtube.robot();
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

    try{
        const response =  await moviedbAPI.discoverMovies(type, genreId, nationality.short);
        const result = response.data.results;

        if (result.length === 0) {
            console.log('> [movie-bot] Could not find any results...');
            return res.status(204).send({ error: 'Not content found' });
        }

        let mediaSelected; 

        //If the number of results is lower than CONFIGURED NUMBER RESULTS
        if (result.length < config.NUMBER_RESULTS) {
            const randomNumber = getRandomInt(0, result.length);
            //Select a random number from the list of results
            mediaSelected = result.slice(0, result.length)[randomNumber];

            console.log('> List of suggestions:');
            console.log('> --------------------');
            result.map((content, index) => {
                console.log(`> ${index + 1}) ${content.title} (${content.release_date.slice(0, 4) || content.first_air_date.slice(0, 4)})`);
            });
            console.log('> --------------------');

        //Else if the number of results is higher than CONFIGURED NUMBER RESULTS
        } else {
            const randomNumber = getRandomInt(0, config.NUMBER_RESULTS);
            //Select a random number (using CONFIGURED NUMBER RESULTS) from the list of results
            mediaSelected = result.slice(0, config.NUMBER_RESULTS)[randomNumber];

            console.log('> List of suggestions:');
            console.log('> --------------------');
            result.slice(0, config.NUMBER_RESULTS).map((content, index) => {
                console.log(`> ${index + 1}) ${content.title} (${content.release_date.slice(0, 4) || content.first_air_date.slice(0, 4)})`);
            });
            console.log('> --------------------');
        }
        mediaSelected.type = type;
       
        if (type == "movie") 
            console.log(`> [movie-bot] Chosen movie: ${mediaSelected.title} (${mediaSelected.release_date.slice(0, 4)})`); 
        else if (type == "tv") 
            console.log(`> [movie-bot] Chosen TV serie: ${mediaSelected.original_name} (${mediaSelected.first_air_date.slice(0, 4)})`);
        
        metadata.save(mediaSelected);
        //console.log("New metada saved with id: " + mediaSelected.id);
        return;

    } catch (error) {
            logger.error(error);
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}



