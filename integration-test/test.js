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
            amount: erc20.mint,
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
          .send(erc20Commitments.mint[0])
          .set('Accept', 'application/json')
          .set('Authorization', alice.token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res).to.have.nested.property('body.data.S_A');
            expect(res).to.have.nested.property('body.data.ft_commitment');
            expect(res).to.have.nested.property('body.data.ft_commitment_index');

            erc20Commitments.mint[0].S_A = res.body.data.S_A; // set Salt from response to calculate and verify commitment.
            expect(res.body.data.ft_commitment).to.be.equal(erc20Commitments.mint[0].commitment);
            expect(res.body.data.ft_commitment_index).to.be.equal(
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
          .send(erc20Commitments.mint[1])
          .set('Accept', 'application/json')
          .set('Authorization', alice.token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res).to.have.nested.property('body.data.S_A');
            expect(res).to.have.nested.property('body.data.ft_commitment');
            expect(res).to.have.nested.property('body.data.ft_commitment_index');

            erc20Commitments.mint[1].S_A = res.body.data.S_A; // set Salt from response to calculate and verify commitment.

            expect(res.body.data.ft_commitment).to.be.equal(erc20Commitments.mint[1].commitment);
            expect(res.body.data.ft_commitment_index).to.be.equal(
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
        const [C, z_C_index, z_C, S_C] = Object.values(erc20Commitments.mint[0]);
        const [D, z_D_index, z_D, S_D] = Object.values(erc20Commitments.mint[1]);
        const [E] = Object.values(erc20Commitments.transfer);
        const [F] = Object.values(erc20Commitments.change);
        request
          .post('/transferFTCommitment')
          .use(prefix(apiServerURL))
          .send({
            C,
            S_C,
            z_C,
            z_C_index,
            D,
            S_D,
            z_D,
            z_D_index,
            E,
            F,
            receiver_name: bob.name,
          })
          .set('Accept', 'application/json')
          .set('Authorization', alice.token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res).to.have.nested.property('body.data.S_E');
            expect(res).to.have.nested.property('body.data.S_F');
            expect(res).to.have.nested.property('body.data.z_E');
            expect(res).to.have.nested.property('body.data.z_E_index');
            expect(res).to.have.nested.property('body.data.z_F');
            expect(res).to.have.nested.property('body.data.z_F_index');

            erc20Commitments.transfer.S_E = res.body.data.S_E; // set Salt from response to calculate and verify commitment.
            erc20Commitments.change.S_F = res.body.data.S_F; // set Salt from response to calculate and verify commitment.
            console.log(res.body.data.z_E, erc20Commitments.transfer.commitment);
            expect(res.body.data.z_E).to.be.equal(erc20Commitments.transfer.commitment);
            expect(res.body.data.z_E_index).to.be.equal(erc20Commitments.transfer.commitmentIndex);
            expect(res.body.data.z_F).to.be.equal(erc20Commitments.change.commitment);
            expect(res.body.data.z_F_index).to.be.equal(erc20Commitments.change.commitmentIndex);
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
            A: erc20Commitments.change.value,
            S_A: erc20Commitments.change.S_F,
            z_A_index: erc20Commitments.change.commitmentIndex,
            z_A: erc20Commitments.change.commitment,
          })
          .set('Accept', 'application/json')
          .set('Authorization', alice.token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res).to.have.nested.property('body.data.z_C');
            expect(res).to.have.nested.property('body.data.z_C_index');
            expect(res.body.data.z_C).to.be.equal(erc20Commitments.change.commitment);
            expect(res.body.data.z_C_index).to.be.equal(3);
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
            A: erc20Commitments.transfer.value,
            S_A: erc20Commitments.transfer.S_E,
            z_A_index: erc20Commitments.transfer.commitmentIndex,
            z_A: erc20Commitments.transfer.commitment,
          })
          .set('Accept', 'application/json')
          .set('Authorization', bob.token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res).to.have.nested.property('body.data.z_C');
            expect(res).to.have.nested.property('body.data.z_C_index');
            expect(res.body.data.z_C).to.be.equal(erc20Commitments.transfer.commitment);
            expect(res.body.data.z_C_index).to.be.equal(2);
            return done();
          });
      });
      /*
       * Step 15.
       * Transfer ERC-20 token
       */
      it(`Transfer ${erc20.transfer} ERC-20 tokens to Alice`, function(done) {
        request
          .post('/transferFToken')
          .use(prefix(apiServerURL))
          .send({
            amount: erc20.transfer,
            receiver_name: alice.name,
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
            amount: erc20.mint,
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
          amount: erc20CommitmentBatchTransfer.mint,
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
          A: erc20CommitmentBatchTransfer.mintCommitmentValue,
        })
        .set('Accept', 'application/json')
        .set('Authorization', alice.token)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.nested.property('body.data.S_A');
          expect(res).to.have.nested.property('body.data.ft_commitment');
          expect(res).to.have.nested.property('body.data.ft_commitment_index');

          erc20CommitmentBatchTransfer.S_A = res.body.data.S_A; // set Salt from response to calculate and verify commitment.
          expect(res.body.data.ft_commitment).to.be.equal(erc20CommitmentBatchTransfer.commitment);
          expect(res.body.data.ft_commitment_index).to.be.equal(
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
        mintCommitmentValue: amount,
        S_A: salt,
        commitment,
        commitmentIndex,
        transferData,
      } = erc20CommitmentBatchTransfer;
      request
        .post('/simpleFTCommitmentBatchTransfer')
        .use(prefix(apiServerURL))
        .send({
          amount,
          salt,
          commitment,
          commitmentIndex,
          transferData,
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
