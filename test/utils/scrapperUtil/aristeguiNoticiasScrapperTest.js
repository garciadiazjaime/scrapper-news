import fs from 'fs';
import path from 'path';
import chai from 'chai';

import scrapperUtil from '../../../src/utils/scrapperUtil';
import constants from '../../../src/constants';

const expect = chai.expect;
const filePath = path.join(__dirname, '../../stub/aristeguinoticias.com.html');


describe('AristeguiNoticiasScrapper', () => {

  describe('#extractNews', () => {

    it('extracts news when valid html source is passed', (done) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        const news = scrapperUtil.extractNews(constants.source.aristeguinoticias.code, data);
        expect(err).to.equal(null);
        expect(news.length).to.equal(10);
        expect(news[0]).to.have.all.keys('title', 'image', 'link', 'source');
        done();
      });
    });

    it('returns empty array when empty html source is passed', () => {
      const news = scrapperUtil.extractNews(constants.source.aristeguinoticias.code, "");
      expect(news.length).to.equal(0);
    });

    it('returns false when invalid source is passed', () => {
      const news = scrapperUtil.extractNews('invalid_source', "");
      expect(news).to.be.false;
    });

  });

});
