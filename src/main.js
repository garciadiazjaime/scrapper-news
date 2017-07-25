import ScrapperUtil from './utils/scrapperUtil';

import config from './config';
import constants from './constants';

const { code, url } = constants.source.aristeguinoticias;

ScrapperUtil.getSource(url)
  .then(response => ScrapperUtil.extractNews(code, response))
  .then(news => ScrapperUtil.postNews(`${config.get('api.url')}api/news`, code, news))
  .then(() => {
    console.log(new Date());
    console.log(`successfully scrapped: ${url}`);
  })
  .catch((error) => {
    console.log(new Date());
    console.log(`error while scrapping: ${url}`);
    console.log(error);
  });
