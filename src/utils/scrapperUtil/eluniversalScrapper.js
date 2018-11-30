const cheerio = require('cheerio');

const constants = require('../../constants');


// Utility to scrap specific source
class ElUniversal {

  // based on html passed (source code) news are extracted
  // @param {string} htmlString - html source page
  // @return {array} - array with news extracted
  static extractNews(htmlString) {
    const data = [];
    const jQuery = cheerio.load(htmlString);
    const { code, url: sourceUrl } = constants.source.eluniversal;

    jQuery('div.view-home div.views-row h1 a, div.view-home div.views-row h3 a').filter((index, element) => {
      const title = jQuery(element).text();
      const url = `${sourceUrl}${jQuery(element).attr('href')}`;
      const item = {
        title,
        url,
        source: code,
      };
      data.push(item);
    });

    return data;
  }

  static extractImage(htmlString) {
    let image = '';
    const description = [];
    const jQuery = cheerio.load(htmlString);

    jQuery('#apertura .field-name-field-image img').filter((index, element) => {
      image = jQuery(element).data('src');
    });

    if (!image) {
      image = jQuery('#apertura .field-type-text-with-summary img').first().attr('src');
      if (image) {
        image = [constants.source.eluniversal.url, image].join('');
      }
    }

    if(!image) {
      image = jQuery('.view-galeria-js .carousel-big .views-row img').first().data('src');
    }

    jQuery('#apertura .field-type-text-with-summary p').filter((index, element) => {
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

    jQuery('div#apertura div.pane-content p').filter((index, element) => {
      if (jQuery(element).text()) {
        description.push(jQuery(element).text());
      }
    });

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

module.exports = ElUniversal
