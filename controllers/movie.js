'use strict';

const moviedbAPI = require('../services/moviedb-api');
const config = require('../config/config');
const metadata = require('../services/metadata');
const image = require('../services/image');
const text = require('../services/text');
const log = require('../services/log');
const logger = log.logger.getLogger('error');
const fs = require('fs');
const path = require('path');

module.exports = {
    async robot(req, res) {
        console.log('> [movie-bot] Request submitted - Starting bot ...');
        //await cleanPreviousContent();
        //await log.setUpLogDirectory();
        //await discoverMovie(req, res);
        await text.robot();
        await image.robot();
    }    
}



async function discoverMovie(req, res) {

    const type = req.body.conversation.memory['recording'].type;
    const genreId = req.body.conversation.memory['genre'].id;
    const nationality = req.body.conversation.memory['nationality'];

    const genre = (config.MOVIE_GENRE.find(e => e.id == genreId)).name;
    console.log(`> [movie-bot] Searching - ${genre} ${type} (${nationality.long})`);

    try{
        const response =  await moviedbAPI.discoverApiCall(type, genreId, nationality.short.toLowerCase());
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

        metadata.save(mediaSelected);  
        
        if (type == "movie") 
            console.log(`> [movie-bot] Chosen movie: ${mediaSelected.title} (${mediaSelected.release_date.slice(0, 4)})`);
        else if (type == "tv")
            console.log(`> [movie-bot] Chosen TV serie: ${mediaSelected.original_name} (${mediaSelected.first_air_date.slice(0, 4)})`);
        
        return;

    } catch (error) {
            logger.error(error);
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

async function cleanPreviousContent() {

    const previousContentPath = config.CURRENT_CONTENT_PATH;

    fs.readdir(previousContentPath, (err, files) => {
        if (err) logger.error(err);
        for (let file of files) {
            fs.unlink(path.join(previousContentPath, file), (err) => {
                if(err) logger.error(err);
            });
        }
    });

    console.log('> [movie-bot] Previous content removed');
}


