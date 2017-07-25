import request from 'request-promise-native';
import fs from 'fs';
import path from 'path';
import sinon from 'sinon';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import ScrapperUtil from '../../../src/utils/scrapperUtil';
import AristeguiNoticiasScrapper from '../../../src/utils/scrapperUtil/aristeguiNoticiasScrapper';
import constants from '../../../src/constants';

chai.use(chaiAsPromised);
const expect = chai.expect;
const filePath = path.join(__dirname, '../../stub/aristeguinoticias.com.html');


describe('ScrapperUtil', () => {

  describe('#getSource', () => {
    const url = 'url';

    describe('promise fulfilled', () => {

      beforeEach(() => {
        sinon.stub(ScrapperUtil, 'getSource').callsFake(() => new Promise((resolve) => resolve()));
      });

      afterEach(() => {
        ScrapperUtil.getSource.restore();
      });

      it('return promise with htmlString', () => {
        expect(ScrapperUtil.getSource(url)).to.eventually.be.fulfilled;
      });
    });


    describe('promise rejected', () => {

      beforeEach(() => {
        sinon.stub(ScrapperUtil, 'getSource').callsFake(() => new Promise((resolve, reject) => reject()));
      });

      afterEach(() => {
        ScrapperUtil.getSource.restore();
      });

      it('returns promise rejected', () => {
        expect(ScrapperUtil.getSource(url)).to.eventually.be.rejected;
      });
    });

    describe('no promise', () => {

      it('returns false when invalid param sent', () => {
        let response = ScrapperUtil.getSource();
        expect(response).to.be.false;

        response = ScrapperUtil.postNews('');
        expect(response).to.be.false;

        response = ScrapperUtil.postNews(null);
        expect(response).to.be.false;
      });
    });

  });

  describe('#extractNews', () => {

    describe('AristeguiNoticiasScrapper', () => {

      beforeEach(() => {
        sinon.stub(AristeguiNoticiasScrapper, 'extractNews');
      });

      afterEach(() => {
        AristeguiNoticiasScrapper.extractNews.restore();
      });

      it('calls right source', () => {
        const htmlString = 'htmlString';
        ScrapperUtil.extractNews(constants.source.aristeguinoticias.code, htmlString);
        expect(AristeguiNoticiasScrapper.extractNews.calledOnce).to.be.true;
        expect(AristeguiNoticiasScrapper.extractNews.calledWith(htmlString)).to.be.true;
      });

      it('does not execute extractacor when invalid source sent', () => {
        ScrapperUtil.extractNews('invalid_source', '');
        expect(AristeguiNoticiasScrapper.extractNews.called).to.be.false;
      });
    });

  });

  describe('#postNews', () => {
    const url = 'url';

    describe('promise fulfilled', () => {

      beforeEach(() => {
        sinon.stub(ScrapperUtil, 'postNews').callsFake(() => new Promise((resolve) => resolve()));
      });

      afterEach(() => {
        ScrapperUtil.postNews.restore();
      });

      it('resolves promise', () => {
        expect(ScrapperUtil.postNews('uri', 'source', 'news')).to.eventually.be.fulfilled;
      });
    });


    describe('promise rejected', () => {

      beforeEach(() => {
        sinon.stub(ScrapperUtil, 'postNews').callsFake(() => new Promise((resolve, reject) => reject()));
      });

      afterEach(() => {
        ScrapperUtil.postNews.restore();
      });

      it('rejects promise', () => {
        expect(ScrapperUtil.postNews('uri', 'source', 'news')).to.eventually.be.rejected;
      });
    });

    describe('no promise', () => {

      it('returns false when invalid params sent', () => {
        let response = ScrapperUtil.postNews(null, null, null);
        expect(response).to.be.false;

        response = ScrapperUtil.postNews('uri', null, null);
        expect(response).to.be.false;

        response = ScrapperUtil.postNews(null, 'source', null);
        expect(response).to.be.false;

        response = ScrapperUtil.postNews(null, null, [1]);
        expect(response).to.be.false;
      });
    });

  });

});
