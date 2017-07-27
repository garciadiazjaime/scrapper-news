import cheerio from 'cheerio';

import constants from '../../constants';


// Utility to scrap specific source
export default class ElUniversal {

  // based on html passed (source code) news are extracted
  // @param {string} htmlString - html source page
  // @return {array} - array with news extracted
  static extractNews(htmlString) {
    const data = [];
    const jQuery = cheerio.load(htmlString);
    const { code, url } = constants.source.eluniversal;

    jQuery('.view-home h2.field-content').filter((index, element) => {
      const title = jQuery(element).find('a').text();
      const link = `${url}${jQuery(element).find('a').attr('href')}`;
      const item = {
        title,
        link,
        source: code,
      };
      data.push(item);
    });

    return data;
  }

  static extractImage(htmlString) {
    let image = '';
    const jQuery = cheerio.load(htmlString);

    jQuery('#apertura .field-name-field-image img').filter((index, element) => {
      image = jQuery(element).data('src');
    });

    return image;
  }

  static processImages(news, results) {
    const images = results.map(this.extractImage);
    news.forEach((item, index) => {
      item.image = images[index];
    });
    return news;
  }
}
