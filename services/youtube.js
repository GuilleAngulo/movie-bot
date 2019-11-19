'use strict';

const axios = require('axios');
const metadata = require('../services/metadata');
const youtube_API_KEY = require('../credentials/youtube-search').API_KEY;


module.exports = {
    async robot() {
        const media = metadata.load();
        await youtubeSearch(media);
    }
}

async function youtubeSearch(media) {
    const query = `${media.original_title} ${media.release_date.slice(0, 4)} trailer`;

    await axios.get('https://www.googleapis.com/youtube/v3/search?', {
        params: {
            part: 'snippet',
            type: 'video',
            maxResults: 1,
            q: query,
            key: youtube_API_KEY,
        }
    }).then(response => {
        let link = `https://www.youtube.com/watch?v=${response.data.items[0].id.videoId}`
        media.youtube = link;
        console.log(`> [movie-bot] Youtube trailer link for "${media.original_title}" stored`);
        metadata.save(media);
        return;
    }).catch(error => console.log(error));

}
