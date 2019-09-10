'use strict';

const imageDownloader = require('image-downloader');
const google = require('googleapis').google;
const customSearch = google.customsearch('v1');
const metadata = require('./metadata');
const logger = require('../services/log').logger.getLogger('error');

const googleSearchCredentials = require('../credentials/google-search');


module.exports = {
    async robot() {
        const media = metadata.load();
        await downloadPoster(media);
        await donwnloadAlternativePoster(media);
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

async function donwnloadAlternativePoster(media) {

    const query = media.original_title + ' poster ' + media.release_date.slice(0, 4);

    const response = await customSearch.cse.list({
        auth: googleSearchCredentials.API_KEY,
        cx: googleSearchCredentials.SEARCH_ENGINE_ID,
        q: query,
        searchType: 'image',
        imgSize: 'huge',
        num: 2
    });

    for (let attempts = 0; attempts < 5; attempts++) {
        try {
            const alternativePosterURL = response.data.items[0].link;
            media.alternative_poster_URL = alternativePosterURL;
            await downloadAndSave(alternativePosterURL, 'alternative-poster.jpg');
            console.log(`> [movie-bot] Alternative poster downloaded`);
            break;

        } catch (error) {
            logger.error(`Error in ${attempts} attempt to download an alternative poster `, error);
        }
    }



}
