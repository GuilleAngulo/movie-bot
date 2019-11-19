'use strict';

const axios = require('axios');
const metadata = require('../services/metadata');
const youtube_API_KEY = require('../credentials/youtube-search').API_KEY;


module.exports = {
    async init() {
        const media = metadata.load();
        await youtubeSearch(media);
    }
}

async function youtubeSearch(media) {
    let query;

    if (media.type == 'movie')
        query = `${media.original_title} ${media.release_date.slice(0, 4)} trailer`;
    if (media.type == 'tv')
        query = `${media.original_name} ${media.first_air_date.slice(0, 4)} trailer`;

    await axios.get('https://www.googleapis.com/youtube/v3/search?', {
        params: {
            part: 'snippet',
            type: 'video',
            maxResults: 1,
            q: query,
            key: youtube_API_KEY,
        }
    })
        .then(response => {
            let link = `https://www.youtube.com/watch?v=${response.data.items[0].id.videoId}`
            media.youtube = link;
            if (media.type == 'movie')
                console.log(`> [movie-bot] Youtube trailer link for "${media.original_title}" stored`);
            if (media.type == 'tv')
                console.log(`> [movie-bot] Youtube trailer link for "${media.original_name}" stored`);
            metadata.save(media);
            return;
    })
        .catch(error => console.log(error));
}
