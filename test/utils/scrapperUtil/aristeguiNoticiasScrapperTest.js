import fs from 'fs';
import path from 'path';
import sinon from 'sinon';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import scrapperUtil from '../../../src/utils/scrapperUtil';
import constants from '../../../src/constants';

chai.use(chaiAsPromised);
const expect = chai.expect;
const filePath = path.join(__dirname, '../../stub/aristeguinoticias.com.html');
const fileArticlePath = path.join(__dirname, '../../stub/aristeguinoticias.com-article.html');
const fileArticleDescriptionFallbackPath = path.join(__dirname, '../../stub/aristeguinoticias.com-description-fallback.html');


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

          scrapperUtil.getImages(constants.source.aristeguinoticias.code, news)
            .then((response) => {

              expect(response.length).to.equal(2);
              expect(response[0]).to.have.all.keys('title', 'description');
              done();
            });
        });
      });

    });

    describe('scrapperUtil.getSource returns valid response', () => {

      afterEach(() => {
        scrapperUtil.getSource.restore();
      });

      it('description fallback', (done) => {
        fs.readFile(fileArticleDescriptionFallbackPath, 'utf8', (err, data) => {
          sinon.stub(scrapperUtil, 'getSource').callsFake(() => Promise.resolve(data));

          scrapperUtil.getImages(constants.source.aristeguinoticias.code, news)
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
