import fs from 'fs';
import path from 'path';
import sinon from 'sinon';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import scrapperUtil from '../../../src/utils/scrapperUtil';
import constants from '../../../src/constants';

chai.use(chaiAsPromised);
const expect = chai.expect;
const filePath = path.join(__dirname, '../../stub/eluniversal.com.mx.html');
const fileArticlePath = path.join(__dirname, '../../stub/eluniversal.com.mx-article.html');
const fileArticleVer2 = path.join(__dirname, '../../stub/eluniversal.com.mx-article-ver2.html');
const fileArticleVer3 = path.join(__dirname, '../../stub/eluniversal.com.mx-article-ver3.html');


describe('ElUniversal', () => {

  describe('#extractNews', () => {

    it('extracts news when valid html source is passed', (done) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        const news = scrapperUtil.extractNews(constants.source.eluniversal.code, data);

        expect(err).to.equal(null);
        expect(news.length).to.equal(14);
        expect(news[0]).to.have.all.keys('title', 'url', 'source');
        done();
      });
    });

    it('returns empty array when empty html source is passed', () => {
      const news = scrapperUtil.extractNews(constants.source.eluniversal.code, "");
      expect(news.length).to.equal(0);
    });

    it('returns false when invalid source is passed', () => {
      const news = scrapperUtil.extractNews('invalid_source', "");
      expect(news).to.be.false;
    });

  });

  describe('#getImages', () => {
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

          scrapperUtil.getImages(constants.source.eluniversal.code, news)
            .then((response) => {
              expect(response.length).to.equal(2);
              expect(response[0]).to.have.all.keys('title', 'image', 'description');
              done();
            });
        });
      });

    });

    describe('scrapperUtil.getSource returns valid response', () => {

      afterEach(() => {
        scrapperUtil.getSource.restore();
      });

      it('extracts news when valid html (ver2) source is passed', (done) => {
        fs.readFile(fileArticleVer2, 'utf8', (err, data) => {
          sinon.stub(scrapperUtil, 'getSource').callsFake(() => Promise.resolve(data));

          scrapperUtil.getImages(constants.source.eluniversal.code, news)
            .then((response) => {
              expect(response.length).to.equal(2);
              expect(response[0]).to.have.all.keys('title', 'image', 'description');
              done();
            });
        });
      });

    });

    describe('scrapperUtil.getSource returns valid response', () => {

      afterEach(() => {
        scrapperUtil.getSource.restore();
      });

      it('extracts news when valid html (ver3) source is passed ', (done) => {
        fs.readFile(fileArticleVer3, 'utf8', (err, data) => {
          sinon.stub(scrapperUtil, 'getSource').callsFake(() => Promise.resolve(data));

          scrapperUtil.getImages(constants.source.eluniversal.code, news)
            .then((response) => {

              expect(response.length).to.equal(2);
              expect(response[0]).to.have.all.keys('title', 'image', 'description');
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
        expect(scrapperUtil.getImages(constants.source.eluniversal.code, news))
          .to.eventually.deep.equal(news);
      });

      it('returns initial array when invalid sourceCode', () => {
        expect(scrapperUtil.getImages('invalid_source', news))
          .to.eventually.deep.equal(news);
      });
    });

  });

});
