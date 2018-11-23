const request = require('request');
const util = require('util');
const querystring = require('querystring');
const cheerio = require('cheerio');

function main() {
  const query = 'woodward hombres washington';
  const URL = '%s://www.google.%s/search?hl=%s&q=%s&start=%s&sa=N&num=%s&ie=UTF-8&oe=UTF-8&gws_rd=ssl';
  const source = {
    protocol: 'https',
    tld: 'com',
    lang: 'en',
    resultsPerPage: '10',
  };
  const start = null;
  const newUrl = util.format(URL,
    source.protocol,
    source.tld,
    source.lang,
    querystring.escape(query),
    start,
    source.resultsPerPage);

  const options = {
    url: newUrl,
    method: 'GET',
  };

  const itemSel = '#search div.g';
  const linkSel = 'h3.r a';
  const descSel = 'div.s span.st';

  request(options, (err, resp, body) => {
    if (err != null || resp.statusCode !== 200) {
      return null;
    }

    const $ = cheerio.load(body);
    const items = [];

    $(itemSel).each((index, element) => {
      const linkElement = $(element).find(linkSel);
      const descElement = $(element).find(descSel);
      const qsObj = querystring.parse($(linkElement).attr('href'));

      if ($(descElement).text()) {
        items.push({
          title: $(linkElement).text(),
          description: $(descElement).text(),
          link: qsObj['/url?q'],
        });
      }
    });

    console.log(items);
  });
}

main();
