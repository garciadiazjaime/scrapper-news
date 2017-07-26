import cheerio from 'cheerio';

import constants from '../../constants';

const removeDimentionFromImage = (image) => image ? image.replace(/\-[\d]+x[\d]+\./, '.') : image;

// Utility to scrap specific source
export default class Proceso {

  // based on html passed (source code) news are extracted
  // @param {string} htmlString - html source page
  // @return {array} - array with news extracted
  static extractNews(htmlString) {
    const data = [];
    const jQuery = cheerio.load(htmlString);
    const { code, url } = constants.source.proceso;

    jQuery('.main-featured .slider li').filter((index, element) => {
      const title = jQuery(element).find('.caption a').text();
      const link = jQuery(element).find('.caption a').attr('href');
      const image = jQuery(element).find('img').data('cfsrc');

      const item = {
        title,
        link,
        image: removeDimentionFromImage(image),
        source: code,
      };
      data.push(item);
    });

    jQuery('.main-featured .blocks article').filter((index, element) => {
      const title = jQuery(element).find('h3 a').text();
      const link = jQuery(element).find('h3 a').attr('href');
      const image = jQuery(element).find('img').data('cfsrc');

      const item = {
        title,
        link,
        image: removeDimentionFromImage(image),
        source: code,
      };
      data.push(item);
    });

    return data;
  }

}
