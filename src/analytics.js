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
  'esta',
];

function cleanText(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s]/gi, ' ').toLowerCase();
}

function getWordsFrequency(data) {
  const words = data.split(' ');
  const wordsFrequency = words.reduce((accumulator, word) => {
    accumulator[word] = (accumulator[word] || 0) + 1;
    return accumulator;
  }, {});

  const sortedList = Object.entries(wordsFrequency)
    .sort((a, b) => b[1] - a[1])
    .filter(row => row[1] > 2 && row[0].length > 3 && !shortWords.includes(row[0]))
    .slice(0, 12);

  const filterWordsFrequency = sortedList.map(([word, frequency]) => ({
    word,
    frequency,
  }));

  return filterWordsFrequency;
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
    const wordsFrequency = getWordsFrequency(text);

    const review = {
      newsId: item._id,
      title: item.title,
      url: item.url,
      sentiment,
      wordsFrequency,
    };

    return review;
  });

  return analysis;
}

function saveAnalysis(apiURL, data) {
  const options = {
    method: 'POST',
    uri: `${apiURL}analysis`,
    body: {
      data,
    },
    json: true,
  };
  return request(options);
}

async function main() {
  const apiURL = config.get('api.url');
  const news = await getNews(apiURL);
  const analysis = getAnalysis(news);
  const results = await saveAnalysis(apiURL, analysis);

  console.log('analysis saved', JSON.stringify(results, null, 1));
}

main();
