const axios = require('axios');
const moviedb = require('../credentials/moviedb');
const countryCodes = require('../config/country-codes.json');


module.exports = {
  discoverMovies(type, genreId, nationality) {  
    const language = countryCodes.find(e => e.country_code == nationality).language;
      return axios.get(`https://api.themoviedb.org/3/discover/${type}`, {
        params: {
          api_key: moviedb.MOVIEDB_TOKEN,
          sort_by: 'popularity.desc',
          include_adult: false,
          with_genres: genreId,
          with_original_language: language,
          page: 1
        },
      }); 
    },


    getImages(mediaId, mediaType) {
      return axios.get(`https://api.themoviedb.org/3/${mediaType}/${mediaId}/images`, {
        params: {
          api_key: moviedb.MOVIEDB_TOKEN
        }
      });
    },

}