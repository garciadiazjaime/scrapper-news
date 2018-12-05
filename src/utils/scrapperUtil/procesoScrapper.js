const cheerio = require('cheerio');

const constants = require('../../constants');


// Utility to scrap specific source
class Proceso {

  // based on html passed (source code) news are extracted
  // @param {string} htmlString - html source page
  // @return {array} - array with news extracted
  static extractNews(htmlString) {
    const data = [];
    const jQuery = cheerio.load(htmlString);
    const { code, url } = constants.source.proceso;

    const urlRegex = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi

    jQuery('.main-featured ul.slides li').filter((index, element) => {
      const title = jQuery(element).find('.caption a').text();
      const url = jQuery(element).find('.caption a').attr('href');
      const imageReference = jQuery(element).find('a.image-link') && jQuery(element).find('a.image-link')[0]
      const image = imageReference && jQuery(imageReference).css('background-image').match(urlRegex)

      const item = {
        title,
        url,
        image: image && image.pop(),
        source: code,
      };
      data.push(item);
    });

    jQuery('div.foreground div.article_item').filter((index, element) => {
      const title = jQuery(element).find('h3 a').text();
      const url = jQuery(element).find('h3 a').attr('href');
      const image = jQuery(element).find('img').data('src');

      const item = {
        title,
        url,
        image,
        source: code,
      };
      data.push(item);
    });

    return data;
  }

  static extractArticle(htmlString) {
    const description = [];
    const jQuery = cheerio.load(htmlString);

    jQuery('.post-content.description p').filter((index, element) => {
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

module.exports = Proceso
