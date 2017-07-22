import scrapperUtil from './utils/scrapperUtil';

const url = 'http://aristeguinoticias.com/';
//
// request(url, (error, response, html) => {
//   // console.log('error', error);
//   // console.log('response', response);
//   // console.log(html);
//
//     // if (!error) {
//     //     // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality
//     //
//     //     var $ = cheerio.load(html);
//     //
//     //     // Finally, we'll define the variables we're going to capture
//     //
//     //     var title, release, rating;
//     //     var json = {
//     //         title: "",
//     //         release: "",
//     //         rating: ""
//     //     };
//     // }
// });


// const fs = require('fs');
//
// fs.readFile(__dirname + '/../test/stub/aristeguinoticias.com.html', 'utf8', (err, data) => {
//   if (err) {
//     return console.log(err);
//   }
//   console.log(data);
// });


scrapperUtil.getSource(url);
