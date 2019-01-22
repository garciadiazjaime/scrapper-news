const cheerio = require('cheerio');
const debug = require('debug')('scrape:eleconomista');

const ScrapperUtil = require('../utils/scrapperUtil');
const constants = require('../constants');
const config = require('../config');
const { cleanString } = require('../utils/stringHelper');

function extractNewsUrls(htmlString) {
  if (!htmlString) {
    return false;
  }

  const jQuery = cheerio.load(htmlString);

  const urls = jQuery('.main-featured ul.slides li')
    .toArray()
    .map(element => jQuery(element).find('.caption a').attr('href'));

  return urls;
}

async function getNewsUrls() {
  const { url } = constants.source.proceso;
  const response = await ScrapperUtil.getSource(url);

  const urls = extractNewsUrls(response);

  return urls;
}

function extractNewsData(htmlString) {
  if (!htmlString) {
    return false;
  }
  const jQuery = cheerio.load(htmlString);

  const url = jQuery('link[rel=canonical]').attr('href');

  const title = cleanString(jQuery('article h1.post-title').text());

  const description = jQuery('.post-content.description p')
    .toArray()
    .reduce((accumulator, element) => {
      const text = cleanString(jQuery(element).text());
      if (text) {
        accumulator.push(text);
      }
      return accumulator;
    }, []);


  const image = jQuery('article .featured img').attr('data-src');

  const { source } = constants.source.proceso;

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
