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
let erc721;
let erc721Commitment;
let erc20Commitments;
let erc20CommitmentBatchTransfer;

describe('****** Integration Test ******\n', function() {
  before(async function() {
    await testData.configureDependentTestData();
    ({ erc721, erc721Commitment, erc20Commitments, erc20CommitmentBatchTransfer } = testData);
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

      alice.sk = res.body.data.secretkey;

      res = await request
        .get('/getUserDetails')
        .use(prefix(apiServerURL))
        .set('Authorization', bob.token);

      bob.sk = res.body.data.secretkey;
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
  describe('*** ERC-721 and ERC-721 Commitment ***', function() {
    context(`${alice.name} tasks: `, function() {
      /*
       * Step 3.
       * Mint ERC-721 Token.
       */
      it('Mint ERC-721 token', function(done) {
        request
          .post('/mintNFToken')
          .use(prefix(apiServerURL))
          .send(erc721)
          .set('Accept', 'application/json')
          .set('Authorization', alice.token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res).to.have.nested.property('body.data.message');
            expect(res.body.data.message).to.be.equal('NFT Mint Successful');
            return done();
          });
      });
      /*
       * Step 4.
       * Mint ERC-721 token commitment.
       */
      it('Mint ERC-721 token commitment', function(done) {
        request
          .post('/mintNFTCommitment')
          .use(prefix(apiServerURL))
          .send(erc721Commitment)
          .set('Accept', 'application/json')
          .set('Authorization', alice.token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res).to.have.nested.property('body.data.S_A');
            expect(res).to.have.nested.property('body.data.z_A');
            expect(res).to.have.nested.property('body.data.z_A_index');

            erc721Commitment.S_A = res.body.data.S_A; // set Salt from response to calculate and verify commitment.

            expect(res.body.data.z_A).to.be.equal(erc721Commitment.mintCommitment);
            expect(res.body.data.z_A_index).to.be.equal(erc721Commitment.mintCommitmentIndex);
            return done();
          });
      });
      /*
       * Step 5.
       * Transfer ERC-721 Commitment.
       */
      it('Transfer ERC-721 Commitment to Bob', function(done) {
        request
          .post('/transferNFTCommitment')
          .use(prefix(apiServerURL))
          .send({
            A: erc721Commitment.tokenID,
            uri: erc721Commitment.uri,
            S_A: erc721Commitment.S_A,
            S_B: erc721Commitment.S_B,
            z_A: erc721Commitment.mintCommitment,
            receiver_name: bob.name,
            z_A_index: erc721Commitment.mintCommitmentIndex,
          })
          .set('Accept', 'application/json')
          .set('Authorization', alice.token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res).to.have.nested.property('body.data.S_B');
            expect(res).to.have.nested.property('body.data.z_B');
            expect(res).to.have.nested.property('body.data.z_B_index');

            erc721Commitment.S_B = res.body.data.S_B; // set Salt from response to calculate and verify commitment.

            expect(res.body.data.z_B).to.be.equal(erc721Commitment.transferCommitment);
            expect(res.body.data.z_B_index).to.be.equal(erc721Commitment.transferCommitmentIndex);
            return done();
          });
      });
    });
    context(`${bob.name} tasks: `, function() {
      /*
       * This acts as a delay, which is needed to ensure that the recipient will be able to receive transferred data through Whisper.
       */
      before(done => setTimeout(done, 10000));
      /*
       * Step 6.
       * Burn ERC-721 Commitment.
       */
      it('Burn ERC-721 Commitment', function(done) {
        request
          .post('/burnNFTCommitment')
          .use(prefix(apiServerURL))
          .send({
            A: erc721Commitment.tokenID,
            uri: erc721Commitment.uri,
            S_A: erc721Commitment.S_B,
            z_A: erc721Commitment.transferCommitment,
            z_A_index: erc721Commitment.transferCommitmentIndex,
          })
          .set('Accept', 'application/json')
          .set('Authorization', bob.token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res).to.have.nested.property('body.data.message');
            expect(res.body.data.message).to.equal('burn successful');

            return done();
          });
      });
      /*
       * Step 7.
       * Tranfer ERC-721 Token.
       */
      it('Transfer ERC-721 token to Alice', function(done) {
        request
          .post('/transferNFToken')
          .use(prefix(apiServerURL))
          .send({
            tokenID: erc721.tokenID,
            uri: erc721.tokenURI,
            receiver_name: alice.name,
          })
          .set('Accept', 'application/json')
          .set('Authorization', bob.token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res).to.have.nested.property('body.data.message');
            expect(res.body.data.message).to.be.equal('NFT Transfer Successful');
            return done();
          });
      });
    });
    context(`${alice.name} tasks: `, function() {
      /*
       * This acts as a delay, which is needed to ensure that the recipient will be able to receive transferred data through Whisper.
       */
      before(done => setTimeout(done, 10000));
      /*
       * Step 8.
       * Burn ERC-721 Token.
       */
      it('Burn ERC-721 token', function(done) {
        request
          .post('/burnNFToken')
          .use(prefix(apiServerURL))
          .send({
            tokenID: erc721.tokenID,
            uri: erc721.tokenURI,
          })
          .set('Accept', 'application/json')
          .set('Authorization', alice.token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res).to.have.nested.property('body.data.message');
            expect(res.body.data.message).to.be.equal('NFT Burn Successful');
            return done();
          });
      });
    });
  });

  /*
   * Step 9 to 16.
   * These steps will test the creation of ERC-20 tokens and ERC-20 token commitments, as well as the transfer and burning of these tokens and their commitments.
   * Story line:
   *  Alice mints 5 ERC-20 tokens. She then shields these tokens by creating 2 ERC-20 commitments with values of 2 and 3 tokens.
   *  Alice then transfers 4 ERC-20 tokens in commitments to Bob.
   *  Bob burns the received ERC-20 commitment and transfers the resulting 4 ERC-20 tokens to Alice.
   *  Finally, Alice burns her received ERC-20 tokens and her remaining ERC-20 token commitment.
   */
  describe('*** ERC-20 and ERC-20 Commitment ***', function() {
    context(`${alice.name} tasks: `, function() {
      /*
       * Step 9.
       * Mint ERC-20 token,
       */
      it(`Mint ${erc20.mint} ERC-20 tokens`, function(done) {
        request
          .post('/mintFToken')
          .use(prefix(apiServerURL))
          .send({
            value: erc20.mint,
          })
          .set('Accept', 'application/json')
          .set('Authorization', alice.token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res).to.have.nested.property('body.data.message');
            expect(res.body.data.message).to.be.equal('Mint Successful');
            return done();
          });
      });
      /*
       * Step 10.
       * Mint ERC-20 token commitment.
       */
      it(`Mint ${erc20.toBeMintedAsCommitment[0]} ERC-20 token commitment`, function(done) {
        request
          .post('/mintFTCommitment')
          .use(prefix(apiServerURL))
          .send({ outputCommitments: [erc20Commitments.mint[0]] })
          .set('Accept', 'application/json')
          .set('Authorization', alice.token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res).to.have.nested.property('body.data.salt');
            expect(res).to.have.nested.property('body.data.commitment');
            expect(res).to.have.nested.property('body.data.commitmentIndex');

            erc20Commitments.mint[0].salt = res.body.data.salt; // set Salt from response to calculate and verify commitment.
            expect(res.body.data.commitment).to.be.equal(erc20Commitments.mint[0].commitment);
            expect(res.body.data.commitmentIndex).to.be.equal(
              erc20Commitments.mint[0].commitmentIndex,
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
          .send({ outputCommitments: [erc20Commitments.mint[1]] })
          .set('Accept', 'application/json')
          .set('Authorization', alice.token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res).to.have.nested.property('body.data.salt');
            expect(res).to.have.nested.property('body.data.commitment');
            expect(res).to.have.nested.property('body.data.commitmentIndex');

            erc20Commitments.mint[1].salt = res.body.data.salt; // set Salt from response to calculate and verify commitment.

            expect(res.body.data.commitment).to.be.equal(erc20Commitments.mint[1].commitment);
            expect(res.body.data.commitmentIndex).to.be.equal(
              erc20Commitments.mint[1].commitmentIndex,
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
          .post('/transferFTCommitment')
          .use(prefix(apiServerURL))
          .send({
            inputCommitments: erc20Commitments.mint,
            outputCommitments: [erc20Commitments.transfer, erc20Commitments.change],
            receiver: { name: bob.name },
          })
          .set('Accept', 'application/json')
          .set('Authorization', alice.token)
          .end((err, res) => {
            if (err) return done(err);

            const outputCommitments = res.body.data;
            erc20Commitments.transfer.salt = outputCommitments[0].salt; // set Salt from response to calculate and verify commitment.
            erc20Commitments.change.salt = outputCommitments[1].salt; // set Salt from response to calculate and verify commitment.

            expect(outputCommitments[0].commitment).to.be.equal(
              erc20Commitments.transfer.commitment,
            );
            expect(outputCommitments[0].commitmentIndex).to.be.equal(
              erc20Commitments.transfer.commitmentIndex,
            );
            expect(outputCommitments[1].commitment).to.be.equal(erc20Commitments.change.commitment);
            expect(outputCommitments[1].commitmentIndex).to.be.equal(
              erc20Commitments.change.commitmentIndex,
            );
            return done();
          });
      });
      /*
       * Step 13.
       * Burn ERC-20 Commitment.
       */
      it(`Burn ${erc20.change} ERC-20 Commitment`, function(done) {
        if (!erc20.change) this.skip();
        request
          .post('/burnFTCommitment')
          .use(prefix(apiServerURL))
          .send({
            inputCommitments: [erc20Commitments.change],
            receiver: {
              name: bob.name,
            },
          })
          .set('Accept', 'application/json')
          .set('Authorization', alice.token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res).to.have.nested.property('body.data.message');
            expect(res.body.data.message).to.be.equal('Burn successful');
            return done();
          });
      });
    });
    context(`${bob.name} tasks: `, function() {
      /*
       * This acts as a delay, which is needed to ensure that the recipient will be able to receive transferred data through Whisper.
       */
      before(done => setTimeout(done, 10000));
      /*
       * Step 14.
       * Burn ERC-20 Commitment.
       */
      it(`Burn ${erc20.transfer} ERC-20 Commitment`, function(done) {
        request
          .post('/burnFTCommitment')
          .use(prefix(apiServerURL))
          .send({
            inputCommitments: [erc20Commitments.transfer],
            receiver: {
              name: bob.name,
            },
          })
          .set('Accept', 'application/json')
          .set('Authorization', bob.token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res).to.have.nested.property('body.data.message');
            expect(res.body.data.message).to.be.equal('Burn successful');
            return done();
          });
      });
      /*
       * Step 15.
       * Transfer ERC-20 token
       */
      it(`Transfer ${erc20.mint} ERC-20 tokens to Alice`, function(done) {
        request
          .post('/transferFToken')
          .use(prefix(apiServerURL))
          .send({
            value: erc20.mint,
            receiver: {
              name: alice.name,
            },
          })
          .set('Accept', 'application/json')
          .set('Authorization', bob.token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res).to.have.nested.property('body.data.message');
            expect(res.body.data.message).to.be.equal('transfer Successful');
            return done();
          });
      });
    });
    context(`${alice.name} tasks: `, function() {
      /*
       * This acts as a delay, which is needed to ensure that the recipient will be able to receive transferred data through Whisper.
       */
      before(done => setTimeout(done, 10000));
      /*
       * Step 16.
       * Burn ERC-20 Token.
       */
      it(`Burn ${erc20.mint} ERC-20 tokens`, function(done) {
        request
          .post('/burnFToken')
          .use(prefix(apiServerURL))
          .send({
            value: erc20.mint,
          })
          .set('Accept', 'application/json')
          .set('Authorization', alice.token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res).to.have.nested.property('body.data.message');
            expect(res.body.data.message).to.be.equal('Burn Successful');
            return done();
          });
      });
    });
  });

  describe('*** Batch ERC 20 commitment transfer ***', function() {
    /*
     * Step 17.
     * Mint ERC-20 token,
     */
    it(`Mint ERC-20 tokens`, function(done) {
      request
        .post('/mintFToken')
        .use(prefix(apiServerURL))
        .send({
          value: erc20CommitmentBatchTransfer.mint,
        })
        .set('Accept', 'application/json')
        .set('Authorization', alice.token)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.nested.property('body.data.message');
          expect(res.body.data.message).to.be.equal('Mint Successful');
          return done();
        });
    });
    /*
     * Step 18.
     * Mint ERC-20 token commitment.
     */
    it(`Mint ERC-20 token commitment`, function(done) {
      request
        .post('/mintFTCommitment')
        .use(prefix(apiServerURL))
        .send({
          outputCommitments: [
            {
              value: erc20CommitmentBatchTransfer.value,
            },
          ],
        })
        .set('Accept', 'application/json')
        .set('Authorization', alice.token)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.nested.property('body.data.salt');
          expect(res).to.have.nested.property('body.data.commitment');
          expect(res).to.have.nested.property('body.data.commitmentIndex');

          erc20CommitmentBatchTransfer.salt = res.body.data.salt; // set Salt from response to calculate and verify commitment.
          expect(res.body.data.commitment).to.be.equal(erc20CommitmentBatchTransfer.commitment);
          expect(res.body.data.commitmentIndex).to.be.equal(
            erc20CommitmentBatchTransfer.commitmentIndex,
          );
          return done();
        });
    });
    /*
     * Step 19.
     * Transfer ERC-20 Commitment.
     */
    it(`ERC-20 Commitment Batch transfer ERC-20 Commitment to users`, function(done) {
      const {
        value,
        salt,
        commitment,
        commitmentIndex,
        transferData,
      } = erc20CommitmentBatchTransfer;
      request
        .post('/simpleFTCommitmentBatchTransfer')
        .use(prefix(apiServerURL))
        .send({
          inputCommitments: [
            {
              value,
              salt,
              commitment,
              commitmentIndex,
            },
          ],
          outputCommitments: transferData,
        })
        .set('Accept', 'application/json')
        .set('Authorization', alice.token)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.data.length).to.be.equal(2);
          erc20CommitmentBatchTransfer.transferData[0].salt = res.body.data[0].salt; // set Salt from response to calculate and verify commitment.

          expect(res.body.data[0].commitment).to.be.equal(
            erc20CommitmentBatchTransfer.transferData[0].commitment,
          );
          expect(res.body.data[0].commitmentIndex).to.be.equal(
            erc20CommitmentBatchTransfer.transferData[0].commitmentIndex,
          );
          return done();
        });
    });
  });
});
