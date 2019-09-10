const axios = require('axios');
const moviedb = require('../credentials/moviedb');


module.exports = {
     discoverApiCall(type, genreId, nationality) {  
            return axios.get(`https://api.themoviedb.org/3/discover/${type}`, {
                params: {
                  api_key: moviedb.MOVIEDB_TOKEN,
                  sort_by: 'popularity.desc',
                  include_adult: false,
                  with_genres: genreId,
                  with_original_language: nationality,
                  page: 1
                },
              }); 
    }

}