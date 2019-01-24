const cheerio = require('cheerio');
const debug = require('debug')('scrape:eluniversal');

const ScrapperUtil = require('../utils/scrapperUtil');
const { cleanString } = require('../utils/stringHelper');
const constants = require('../constants');
const config = require('../config');

function extractNewsUrls(htmlString) {
  if (!htmlString) {
    return false;
  }

  const jQuery = cheerio.load(htmlString);
  const { url: sourceUrl } = constants.source.eluniversal;

  const urls = jQuery('div.view-home div.views-row h1 a, div.view-home div.views-row h3 a')
    .toArray()
    .map(element => `${sourceUrl}${jQuery(element).attr('href')}`);

  return urls;
}

async function getNewsUrls() {
  const { url } = constants.source.eluniversal;
  const response = await ScrapperUtil.getSource(url);

  const urls = extractNewsUrls(response);

  return urls;
}

function extractNewsData(htmlString) {
  if (!htmlString) {
    return false;
  }
  const jQuery = cheerio.load(htmlString);

  const url = jQuery('meta[property="og:url"]').attr('content');

  const title = cleanString(jQuery('.panel-pane.pane-node-title h1').text());

  const description = jQuery('div#apertura div.pane-content p')
    .toArray()
    .reduce((accumulator, element) => {
      const text = cleanString(jQuery(element).text());
      if (text) {
        accumulator.push(text);
      }
      return accumulator;
    }, []);

  let image = jQuery('.pane-entity-field .field-type-image img').attr('src');
  if (!image) {
    image = jQuery('.view-mode-video_en_nota img').attr('src');
  }

  const { source } = constants.source.eluniversal;

  return {
    url,
    title,
    description,
    image,
    source,
  };
}

async function getNews(urls) {
  if (!urls || !urls.length) {
    return false;
  }

  const promises = urls.map(ScrapperUtil.getSource);

  const responses = await Promise.all(promises);

  if (!responses || !responses.length) {
    return false;
  }

  const articles = responses.map(extractNewsData);

  return articles;
}

function saveNews(news) {
  if (!news || !news.length) {
    return 'no news to save';
  }
  const apiUrl = `${config.get('api.url')}news`;
  return ScrapperUtil.postNews(apiUrl, news);
}

function scraper() {
  return new Promise(async (resolve) => {
    debug('extracting news');

    const newsUrls = await getNewsUrls();

    const news = await getNews(newsUrls);

    const response = await saveNews(news);

    debug(response);
    resolve();
  });
}

module.exports = scraper;
