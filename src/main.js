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
      .then(news => ScrapperUtil.getArticles(code, news))
      .then(news => ScrapperUtil.postNews(`${config.get('api.url')}news`, news))
      .then((results) => {
        console.log(`successfully scrapped: ${url}`);
        console.log(results);
      })
      .catch((error) => {
        console.log(`error while scrapping: ${url}`);
        console.log(error);
      });
  }
});
