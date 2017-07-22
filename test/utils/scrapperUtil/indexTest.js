import request from 'request-promise-native';
import fs from 'fs';
import path from 'path';
import sinon from 'sinon';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import scrapperUtil from '../../../src/utils/scrapperUtil';
import constants from '../../../src/constants';

chai.use(chaiAsPromised);
const expect = chai.expect;
const url = 'http://aristeguinoticias.com/';
const filePath = path.join(__dirname, '../../stub/aristeguinoticias.com.html');


describe('scrapperUtil', () => {

  describe('getSource', () => {

    describe('promise fulfilled', () => {

      beforeEach(() => {
        sinon.stub(scrapperUtil, 'getSource').callsFake(() => {
          return new Promise((resolve, reject) => {
            fs.readFile(filePath, 'utf8', (err, data) => {
              if (err) {
                return reject(err);
              }
              resolve(data);
            });
          });
        });
      });

      afterEach(() => {
        scrapperUtil.getSource.restore();
      });

      it('return promise with htmlString', () => {
        expect(scrapperUtil.getSource(url)).to.eventually.be.fulfilled;
      });
    });


    describe('promise rejected', () => {

      beforeEach(() => {
        sinon.stub(scrapperUtil, 'getSource').callsFake(() => {
          return Promise.reject();
        });
      });

      afterEach(() => {
        scrapperUtil.getSource.restore();
      });

      it('returns promise rejected', () => {
        expect(scrapperUtil.getSource(url)).to.eventually.be.rejected;
      });
    });

  });

  describe.only('extractNews', () => {

    describe('promise fulfilled', () => {

      beforeEach(() => {

      });

      afterEach(() => {
        // scrapperUtil.getSource.restore();
      });

      it('getSource', () => {
        fs.readFile(filePath, 'utf8', (err, data) => {
          expect(err).to.equal(null);
          const news = scrapperUtil.extractNews(constants.source.aristeguinoticias, data);
          console.log('news', news);
        });
      });
    });

  });

});
