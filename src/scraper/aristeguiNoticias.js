const cheerio = require('cheerio');
const debug = require('debug')('scrape:aristeguiNoticias');

const ScrapperUtil = require('../utils/scrapperUtil');
const constants = require('../constants');
const config = require('../config');

function extractNewsUrls(htmlString) {
  if (!htmlString) {
    return false;
  }

  const jQuery = cheerio.load(htmlString);

  const urls = jQuery('.img_principal .imgTML')
    .toArray()
    .map(element => jQuery(element).find('a').attr('href'));

  return urls;
}

async function getNewsUrls() {
  const { url } = constants.source.aristeguinoticias;
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

  let title = jQuery('.class_subtitular h1').text();
  if (!title) {
    title = jQuery('.top .title_time h1').text();
  }
  if (!title) {
    title = jQuery('.top .class_subtitular').text();
  }

  const description = [];
  jQuery('div.container_left div.class_text p').filter((index, element) => {
    if (jQuery(element).text()) {
      description.push(jQuery(element).text());
    }
  });
  if (!description.length) {
    jQuery('div.container_left div.class_text2').filter((index, element) => {
      description.push(jQuery(element).text());
    });
  }
  if (!description.length) {
    description.push(jQuery('div#video_center p.sub_content_videos').text());
  }

  const image = jQuery('.img_notaterminal img').attr('src');

  const { code } = constants.source.aristeguinoticias;

  return {
    url,
    title,
    description,
    image,
    source: code,
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

async function scraper() {
  debug('extracting news');

  const newsUrls = await getNewsUrls();
  const news = await getNews(newsUrls);
  const response = await saveNews(news);

  debug(response);
}

module.exports = scraper;
