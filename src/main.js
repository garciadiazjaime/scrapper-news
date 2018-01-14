import ScrapperUtil from './utils/scrapperUtil';

import config from './config';
import constants from './constants';

const sources = Object.keys(constants.source);

sources.forEach((source) => {
  const { code, url, status } = constants.source[source];
  if (status) {
    console.log(`about to scrap: ${url}`);
    ScrapperUtil.getSource(url)
      .then(response => ScrapperUtil.extractNews(code, response))
      .then(news => ScrapperUtil.getImages(code, news))
      .then(news => ScrapperUtil.postNews(`${config.get('api.url')}news`, news))
      .then(() => {
        console.log(`successfully scrapped: ${url}`);
      })
      .catch((error) => {
        console.log(`error while scrapping: ${url}`);
        console.log(error);
      });
  }
});
