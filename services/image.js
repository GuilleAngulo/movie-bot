'use strict';

const imageDownloader = require('image-downloader');
const path = require('path');

const google = require('googleapis').google;
const customSearch = google.customsearch('v1');

const metadata = require('../services/metadata');
const logger = require('../services/log').logger.getLogger('error');
const config = require('../config/config');

const moviedbAPI = require('../services/moviedb-api');
const googleSearchCredentials = require('../credentials/google-search');


module.exports = {
    async init() {
        const media = metadata.load();
        await downloadPoster(media);
        await donwnloadAlternativePoster(media);
        await downloadImages(media);
        await downloadImagesFromGoogle(media);
        metadata.save(media);
    }
}

async function downloadPoster(media) {
    try {
        const posterURL = getImageLink('w600_and_h900_bestv2', media.poster_path);
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
        dest: path.resolve(__dirname, '..', 'content', 'current', `${fileName}`)
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
    return response.data.items[1].link;
}

async function donwnloadAlternativePoster(media) {
    let query;

    if (media.type == 'movie')
        query = media.original_title + ' ' + media.type + ' poster ' + media.release_date.slice(0, 4);
    if (media.type == 'tv')
        query = media.original_name + ' ' + media.type + 'series poster ' + media.first_air_date.slice(0, 4);

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
    console.log(`> [movie-bot] Downloading images from theMovieDB`);
    try {
        const response =  await moviedbAPI.getImages(media.id, media.type);
        for (let i = 0; i < config.NUMBER_IMAGES; i++) {
            const imageLink = getImageLink('w500', response.data.backdrops[i].file_path);
            await downloadAndSave(imageLink, `${i + 1}.jpg`);
            console.log(`> [movie-bot] Image ${i + 1} downloaded.`);
        }
    } catch (error) {
        logger.error(error);
    } finally {
        return;
    }
}

function getImageLink(size, file_path) {
    return `${config.MOVIEDB_IMAGE_BASE_URL}/${size}${file_path}`;
}

/** Not Used */
async function downloadImagesFromGoogle(media) {
    console.log(`> [movie-bot] Downloading images from Google`);
    for (let i = 0; i < config.NUMBER_IMAGES; i++) {
        let query;
        if (media.type == 'movie')
            query = `${media.original_title} ${media.release_date.slice(0, 4)} Film ${media.keywords[i]}`;
        if (media.type == 'tv')
            query = `${media.original_name} ${media.first_air_date.slice(0, 4)} TV series ${media.keywords[i]}`;
        
        try{
            const imageLink = await googleCustomSearchImageLink(query);
            console.log(`> [movie-bot] Image ${i + 1} - (query: ${query}) `);
            await downloadAndSave(imageLink, `${media.title}-${i + 1}.jpg`);
        } catch (err) {
            logger.error(`Failed to download an image `, err);
        }
    }
    console.log(`> [movie-bot] Images correctly downloaded`);
}