import fs from 'fs';
import path from 'path';
import sinon from 'sinon';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import scrapperUtil from '../../../src/utils/scrapperUtil';
import constants from '../../../src/constants';

chai.use(chaiAsPromised);
const expect = chai.expect;
const filePath = path.join(__dirname, '../../stub/proceso.com.mx.html');


describe('ProcesoScrapper', () => {

  describe('#extractNews', () => {

    it('extracts news when valid html source is passed', (done) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        const news = scrapperUtil.extractNews(constants.source.proceso.code, data);

        expect(err).to.equal(null);
        expect(news.length).to.equal(7);
        expect(news[0]).to.have.all.keys('title', 'link', 'source', 'image');
        done();
      });
    });

    it('returns empty array when empty html source is passed', () => {
      const news = scrapperUtil.extractNews(constants.source.eleconomista.code, "");
      expect(news.length).to.equal(0);
    });

    it('returns false when invalid source is passed', () => {
      const news = scrapperUtil.extractNews('invalid_source', "");
      expect(news).to.be.false;
    });

  });

});
