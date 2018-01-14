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
      const url = `${url}${jQuery(element).find('a').attr('href')}`;
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
}
