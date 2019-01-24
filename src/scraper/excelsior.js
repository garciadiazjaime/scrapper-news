const cheerio = require('cheerio');
const debug = require('debug')('scrape:excelsior');

const ScrapperUtil = require('../utils/scrapperUtil');
const { cleanString } = require('../utils/stringHelper');
const constants = require('../constants');
const config = require('../config');

function extractNewsUrls(htmlString) {
  if (!htmlString) {
    return false;
  }

  const jQuery = cheerio.load(htmlString);

  const urls = jQuery('#noticias-principales a, #notas-destacadas-flujo a')
    .toArray()
    .reduce((accumulator, element) => {
      const url = `https:${jQuery(element).attr('href')}`;
      if (url.search(/[\d]+/) !== -1) {
        accumulator.push(url);
      }
      return accumulator;
    }, []);

  return urls;
}

async function getNewsUrls() {
  const { url } = constants.source.excelsior;
  const response = await ScrapperUtil.getSource(url);

  const urls = extractNewsUrls(response);

  return urls;
}

function extractNewsData(htmlString) {
  if (!htmlString) {
    return false;
  }
  const jQuery = cheerio.load(htmlString);

  const url = `https:${jQuery('link[rel=canonical]').attr('href')}`;

  let title = cleanString(jQuery('#main header h1').text());
  if (!title) {
    title = jQuery('#content-main article h1').text();
  }

  const description = jQuery('#node-article-body p')
    .toArray()
    .reduce((accumulator, element) => {
      const text = cleanString(jQuery(element).text());
      if (text) {
        accumulator.push(text);
      }
      return accumulator;
    }, []);

  let image;
  if (jQuery('#wrapper-image img').length) {
    image = `https:${jQuery('#wrapper-image img').attr('src')}`;
  }
  if (!image && jQuery('.wrapper-images .node-image img').length) {
    image = `https:${jQuery('.wrapper-images .node-image img').attr('src')}`;
  }

  const { source } = constants.source.excelsior;

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
