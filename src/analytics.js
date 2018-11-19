const request = require('request-promise-native');
const Analyzer = require('natural').SentimentAnalyzer;
const stemmer = require('natural').PorterStemmer;

const config = require('./config');

const analyzer = new Analyzer('Spanish', stemmer, 'afinn');
const shortWords = [
  'como',
  'para',
  'pero',
  'quien',
  'este',
  'ello',
  'tambien',
  'entre',
  'pues',
];

function cleanText(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s]/gi, ' ').toLowerCase();
}

function getWordsCounted(data) {
  const words = data.split(' ');
  const wordsCount = words.reduce((accumulator, word) => {
    accumulator[word] = (accumulator[word] || 0) + 1;
    return accumulator;
  }, {});

  const sortedList = Object.entries(wordsCount)
    .sort((a, b) => b[1] - a[1])
    .filter(row => row[1] > 2 && row[0].length > 3 && !shortWords.includes(row[0]))
    .slice(0, 12);

  return sortedList;
}

async function getNews(apiUrl) {
  const url = `${apiUrl}news?query={news{_id,title,description,url}}`;
  const { data: { news = [] } = {} } = await request(url, {
    json: true,
  });

  return news;
}

function getAnalysis(news) {
  const analysis = news.map((item) => {
    const text = cleanText(`${item.description.join(' ')} ${item.title}`);
    const sentiment = analyzer.getSentiment(text.split(' '));
    const wordsCount = getWordsCounted(text);

    const review = {
      newsId: item._id,
      tmp: item.title,
      sentiment,
      wordsCount,
    };

    return review;
  });

  return analysis;
}

async function main() {
  const news = await getNews(config.get('api.url'));
  const analysis = getAnalysis(news);

  console.log('analysis', JSON.stringify(analysis, null, 1));
}

main();
