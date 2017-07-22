import cheerio from 'cheerio';

import constants from '../../constants';


// Utility to scrap specific source
export default class AristeguiNoticiasScrapper {

  // based on html passed (source code) news are extracted
  // @param {string} htmlString - html source page
  // @return {array} - array with news extracted
  static extractNews(htmlString) {
    const data = [];
    const jQuery = cheerio.load(htmlString);
    const source = constants.source.aristeguinoticias.id;

    jQuery('.img_principal .imgTML').filter((index, element) => {
      const title = jQuery(element).find('.title_content2 span').text();
      const image = jQuery(element).find('img').data('cfsrc');
      const link = jQuery(element).find('a').attr('href');
      const item = {
        title,
        image,
        link,
        source,
      };
      return data.push(item);
    });
    return data;
  }
}
