const cheerio = require('cheerio');

const constants = require('../../constants');


// Utility to scrap specific source
class AristeguiNoticiasScrapper {

  // based on html passed (source code) news are extracted
  // @param {string} htmlString - html source page
  // @return {array} - array with news extracted
  static extractNews(htmlString) {
    const data = [];
    const jQuery = cheerio.load(htmlString);
    const { code } = constants.source.aristeguinoticias;

    jQuery('.img_principal .imgTML').filter((index, element) => {
      const title = jQuery(element).find('.title_content2 span').text();
      const image = jQuery(element).find('img').attr('src');
      const url = jQuery(element).find('a').attr('href');
      const item = {
        title,
        image,
        url,
        source: code,
      };
      return data.push(item);
    });
    return data;
  }

  static extractArticle(htmlString) {
    const description = [];
    const jQuery = cheerio.load(htmlString);

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

module.exports = AristeguiNoticiasScrapper
