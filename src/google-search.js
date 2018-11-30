const request = require('request-promise-native');
const util = require('util');
const querystring = require('querystring');
const cheerio = require('cheerio');
const debug = require('debug')('google-search');

const config = require('./config');

async function getAnalysis(apiUrl) {
  const url = `${apiUrl}analysis?query={analysis(state:"without-google-search",limit:10){_id,wordsFrequency{word,frequency},newsId,sentiment}}`;
  const { data: { analysis = [] } = {} } = await request(url, {
    json: true,
  });

  return analysis;
}

function getResults(body) {
  const itemSel = '#search div.g';
  const linkSel = 'h3.r a';
  const descSel = 'div.s span.st';

  const $ = cheerio.load(body);
  const items = [];

  $(itemSel).each((index, element) => {
    const linkElement = $(element).find(linkSel);
    const descElement = $(element).find(descSel);
    const qsObj = querystring.parse($(linkElement).attr('href'));

    if ($(descElement).text()) {
      items.push({
        title: $(linkElement).text(),
        description: $(descElement).text(),
        link: qsObj['/url?q'],
      });
    }
  });

  return items;
}

function getQuery(analysis = []) {
  return analysis.slice(0, 3).map(({ word }) => word).join(' ');
}

let FLAG = false;
async function doGoogleSearch(query) {
  if (FLAG) {
    return null;
  }
  FLAG = true;
  if (!query) {
    debug('skiping google search');
    return null;
  }
  debug(`google search: ${query}`);
  const URL = '%s://www.google.%s/search?hl=%s&q=%s&start=%s&sa=N&num=%s&ie=UTF-8&oe=UTF-8&gws_rd=ssl';
  const source = {
    protocol: 'https',
    tld: 'com',
    lang: 'en',
    resultsPerPage: '10',
  };
  const start = null;
  const newUrl = util.format(URL,
    source.protocol,
    source.tld,
    source.lang,
    querystring.escape(query),
    start,
    source.resultsPerPage);

  const options = {
    url: newUrl,
    method: 'GET',
  };

  const body = await request(options);
  const results = getResults(body);
  return results;
}

async function saveResults(apiURL, analysisId, data = []) {
  if (!apiURL || !data || !data.length) {
    debug(`omiting saving results for analysis ${analysisId}`);
    return null;
  }

  debug(`saving ${data.length} results for analysis ${analysisId}`);
  const options = {
    method: 'POST',
    uri: `${apiURL}google-results`,
    body: {
      analysisId,
      data,
    },
    json: true,
  };

  return request(options);
}

async function runGoogleQueries(apiURL, analysisList = [], timeout = 1000) {
  const analysis = analysisList[0];

  if (!analysis) {
    debug(`finish ${new Date()}`);
    return null;
  }

  const query = getQuery(analysis.wordsFrequency);
  const results = await doGoogleSearch(query);

  await saveResults(apiURL, analysis._id, results); //eslint-disable-line

  setTimeout(() => {
    runGoogleQueries(apiURL, analysisList.slice(1));
  }, timeout);

  return null;
}

async function runGoogleSearch() {
  const apiURL = config.get('api.url');
  const analysis = await getAnalysis(apiURL);
  debug(`staring ${new Date()}`);
  debug(`${analysis.length} queries to run`);
  runGoogleQueries(apiURL, analysis);
}

module.exports = runGoogleSearch;
