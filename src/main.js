import ScrapperUtil from './utils/scrapperUtil';

import config from './config';
import constants from './constants';


const url = 'http://aristeguinoticias.com/';

ScrapperUtil.getSource(url)
  .then(response => ScrapperUtil.extractNews(constants.source.aristeguinoticias, response))
  .then(news => ScrapperUtil.postNews(config.get('api.url'), constants.source.aristeguinoticias, news))
  .then((response) => {
    console.log(new Date());
    console.log(`successfully scrapped: ${url}`);
  })
  .catch((error) => {
    console.log(new Date());
    console.log(`error while scrapping: ${url}`);
    console.log(error);
  });
