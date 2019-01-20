const cheerio = require('cheerio');
const debug = require('debug')('scrape:eleconomista');

const ScrapperUtil = require('../utils/scrapperUtil');
const constants = require('../constants');
const config = require('../config');

const invalidText = [
  'Archivado en:',
  '[email protected]',
];

function extractNewsUrls(htmlString) {
  if (!htmlString) {
    return false;
  }

  const jQuery = cheerio.load(htmlString);
  const { url: sourceUrl } = constants.source.eleconomista;

  const urls = jQuery('div.pb article[itemtype="http://schema.org/Article"].entry-box')
    .toArray()
    .map(element => jQuery(element).find('a.cover-link').attr('href'));

  return urls.map(url => `${sourceUrl}${url}`);
}

async function getNewsUrls() {
  const { url } = constants.source.eleconomista;
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

  const title = jQuery('.entry-top .title h1').text();

  const description = [];
  jQuery('.entry-body p').each((index, element) => {
    const text = jQuery(element).text().replace(/[\t\n]+/g, '').trim();
    if (text && text.length && !invalidText.includes(text)) {
      description.push(text);
    }
  }, []);
  if (!description.length) {
    jQuery('.entry-top p').each((index, element) => {
      description.push(jQuery(element).text());
    });
  }

  const image = jQuery('figure.img-top img').attr('src');

  const { source, url: sourceUrl } = constants.source.eleconomista;

  return {
    url,
    title,
    description,
    image: `${sourceUrl}${image}`,
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
