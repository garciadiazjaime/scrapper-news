const cheerio = require('cheerio');
const debug = require('debug')('scrape:aristeguiNoticias');

const ScrapperUtil = require('../utils/scrapperUtil');
const { cleanString } = require('../utils/stringHelper');
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

  let title = cleanString(jQuery('.class_subtitular h1').text());
  if (!title) {
    title = cleanString(jQuery('.top .title_time h1').text());
  }
  if (!title) {
    title = cleanString(jQuery('.titular .class_subtitular').text());
  }

  const description = jQuery('div.container_left div.class_text p')
    .toArray()
    .reduce((accumulator, element) => {
      const text = cleanString(jQuery(element).text());
      if (text) {
        accumulator.push(text);
      }
      return accumulator;
    }, []);
  if (!description.length) {
    jQuery('div.container_left div.class_text2').each((element) => {
      const text = cleanString(jQuery(element).text());
      if (text) {
        description.push(text);
      }
    });
  }
  if (!description.length) {
    const text = cleanString(jQuery('div#video_center p.sub_content_videos').text());
    if (text) {
      description.push(text);
    }
  }

  let image = jQuery('.img_notaterminal img').attr('src');
  if (!image) {
    image = jQuery('#video_center meta').attr('content');
  }

  const { source } = constants.source.aristeguinoticias;

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
