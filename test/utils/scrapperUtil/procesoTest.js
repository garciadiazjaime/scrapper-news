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
const fileArticlePath = path.join(__dirname, '../../stub/proceso.com.mx-article.html');


describe('ProcesoScrapper', () => {

  describe('#extractNews', () => {

    it('extracts news when valid html source is passed', (done) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        const news = scrapperUtil.extractNews(constants.source.proceso.code, data);

        expect(err).to.equal(null);
        expect(news.length).to.equal(7);
        expect(news[0]).to.have.all.keys('title', 'url', 'source', 'image');
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

  describe('#getArticle', () => {
    const news = [{
      title: 'title1',
    }, {
      title: 'title2',
    }];

    describe('scrapperUtil.getSource returns valid response', () => {

      afterEach(() => {
        scrapperUtil.getSource.restore();
      });

      it('extracts news when valid html source is passed', (done) => {
        fs.readFile(fileArticlePath, 'utf8', (err, data) => {
          sinon.stub(scrapperUtil, 'getSource').callsFake(() => Promise.resolve(data));

          scrapperUtil.getImages(constants.source.proceso.code, news)
            .then((response) => {
              expect(response.length).to.equal(2);
              expect(response[0]).to.have.all.keys('title', 'description');
              done();
            });
        });
      });

    });

    describe('scrapperUtil.getSource returns initial value', () => {

      beforeEach(() => {
        sinon.stub(scrapperUtil, 'getSource').callsFake(() => Promise.reject());
      });

      afterEach(() => {
        scrapperUtil.getSource.restore();
      });

      it('returns initial array when promise rejected', () => {
        expect(scrapperUtil.getImages(constants.source.eleconomista.code, news))
          .to.eventually.deep.equal(news);
      });

      it('returns initial array when invalid sourceCode', () => {
        expect(scrapperUtil.getImages('invalid_source', news))
          .to.eventually.deep.equal(news);
      });
    });

  });

});
