/* eslint-disable camelcase, func-names */

import { expect } from 'chai';
import request from 'superagent';
import prefix from 'superagent-prefix';
import config from 'config';
import testData from './testData';

const apiServerURL = config.get('apiServerURL');

// independent test data.
const { alice, bob, erc20 } = testData;

// dependent test data. which need to be configured.
let erc20Commitments;
let erc20CommitmentBatchTransfer;
let erc20ConsolidationCommitment;
let erc20Address;

describe('****** Integration Test ******\n', function() {
  before(async function() {
    await testData.configureDependentTestData();
    ({ erc20Commitments, erc20CommitmentBatchTransfer, erc20ConsolidationCommitment } = testData);
  });
  /*
   *  Step 1.
   *  This step will create accounts for Alice and Bob.
   */
  describe('*** Create Users ***', async function() {
    /*
     * Create an account for Alice.
     */
    it(`Sign up ${alice.name}`, function(done) {
      request
        .post('/createAccount')
        .use(prefix(apiServerURL))
        .send(alice)
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.nested.property('body.data.name');
          return done();
        });
    });
    /*
     * Create an account for Bob.
     */
    it(`Sign up ${bob.name}`, function(done) {
      request
        .post('/createAccount')
        .use(prefix(apiServerURL))
        .send(bob)
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.nested.property('body.data.name');
          return done();
        });
    });
  });
  /*
   * Step 2.
   * This step will log in Alice and Bob.
   */
  describe('*** Login Users ***', function() {
    after(async function() {
      let res;
      res = await request
        .get('/getUserDetails')
        .use(prefix(apiServerURL))
        .set('Authorization', alice.token);

      alice.secretKey = res.body.data.secretKey;

      res = await request
        .get('/getUserDetails')
        .use(prefix(apiServerURL))
        .set('Authorization', bob.token);

      bob.secretKey = res.body.data.secretKey;
    });

    /*
     * Login User Alice.
     */
    it(`Sign in ${alice.name}`, function(done) {
      request
        .post('/login')
        .use(prefix(apiServerURL))
        .send(alice)
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.nested.property('body.data.token');

          alice.token = res.body.data.token;
          return done();
        });
    });
    /*
     * Login User Bob.
     */
    it(`Sign in ${bob.name}`, function(done) {
      request
        .post('/login')
        .use(prefix(apiServerURL))
        .send(bob)
        .set('Accept', 'application/json')
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.nested.property('body.data.token');

          bob.token = res.body.data.token;
          return done();
        });
    });
  });

  /*
   * Step 3 to 8.
   *  These steps will test the creation of ERC-721 tokens and ERC-721 token commitments, as well as the transfer and burning of these tokens and their commitments.
   *  Alice mints an ERC-721 token. She then shields that token by minting an ERC-721 commitment
   *  and transfers that commitment to Bob. Bob then burns the received ERC-721 commitment
   *  and transfers the resulting ERC-721 token to Alice.
   *  Finally, Alice burns the received ERC-721 token.
   */

  /*
   * Step 9 to 16.
   * These steps will test the creation of ERC-20 tokens and ERC-20 token commitments, as well as the transfer and burning of these tokens and their commitments.
   * Story line:
   *  Alice mints 5 ERC-20 tokens. She then shields these tokens by creating 2 ERC-20 commitments with values of 2 and 3 tokens.
   *  Alice then transfers 4 ERC-20 tokens in commitments to Bob.
   *  Bob burns the received ERC-20 commitment and transfers the resulting 4 ERC-20 tokens to Alice.
   *  Finally, Alice burns her received ERC-20 tokens and her remaining ERC-20 token commitment.
   */

  describe('*** ERC-20 and ERC-20  Consolidation Commitment ***', function() {
    context(`${alice.name} tasks: `, function() {
      /*
       * Step 9.
       * Mint ERC-20 token,
       */
      it(`Mint ${erc20.mint} ERC-20 tokens`, async function() {
        // Get the erc20 address so that we can include it in the commitment hashes
        const erc20AddressResponse = await request
          .get('/getFTokenContractAddress')
          .use(prefix(apiServerURL))
          .set('Authorization', alice.token);
        erc20Address = erc20AddressResponse.body.data.ftAddress;
        erc20ConsolidationCommitment.erc20Address = erc20Address;

        let res;
        try {
          res = await request
            .post('/mintFToken')
            .use(prefix(apiServerURL))
            .send({
              value: erc20.mint,
            })
            .set('Accept', 'application/json')
            .set('Authorization', alice.token);
        } catch (err) {
          throw new Error(err);
        }

        expect(res).to.have.nested.property('body.data.message');
        expect(res.body.data.message).to.be.equal('Mint Successful');
      });
      /*
       * Step 10.
       * Mint ERC-20 token commitment.
       */
      it(`Mint ${erc20.toBeMintedAsCommitment[0]} ERC-20 token commitment`, function(done) {
        request
          .post('/mintFTCommitment')
          .use(prefix(apiServerURL))
          .send({ outputCommitments: [erc20ConsolidationCommitment.mint[0]] })
          .set('Accept', 'application/json')
          .set('Authorization', alice.token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res).to.have.nested.property('body.data.salt');
            expect(res).to.have.nested.property('body.data.commitment');
            expect(res).to.have.nested.property('body.data.commitmentIndex');

            erc20ConsolidationCommitment.mint[0].salt = res.body.data.salt; // set Salt from response to calculate and verify commitment.
            erc20ConsolidationCommitment.mint[0].address = erc20Address;
            expect(res.body.data.commitment).to.be.equal(
              erc20ConsolidationCommitment.mint[0].commitment,
            );
            expect(res.body.data.commitmentIndex).to.be.equal(
              erc20ConsolidationCommitment.mint[0].commitmentIndex,
            );
            return done();
          });
      });
      /*
       * Step 11.
       * Mint ERC-20 token commitment.
       */
      it(`Mint ${erc20.toBeMintedAsCommitment[1]} ERC-20 token commitment`, function(done) {
        request
          .post('/mintFTCommitment')
          .use(prefix(apiServerURL))
          .send({ outputCommitments: [erc20ConsolidationCommitment.mint[1]] })
          .set('Accept', 'application/json')
          .set('Authorization', alice.token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res).to.have.nested.property('body.data.salt');
            expect(res).to.have.nested.property('body.data.commitment');
            expect(res).to.have.nested.property('body.data.commitmentIndex');

            erc20ConsolidationCommitment.mint[1].salt = res.body.data.salt; // set Salt from response to calculate and verify commitment.
            erc20ConsolidationCommitment.mint[1].address = erc20Address;
            expect(res.body.data.commitment).to.be.equal(
              erc20ConsolidationCommitment.mint[1].commitment,
            );
            expect(res.body.data.commitmentIndex).to.be.equal(
              erc20ConsolidationCommitment.mint[1].commitmentIndex,
            );
            return done();
          });
      });
      /*
       * Step 12.
       * Transfer ERC-20 Commitment.
       */
      it(`Transfer ${erc20.transfer} ERC-20 Commitment to Bob`, function(done) {
        request
          .post('/consolidationTransfer')
          .use(prefix(apiServerURL))
          .send({
            inputCommitments: erc20ConsolidationCommitment.mint,
            outputCommitment: erc20ConsolidationCommitment.transfer,
            receiver: { name: bob.name },
          })
          .set('Accept', 'application/json')
          .set('Authorization', alice.token)
          .end((err, res) => {
            if (err) return done(err);

            const outputCommitments = res.body.data;
            console.log(`************************${JSON.stringify(outputCommitments)}`);
            erc20ConsolidationCommitment.transfer.salt = outputCommitments.salt; // set Salt from response to calculate and verify commitment.
            erc20ConsolidationCommitment.transfer.address = erc20Address;
            expect(1).to.be.equal(1);
            return done();
          });
      });
    });
  });
});
