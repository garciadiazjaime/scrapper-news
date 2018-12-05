const cheerio = require('cheerio');

const constants = require('../../constants');

const invalidText = [
  'Archivado en:',
  '[email protected]'
]

// Utility to scrap specific source
class ElEconomista {

  // based on html passed (source code) news are extracted
  // @param {string} htmlString - html source page
  // @return {array} - array with news extracted
  static extractNews(htmlString) {
    const data = [];
    const jQuery = cheerio.load(htmlString);
    const { code, url: sourceUrl } = constants.source.eleconomista;

    const inspectors = [
      'div.pb article[itemtype="http://schema.org/Article"].entry-box',
    ];

    inspectors.forEach((inspector) => {
      jQuery(inspector).filter((index, element) => {
        const titleElement = jQuery(element).find('div.entry-data h2 a').length ?
          jQuery(element).find('div.entry-data h2 a') :
          jQuery(element).find('a.cover-link')
        const title = jQuery(titleElement).attr('title');
        const url = `${sourceUrl}${jQuery(titleElement).attr('href')}`;
        const item = {
          title,
          url,
          source: code,
        };
        data.push(item);
      });
    });

    return data;
  }

  static extractImage(htmlString) {
    let image = '';
    const description = [];
    const jQuery = cheerio.load(htmlString);
    const { url } = constants.source.eleconomista;

    jQuery('#front_central .foto img').filter((index, element) => {
      image = `${url}${jQuery(element).attr('src')}`;
    });

    jQuery('#no #nt p').filter((index, element) => {
      description.push(jQuery(element).text());
    });

    return {
      image,
      description,
    };
  }

  static processImages(news, results) {
    const data = results.map(this.extractImage);
    news.forEach((item, index) => {
      item.image = data[index].image;
      item.description = data[index].description;
    });
    return news;
  }

  static extractArticle(htmlString) {
    const description = [];
    const jQuery = cheerio.load(htmlString);

    jQuery('section.main-content div.entry-body p').filter((index, element) => {
      const text = jQuery(element).text().replace(/[\t\n]+/g,'').trim()
      if (text && text.length && !invalidText.includes(text)) {
        description.push(text);
      }
    });

    if (!description.length) {
      jQuery('div.content-gallery div.entry-top p').filter((index, element) => {
        description.push(jQuery(element).text());
      });
    }

    return {
      description,
    };
  }

  static getArticle(news, results) {
    const data = results.map(this.extractArticle);
    news.forEach((item, index) => {
      item.description = data[index].description;
    });
    return news;
  }
}

module.exports = ElEconomista
