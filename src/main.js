import ScrapperUtil from './utils/scrapperUtil';

import config from './config';
import constants from './constants';

const { url, id } = constants.source.aristeguinoticias;

ScrapperUtil.getSource(url)
  .then(response => ScrapperUtil.extractNews(id, response))
  .then(news => ScrapperUtil.postNews(config.get('api.url'), id, news))
  .then(() => {
    console.log(new Date());
    console.log(`successfully scrapped: ${url}`);
  })
  .catch((error) => {
    console.log(new Date());
    console.log(`error while scrapping: ${url}`);
    console.log(error);
  });
