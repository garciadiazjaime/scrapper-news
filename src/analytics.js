const request = require('request-promise-native');
const Sentiment = require('sentiment');
const Analyzer = require('natural').SentimentAnalyzer;
const stemmer = require('natural').PorterStemmer;

const analyzer = new Analyzer('Spanish', stemmer, 'afinn');

const config = require('./config');

function cleanText(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s]/gi, '').toLowerCase();
}

const shortWords = [
  'como',
  'para',
  'pero',
  'quien',
  'este',
  'ello',
];

async function main() {
  const spanishLanguage = {
    labels: {
      nadie: -2,
      nada: -2,
      ni: -2,
      ningun: -2,
      no: -2,
      nunca: -2,
      tampoco: -2,

      todos: 2,
      todo: 2,
      muy: 2,
      algun: 2,
      si: 2,
      siempre: 2,
      tambien: 2,
    },
  };

  const url = `${config.get('api.url')}news?query={news{_id,title,description,image,url,source}}`;
  const { data: { news = [] } = {} } = await request(url, {
    json: true,
  });


  const sentiment = new Sentiment();
  sentiment.registerLanguage('sp', spanishLanguage);

  const reviews = news.map((item) => {
    // const text = cleanText(item.description.join(' ') + item.title);
    // console.log(`\n${  text}`);
    // const result = sentiment.analyze(text, { language: 'sp' });

    const text = `${item.description.join(' ')} ${item.title}`;
    // console.log('here', text.split(' '));
    const sentiment = analyzer.getSentiment(text.split(' '));

    const wordsCount = countWors(text);

    const review = {
      id: item._id,
      sentiment,
      wordsCount,
      length: text.length,
    };
    return review;
  });

  console.log('reviews', JSON.stringify(reviews, null, 2));
}

function countWors(data) {
  const words = data.split(' ');
  const counters = words.reduce((accumulator, word) => {
    accumulator[word] = (accumulator[word] || 0) + 1;
    return accumulator;
  }, {});

  const sortedList = Object.entries(counters)
    .sort((a, b) => b[1] - a[1])
    .filter(row => row[1] > 2)
    .filter(row => row[0].length > 3)
    .filter(row => !shortWords.includes(row[0]));

  return sortedList;
}


main();
