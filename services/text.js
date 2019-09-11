const algorithmia = require('algorithmia');
const algorithmiaApiKey = require('../credentials/algorithmia').API_KEY;
const config = require('../config/config');
const logger = require('../services/log').logger.getLogger('error');

const watsonCredentials = require('../credentials/watson-nlu');
const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1.js');
const nlu = new NaturalLanguageUnderstandingV1({
  iam_apikey: watsonCredentials.API_KEY,
  version: '2018-04-05',
  url: watsonCredentials.URL
});

const metadata = require('../services/metadata');

module.exports = {

    async robot() {
        console.log('> [movie-bot] Starting...');
        const media = metadata.load();
      
        await fetchContentFromWikipedia(media)
        sanitizeContent(media)
        await fetchKeywordsFromWatson(media)
      
        metadata.save(media);
      }
}


  async function fetchContentFromWikipedia(media) {
    console.log('> [movie-bot] Fetching data from Wikipedia');
    const wikipediaSearchTerm = {
        "articleName": media.title + ' ' + media.release_date.slice(0, 4),
        "lang": config.APP_LANGUAGE
    }
    const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey);
    const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2');
    const wikipediaResponse = await wikipediaAlgorithm.pipe(wikipediaSearchTerm);
    const wikipediaContent = wikipediaResponse.get();

    media.links = wikipediaContent.references;
    media.summary = wikipediaContent.summary;
    console.log('> [movie-bot] Data correctly stored');
  }

  function sanitizeContent(media) {
    const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(media.summary);
    const withoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkdown);

    media.cleanSummary = withoutDatesInParentheses;

    function removeBlankLinesAndMarkdown(text) {
      const allLines = text.split('\n')

      const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
        if (line.trim().length === 0 || line.trim().startsWith('=')) {
          return false
        }

        return true
      })

      return withoutBlankLinesAndMarkdown.join(' ')
    }
  }

  function removeDatesInParentheses(text) {
    return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
  }

  async function fetchKeywordsFromWatson(media) {
    console.log('> [movie-bot] Starting to fetch keywords from Watson');
    try {
      media.keywords = await fetchWatsonAndReturnKeywords(media.cleanSummary);
      console.log(`> [movie-bot] Keywords: [${media.keywords.join(', ')}]`);
    } catch (error) {
      logger.error(`> [movie-bot] Could not get keywords from Watson`, error);
    }  
  }

  async function fetchWatsonAndReturnKeywords(text) {
    return new Promise((resolve, reject) => {
      nlu.analyze({
        text: text,
        features: {
          keywords: {}
        }
      }, (error, response) => {
        if (error) {
          reject(error)
          return
        }

        const keywords = response.keywords.map((keyword) => {
          return keyword.text
        })

        resolve(keywords)
      })
    })
  }

