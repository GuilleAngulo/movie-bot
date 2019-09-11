'use strict';

const imageDownloader = require('image-downloader');
const google = require('googleapis').google;
const customSearch = google.customsearch('v1');
const metadata = require('./metadata');
const logger = require('../services/log').logger.getLogger('error');
const config = require('../config/config');

const googleSearchCredentials = require('../credentials/google-search');


module.exports = {
    async robot() {
        const media = metadata.load();
        await downloadPoster(media);
        await donwnloadAlternativePoster(media);
        await downloadImages(media);
        metadata.save(media);
    }
}


async function downloadPoster(media) {
    try {
        const posterURL = `https://image.tmdb.org/t/p/w600_and_h900_bestv2${media.poster_path}`;
        await downloadAndSave(posterURL, 'poster.jpg');
        const title = media.title || media.name;
        console.log(`> [movie-bot] Poster of "${title}" downloaded`);
    } catch (error) {
        logger.error(error);
    }
}

async function  downloadAndSave(url, fileName) {
    return imageDownloader.image({
        url,
        dest: `./content/current/${fileName}`
    });
}

async function googleCustomSearchImageLink(query) {
    const response = await customSearch.cse.list({
        auth: googleSearchCredentials.API_KEY,
        cx: googleSearchCredentials.SEARCH_ENGINE_ID,
        q: query,
        searchType: 'image',
        imgSize: 'huge',
        num: 2
    });

    return response.data.items[0].link;
}

async function donwnloadAlternativePoster(media) {

    const query = media.original_title + ' poster ' + media.release_date.slice(0, 4);

    try {
        const alternativePosterURL = await googleCustomSearchImageLink(query);
        media.alternative_poster_URL = alternativePosterURL;
        await downloadAndSave(alternativePosterURL, 'alternative-poster.jpg');
        console.log(`> [movie-bot] Alternative poster downloaded`);
    } catch (error) {
        logger.error(`Failed to download an alternative poster `, error);
    }
}

async function downloadImages(media) {
    console.log(`> [movie-bot] Downloading images from Google`);
    for (let i = 0; i < config.NUMBER_IMAGES; i++) {
        const query = media.title + ' ' + media.release_date.slice(0, 4) + ' ' + media.keywords[i];
        
        try{
            const imageLink = await googleCustomSearchImageLink(query);
            console.log(`> [movie-bot] Image ${i} - (query: ${query}) `);
            await downloadAndSave(imageLink, `${media.title}-${i + 1}.jpg`);
        } catch (err) {
            logger.error(`Failed to download an image `, error);
        }
    }
    console.log(`> [movie-bot] Images correctly downloaded`);
}
