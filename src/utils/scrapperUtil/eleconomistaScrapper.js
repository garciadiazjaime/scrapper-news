import cheerio from 'cheerio';

import constants from '../../constants';


// Utility to scrap specific source
export default class ElEconomista {

  // based on html passed (source code) news are extracted
  // @param {string} htmlString - html source page
  // @return {array} - array with news extracted
  static extractNews(htmlString) {
    const data = [];
    const jQuery = cheerio.load(htmlString);
    const { code, url } = constants.source.eleconomista;

    const inspectors = [
      '#front_central .view-display-id-block_2 .views-row-first .views-field-title a',
      '#front_central #front_izquierda .views-field-title a'
    ];

    inspectors.forEach((inspector) => {
      jQuery(inspector).filter((index, element) => {
        const title = jQuery(element).text();
        const link = `${url}${jQuery(element).attr('href')}`;
        const item = {
          title,
          link,
          source: code,
        };
        data.push(item);
      });
    });

    return data;
  }

  static extractImage(htmlString) {
    let image = '';
    const jQuery = cheerio.load(htmlString);
    const { url } = constants.source.eleconomista;

    jQuery('#front_central .foto img').filter((index, element) => {
      image = `${url}${jQuery(element).attr('src')}`;
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
