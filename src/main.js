import ScrapperUtil from './utils/scrapperUtil';

import config from './config';
import constants from './constants';

const sources = ['aristeguinoticias', 'eleconomista'];

sources.forEach((source) => {
  const { code, url } = constants.source[source];

  console.log(`about to scrap: ${url}`);
  ScrapperUtil.getSource(url)
    .then(response => ScrapperUtil.extractNews(code, response))
    .then(news => ScrapperUtil.getImages(code, news))
    .then(news => ScrapperUtil.postNews(`${config.get('api.url')}api/news`, news))
    .then(() => {
      console.log(`successfully scrapped: ${url}`);
    })
    .catch((error) => {
      console.log(`error while scrapping: ${url}`);
      console.log(error);
    });
});
