/* eslint-disable camelcase, func-names */

import { expect } from 'chai';
import request from 'superagent';
import prefix from 'superagent-prefix';
import config from 'config';
import testData from './testData';

const apiServerURL = config.get('apiServerURL');

// independent test data.
const { alice, bob, erc20, erc20Consolidation } = testData;

// dependent test data. which need to be configured.
let erc721;
let erc721Commitment;
let erc721Address;
let erc20Commitments;
let erc20Address;
let erc20CommitmentBatchTransfer;
let erc20ConsolidationCommitment;

describe('****** Integration Test ******\n', function() {
  before(async function() {
    await testData.configureDependentTestData();
    ({
      erc721,
      erc721Commitment,
      erc20Commitments,
      erc20CommitmentBatchTransfer,
      erc20ConsolidationCommitment,
    } = testData);
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
  describe('*** ERC-721 and ERC-721 Commitment ***', function() {
    before(function() {
      if (process.env.COMPLIANCE) {
        this.skip();
      }
    });
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
            expect(res).to.have.nested.property('body.data.tokenId');

            erc721.tokenId = res.body.data.tokenId;
            expect(res.body.data.message).to.be.equal('NFT Mint Successful');
            return done();
          });
      });
      /*
       * Step 4.
       * Mint ERC-721 token commitment.
       */
      it('Mint ERC-721 token commitment', async function() {
        // Get the erc721 address so that we can include it in the commitment hashes
        const erc721AddressResponse = await request
          .get('/getNFTokenContractAddress')
          .use(prefix(apiServerURL))
          .set('Authorization', alice.token);
        erc721Address = erc721AddressResponse.body.data.nftAddress;
        erc721Commitment.address = erc721Address;

        const { tokenUri, tokenId } = erc721Commitment;
        let res;
        try {
          res = await request
            .post('/mintNFTCommitment')
            .use(prefix(apiServerURL))
            .send({
              outputCommitments: [
                {
                  tokenUri,
                  tokenId,
                },
              ],
            })
            .set('Accept', 'application/json')
            .set('Authorization', alice.token);
        } catch (err) {
          throw new Error(err);
        }

        expect(res).to.have.nested.property('body.data.salt');
        expect(res).to.have.nested.property('body.data.commitment');
        expect(res).to.have.nested.property('body.data.commitmentIndex');

        erc721Commitment.salt = res.body.data.salt; // set Salt from response to calculate and verify commitment.

        expect(res.body.data.commitment).to.be.equal(erc721Commitment.mintCommitment);
        expect(res.body.data.commitmentIndex).to.be.equal(erc721Commitment.mintCommitmentIndex);
      });
      /*
       * Step 5.
       * Transfer ERC-721 Commitment.
       */
      it('Transfer ERC-721 Commitment to Bob', function(done) {
        const { tokenId, tokenUri, salt, mintCommitment, mintCommitmentIndex } = erc721Commitment;
        request
          .post('/transferNFTCommitment')
          .use(prefix(apiServerURL))
          .send({
            inputCommitments: [
              {
                tokenId,
                tokenUri,
                salt,
                commitment: mintCommitment,
                commitmentIndex: mintCommitmentIndex,
              },
            ],
            receiver: {
              name: bob.name,
            },
          })
          .set('Accept', 'application/json')
          .set('Authorization', alice.token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res).to.have.nested.property('body.data.salt');
            expect(res).to.have.nested.property('body.data.commitment');
            expect(res).to.have.nested.property('body.data.commitmentIndex');

            erc721Commitment.transferredSalt = res.body.data.salt; // set Salt from response to calculate and verify commitment.

            expect(res.body.data.commitment).to.be.equal(erc721Commitment.transferCommitment);
            expect(res.body.data.commitmentIndex).to.be.equal(
              erc721Commitment.transferCommitmentIndex,
            );
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
        const {
          tokenId,
          tokenUri,
          transferredSalt,
          transferCommitment,
          transferCommitmentIndex,
        } = erc721Commitment;
        request
          .post('/burnNFTCommitment')
          .use(prefix(apiServerURL))
          .send({
            inputCommitments: [
              {
                tokenId,
                tokenUri,
                salt: transferredSalt,
                commitment: transferCommitment,
                commitmentIndex: transferCommitmentIndex,
              },
            ],
            receiver: {
              name: bob.name,
            },
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
            tokenId: erc721.tokenId,
            tokenUri: erc721.tokenUri,
            receiver: {
              name: alice.name,
            },
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
            tokenId: erc721.tokenId,
            tokenUri: erc721.tokenUri,
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
    /*
     *  Mint ERC-20 helper token commitment, so that bob publickey is added to public-key-tree contract
     */
    before(done => {
      if (!process.env.COMPLIANCE) {
        return done();
      }
      return request
        .post('/mintFToken')
        .use(prefix(apiServerURL))
        .send({
          value: erc20.mint,
        })
        .set('Accept', 'application/json')
        .set('Authorization', bob.token)
        .end(err => {
          if (err) return done(err);
          return request
            .post('/mintFTCommitment')
            .use(prefix(apiServerURL))
            .send({ outputCommitments: [erc20Commitments.mint[0]] })
            .set('Accept', 'application/json')
            .set('Authorization', bob.token)
            .end(_err => {
              if (_err) return done(_err);
              return done();
            });
        });
    });
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
        erc20Commitments.erc20Address = erc20Address;
        erc20CommitmentBatchTransfer.erc20Address = erc20Address;

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
          .send({ outputCommitments: [erc20Commitments.mint[0]] })
          .set('Accept', 'application/json')
          .set('Authorization', alice.token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res).to.have.nested.property('body.data.salt');
            expect(res).to.have.nested.property('body.data.commitment');
            expect(res).to.have.nested.property('body.data.commitmentIndex');

            erc20Commitments.mint[0].salt = res.body.data.salt; // set Salt from response to calculate and verify commitment.
            erc20Commitments.mint[0].address = erc20Address;
            erc20Commitments.mint[0].commitmentIndex = res.body.data.commitmentIndex;

            expect(res.body.data.commitment).to.be.equal(erc20Commitments.mint[0].commitment);
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
            erc20Commitments.mint[1].address = erc20Address;
            erc20Commitments.mint[1].commitmentIndex = res.body.data.commitmentIndex;

            expect(res.body.data.commitment).to.be.equal(erc20Commitments.mint[1].commitment);

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
            erc20Commitments.transfer.address = erc20Address;
            erc20Commitments.change.salt = outputCommitments[1].salt; // set Salt from response to calculate and verify commitment.
            erc20Commitments.change.address = erc20Address;
            erc20Commitments.change.commitmentIndex = outputCommitments[1].commitmentIndex;

            expect(outputCommitments[0].commitment).to.be.equal(
              erc20Commitments.transfer.commitment,
            );
            expect(outputCommitments[0].commitmentIndex).to.be.equal(
              erc20Commitments.mint[1].commitmentIndex + 1,
            );
            expect(outputCommitments[1].commitment).to.be.equal(erc20Commitments.change.commitment);
            expect(outputCommitments[1].commitmentIndex).to.be.equal(
              erc20Commitments.mint[1].commitmentIndex + 2,
            );

            erc20Commitments.transfer.commitmentIndex = outputCommitments[0].commitmentIndex;
            erc20Commitments.change.commitmentIndex = outputCommitments[1].commitmentIndex;
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

  describe('*** ERC-20 and ERC-20  Consolidation Commitment ***', function() {
    context(`${alice.name} tasks: `, function() {
      before(done => setTimeout(done, 10000));
      /*
       * Step 20.
       * Mint ERC-20 token,
       */
      it(`Mint ${erc20Consolidation.mint} ERC-20 tokens`, async function() {
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
              value: erc20Consolidation.mint,
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
       * Step 21.
       * Mint ERC-20 token commitment.
       */
      it(`Mint ${
        erc20Consolidation.toBeMintedAsCommitment[0]
      } ERC-20 token commitment`, function(done) {
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
       * Step 22.
       * Mint ERC-20 token commitment.
       */
      it(`Mint ${
        erc20Consolidation.toBeMintedAsCommitment[1]
      } ERC-20 token commitment`, function(done) {
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
       * Step 23.
       * Mint ERC-20 token commitment.
       */
      it(`Mint ${
        erc20Consolidation.toBeMintedAsCommitment[2]
      } ERC-20 token commitment`, function(done) {
        request
          .post('/mintFTCommitment')
          .use(prefix(apiServerURL))
          .send({ outputCommitments: [erc20ConsolidationCommitment.mint[2]] })
          .set('Accept', 'application/json')
          .set('Authorization', alice.token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res).to.have.nested.property('body.data.salt');
            expect(res).to.have.nested.property('body.data.commitment');
            expect(res).to.have.nested.property('body.data.commitmentIndex');

            erc20ConsolidationCommitment.mint[2].salt = res.body.data.salt; // set Salt from response to calculate and verify commitment.
            erc20ConsolidationCommitment.mint[2].address = erc20Address;
            expect(res.body.data.commitment).to.be.equal(
              erc20ConsolidationCommitment.mint[2].commitment,
            );
            expect(res.body.data.commitmentIndex).to.be.equal(
              erc20ConsolidationCommitment.mint[2].commitmentIndex,
            );
            return done();
          });
      });
      /*
       * Step 24.
       * Mint ERC-20 token commitment.
       */
      it(`Mint ${
        erc20Consolidation.toBeMintedAsCommitment[3]
      } ERC-20 token commitment`, function(done) {
        request
          .post('/mintFTCommitment')
          .use(prefix(apiServerURL))
          .send({ outputCommitments: [erc20ConsolidationCommitment.mint[3]] })
          .set('Accept', 'application/json')
          .set('Authorization', alice.token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res).to.have.nested.property('body.data.salt');
            expect(res).to.have.nested.property('body.data.commitment');
            expect(res).to.have.nested.property('body.data.commitmentIndex');

            erc20ConsolidationCommitment.mint[3].salt = res.body.data.salt; // set Salt from response to calculate and verify commitment.
            erc20ConsolidationCommitment.mint[3].address = erc20Address;
            expect(res.body.data.commitment).to.be.equal(
              erc20ConsolidationCommitment.mint[3].commitment,
            );
            expect(res.body.data.commitmentIndex).to.be.equal(
              erc20ConsolidationCommitment.mint[3].commitmentIndex,
            );
            return done();
          });
      });
      /*
       * Step 25.
       * Mint ERC-20 token commitment.
       */
      it(`Mint ${
        erc20Consolidation.toBeMintedAsCommitment[4]
      } ERC-20 token commitment`, function(done) {
        request
          .post('/mintFTCommitment')
          .use(prefix(apiServerURL))
          .send({ outputCommitments: [erc20ConsolidationCommitment.mint[4]] })
          .set('Accept', 'application/json')
          .set('Authorization', alice.token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res).to.have.nested.property('body.data.salt');
            expect(res).to.have.nested.property('body.data.commitment');
            expect(res).to.have.nested.property('body.data.commitmentIndex');

            erc20ConsolidationCommitment.mint[4].salt = res.body.data.salt; // set Salt from response to calculate and verify commitment.
            erc20ConsolidationCommitment.mint[4].address = erc20Address;
            expect(res.body.data.commitment).to.be.equal(
              erc20ConsolidationCommitment.mint[4].commitment,
            );
            expect(res.body.data.commitmentIndex).to.be.equal(
              erc20ConsolidationCommitment.mint[4].commitmentIndex,
            );
            return done();
          });
      });
      /*
       * Step 26.
       * Mint ERC-20 token commitment.
       */
      it(`Mint ${
        erc20Consolidation.toBeMintedAsCommitment[5]
      } ERC-20 token commitment`, function(done) {
        request
          .post('/mintFTCommitment')
          .use(prefix(apiServerURL))
          .send({ outputCommitments: [erc20ConsolidationCommitment.mint[5]] })
          .set('Accept', 'application/json')
          .set('Authorization', alice.token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res).to.have.nested.property('body.data.salt');
            expect(res).to.have.nested.property('body.data.commitment');
            expect(res).to.have.nested.property('body.data.commitmentIndex');

            erc20ConsolidationCommitment.mint[5].salt = res.body.data.salt; // set Salt from response to calculate and verify commitment.
            erc20ConsolidationCommitment.mint[5].address = erc20Address;
            expect(res.body.data.commitment).to.be.equal(
              erc20ConsolidationCommitment.mint[5].commitment,
            );
            expect(res.body.data.commitmentIndex).to.be.equal(
              erc20ConsolidationCommitment.mint[5].commitmentIndex,
            );
            return done();
          });
      });
      /*
       * Step 27.
       * Mint ERC-20 token commitment.
       */
      it(`Mint ${
        erc20Consolidation.toBeMintedAsCommitment[6]
      } ERC-20 token commitment`, function(done) {
        request
          .post('/mintFTCommitment')
          .use(prefix(apiServerURL))
          .send({ outputCommitments: [erc20ConsolidationCommitment.mint[6]] })
          .set('Accept', 'application/json')
          .set('Authorization', alice.token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res).to.have.nested.property('body.data.salt');
            expect(res).to.have.nested.property('body.data.commitment');
            expect(res).to.have.nested.property('body.data.commitmentIndex');

            erc20ConsolidationCommitment.mint[6].salt = res.body.data.salt; // set Salt from response to calculate and verify commitment.
            erc20ConsolidationCommitment.mint[6].address = erc20Address;
            expect(res.body.data.commitment).to.be.equal(
              erc20ConsolidationCommitment.mint[6].commitment,
            );
            expect(res.body.data.commitmentIndex).to.be.equal(
              erc20ConsolidationCommitment.mint[6].commitmentIndex,
            );
            return done();
          });
      });
      /*
       * Step 28.
       * Mint ERC-20 token commitment.
       */
      it(`Mint ${
        erc20Consolidation.toBeMintedAsCommitment[7]
      } ERC-20 token commitment`, function(done) {
        request
          .post('/mintFTCommitment')
          .use(prefix(apiServerURL))
          .send({ outputCommitments: [erc20ConsolidationCommitment.mint[7]] })
          .set('Accept', 'application/json')
          .set('Authorization', alice.token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res).to.have.nested.property('body.data.salt');
            expect(res).to.have.nested.property('body.data.commitment');
            expect(res).to.have.nested.property('body.data.commitmentIndex');

            erc20ConsolidationCommitment.mint[7].salt = res.body.data.salt; // set Salt from response to calculate and verify commitment.
            erc20ConsolidationCommitment.mint[7].address = erc20Address;
            expect(res.body.data.commitment).to.be.equal(
              erc20ConsolidationCommitment.mint[7].commitment,
            );
            expect(res.body.data.commitmentIndex).to.be.equal(
              erc20ConsolidationCommitment.mint[7].commitmentIndex,
            );
            return done();
          });
      });
      /*
       * Step 29.
       * Mint ERC-20 token commitment.
       */
      it(`Mint ${
        erc20Consolidation.toBeMintedAsCommitment[8]
      } ERC-20 token commitment`, function(done) {
        request
          .post('/mintFTCommitment')
          .use(prefix(apiServerURL))
          .send({ outputCommitments: [erc20ConsolidationCommitment.mint[8]] })
          .set('Accept', 'application/json')
          .set('Authorization', alice.token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res).to.have.nested.property('body.data.salt');
            expect(res).to.have.nested.property('body.data.commitment');
            expect(res).to.have.nested.property('body.data.commitmentIndex');

            erc20ConsolidationCommitment.mint[8].salt = res.body.data.salt; // set Salt from response to calculate and verify commitment.
            erc20ConsolidationCommitment.mint[8].address = erc20Address;
            expect(res.body.data.commitment).to.be.equal(
              erc20ConsolidationCommitment.mint[8].commitment,
            );
            expect(res.body.data.commitmentIndex).to.be.equal(
              erc20ConsolidationCommitment.mint[8].commitmentIndex,
            );
            return done();
          });
      });
      /*
       * Step 30.
       * Mint ERC-20 token commitment.
       */
      it(`Mint ${
        erc20Consolidation.toBeMintedAsCommitment[9]
      } ERC-20 token commitment`, function(done) {
        request
          .post('/mintFTCommitment')
          .use(prefix(apiServerURL))
          .send({ outputCommitments: [erc20ConsolidationCommitment.mint[9]] })
          .set('Accept', 'application/json')
          .set('Authorization', alice.token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res).to.have.nested.property('body.data.salt');
            expect(res).to.have.nested.property('body.data.commitment');
            expect(res).to.have.nested.property('body.data.commitmentIndex');

            erc20ConsolidationCommitment.mint[9].salt = res.body.data.salt; // set Salt from response to calculate and verify commitment.
            erc20ConsolidationCommitment.mint[9].address = erc20Address;
            expect(res.body.data.commitment).to.be.equal(
              erc20ConsolidationCommitment.mint[9].commitment,
            );
            expect(res.body.data.commitmentIndex).to.be.equal(
              erc20ConsolidationCommitment.mint[9].commitmentIndex,
            );
            return done();
          });
      });
      /*
       * Step 31.
       * Mint ERC-20 token commitment.
       */
      it(`Mint ${
        erc20Consolidation.toBeMintedAsCommitment[10]
      } ERC-20 token commitment`, function(done) {
        request
          .post('/mintFTCommitment')
          .use(prefix(apiServerURL))
          .send({ outputCommitments: [erc20ConsolidationCommitment.mint[10]] })
          .set('Accept', 'application/json')
          .set('Authorization', alice.token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res).to.have.nested.property('body.data.salt');
            expect(res).to.have.nested.property('body.data.commitment');
            expect(res).to.have.nested.property('body.data.commitmentIndex');

            erc20ConsolidationCommitment.mint[10].salt = res.body.data.salt; // set Salt from response to calculate and verify commitment.
            erc20ConsolidationCommitment.mint[10].address = erc20Address;
            expect(res.body.data.commitment).to.be.equal(
              erc20ConsolidationCommitment.mint[10].commitment,
            );
            expect(res.body.data.commitmentIndex).to.be.equal(
              erc20ConsolidationCommitment.mint[10].commitmentIndex,
            );
            return done();
          });
      });
      /*
       * Step 32.
       * Mint ERC-20 token commitment.
       */
      it(`Mint ${
        erc20Consolidation.toBeMintedAsCommitment[11]
      } ERC-20 token commitment`, function(done) {
        request
          .post('/mintFTCommitment')
          .use(prefix(apiServerURL))
          .send({ outputCommitments: [erc20ConsolidationCommitment.mint[11]] })
          .set('Accept', 'application/json')
          .set('Authorization', alice.token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res).to.have.nested.property('body.data.salt');
            expect(res).to.have.nested.property('body.data.commitment');
            expect(res).to.have.nested.property('body.data.commitmentIndex');

            erc20ConsolidationCommitment.mint[11].salt = res.body.data.salt; // set Salt from response to calculate and verify commitment.
            erc20ConsolidationCommitment.mint[11].address = erc20Address;
            expect(res.body.data.commitment).to.be.equal(
              erc20ConsolidationCommitment.mint[11].commitment,
            );
            expect(res.body.data.commitmentIndex).to.be.equal(
              erc20ConsolidationCommitment.mint[11].commitmentIndex,
            );
            return done();
          });
      });
      /*
       * Step 33.
       * Mint ERC-20 token commitment.
       */
      it(`Mint ${
        erc20Consolidation.toBeMintedAsCommitment[12]
      } ERC-20 token commitment`, function(done) {
        request
          .post('/mintFTCommitment')
          .use(prefix(apiServerURL))
          .send({ outputCommitments: [erc20ConsolidationCommitment.mint[12]] })
          .set('Accept', 'application/json')
          .set('Authorization', alice.token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res).to.have.nested.property('body.data.salt');
            expect(res).to.have.nested.property('body.data.commitment');
            expect(res).to.have.nested.property('body.data.commitmentIndex');

            erc20ConsolidationCommitment.mint[12].salt = res.body.data.salt; // set Salt from response to calculate and verify commitment.
            erc20ConsolidationCommitment.mint[12].address = erc20Address;
            expect(res.body.data.commitment).to.be.equal(
              erc20ConsolidationCommitment.mint[12].commitment,
            );
            expect(res.body.data.commitmentIndex).to.be.equal(
              erc20ConsolidationCommitment.mint[12].commitmentIndex,
            );
            return done();
          });
      });
      /*
       * Step 34.
       * Mint ERC-20 token commitment.
       */
      it(`Mint ${
        erc20Consolidation.toBeMintedAsCommitment[13]
      } ERC-20 token commitment`, function(done) {
        request
          .post('/mintFTCommitment')
          .use(prefix(apiServerURL))
          .send({ outputCommitments: [erc20ConsolidationCommitment.mint[13]] })
          .set('Accept', 'application/json')
          .set('Authorization', alice.token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res).to.have.nested.property('body.data.salt');
            expect(res).to.have.nested.property('body.data.commitment');
            expect(res).to.have.nested.property('body.data.commitmentIndex');

            erc20ConsolidationCommitment.mint[13].salt = res.body.data.salt; // set Salt from response to calculate and verify commitment.
            erc20ConsolidationCommitment.mint[13].address = erc20Address;
            expect(res.body.data.commitment).to.be.equal(
              erc20ConsolidationCommitment.mint[13].commitment,
            );
            expect(res.body.data.commitmentIndex).to.be.equal(
              erc20ConsolidationCommitment.mint[13].commitmentIndex,
            );
            return done();
          });
      });
      /*
       * Step 35.
       * Mint ERC-20 token commitment.
       */
      it(`Mint ${
        erc20Consolidation.toBeMintedAsCommitment[14]
      } ERC-20 token commitment`, function(done) {
        request
          .post('/mintFTCommitment')
          .use(prefix(apiServerURL))
          .send({ outputCommitments: [erc20ConsolidationCommitment.mint[14]] })
          .set('Accept', 'application/json')
          .set('Authorization', alice.token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res).to.have.nested.property('body.data.salt');
            expect(res).to.have.nested.property('body.data.commitment');
            expect(res).to.have.nested.property('body.data.commitmentIndex');

            erc20ConsolidationCommitment.mint[14].salt = res.body.data.salt; // set Salt from response to calculate and verify commitment.
            erc20ConsolidationCommitment.mint[14].address = erc20Address;
            expect(res.body.data.commitment).to.be.equal(
              erc20ConsolidationCommitment.mint[14].commitment,
            );
            expect(res.body.data.commitmentIndex).to.be.equal(
              erc20ConsolidationCommitment.mint[14].commitmentIndex,
            );
            return done();
          });
      });
      /*
       * Step 36.
       * Mint ERC-20 token commitment.
       */
      it(`Mint ${
        erc20Consolidation.toBeMintedAsCommitment[15]
      } ERC-20 token commitment`, function(done) {
        request
          .post('/mintFTCommitment')
          .use(prefix(apiServerURL))
          .send({ outputCommitments: [erc20ConsolidationCommitment.mint[15]] })
          .set('Accept', 'application/json')
          .set('Authorization', alice.token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res).to.have.nested.property('body.data.salt');
            expect(res).to.have.nested.property('body.data.commitment');
            expect(res).to.have.nested.property('body.data.commitmentIndex');

            erc20ConsolidationCommitment.mint[15].salt = res.body.data.salt; // set Salt from response to calculate and verify commitment.
            erc20ConsolidationCommitment.mint[15].address = erc20Address;
            expect(res.body.data.commitment).to.be.equal(
              erc20ConsolidationCommitment.mint[15].commitment,
            );
            expect(res.body.data.commitmentIndex).to.be.equal(
              erc20ConsolidationCommitment.mint[15].commitmentIndex,
            );
            return done();
          });
      });
      /*
       * Step 37.
       * Mint ERC-20 token commitment.
       */
      it(`Mint ${
        erc20Consolidation.toBeMintedAsCommitment[16]
      } ERC-20 token commitment`, function(done) {
        request
          .post('/mintFTCommitment')
          .use(prefix(apiServerURL))
          .send({ outputCommitments: [erc20ConsolidationCommitment.mint[16]] })
          .set('Accept', 'application/json')
          .set('Authorization', alice.token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res).to.have.nested.property('body.data.salt');
            expect(res).to.have.nested.property('body.data.commitment');
            expect(res).to.have.nested.property('body.data.commitmentIndex');

            erc20ConsolidationCommitment.mint[16].salt = res.body.data.salt; // set Salt from response to calculate and verify commitment.
            erc20ConsolidationCommitment.mint[16].address = erc20Address;
            expect(res.body.data.commitment).to.be.equal(
              erc20ConsolidationCommitment.mint[16].commitment,
            );
            expect(res.body.data.commitmentIndex).to.be.equal(
              erc20ConsolidationCommitment.mint[16].commitmentIndex,
            );
            return done();
          });
      });
      /*
       * Step 38.
       * Mint ERC-20 token commitment.
       */
      it(`Mint ${
        erc20Consolidation.toBeMintedAsCommitment[17]
      } ERC-20 token commitment`, function(done) {
        request
          .post('/mintFTCommitment')
          .use(prefix(apiServerURL))
          .send({ outputCommitments: [erc20ConsolidationCommitment.mint[17]] })
          .set('Accept', 'application/json')
          .set('Authorization', alice.token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res).to.have.nested.property('body.data.salt');
            expect(res).to.have.nested.property('body.data.commitment');
            expect(res).to.have.nested.property('body.data.commitmentIndex');

            erc20ConsolidationCommitment.mint[17].salt = res.body.data.salt; // set Salt from response to calculate and verify commitment.
            erc20ConsolidationCommitment.mint[17].address = erc20Address;
            expect(res.body.data.commitment).to.be.equal(
              erc20ConsolidationCommitment.mint[17].commitment,
            );
            expect(res.body.data.commitmentIndex).to.be.equal(
              erc20ConsolidationCommitment.mint[17].commitmentIndex,
            );
            return done();
          });
      });
      /*
       * Step 39.
       * Mint ERC-20 token commitment.
       */
      it(`Mint ${
        erc20Consolidation.toBeMintedAsCommitment[18]
      } ERC-20 token commitment`, function(done) {
        request
          .post('/mintFTCommitment')
          .use(prefix(apiServerURL))
          .send({ outputCommitments: [erc20ConsolidationCommitment.mint[18]] })
          .set('Accept', 'application/json')
          .set('Authorization', alice.token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res).to.have.nested.property('body.data.salt');
            expect(res).to.have.nested.property('body.data.commitment');
            expect(res).to.have.nested.property('body.data.commitmentIndex');

            erc20ConsolidationCommitment.mint[18].salt = res.body.data.salt; // set Salt from response to calculate and verify commitment.
            erc20ConsolidationCommitment.mint[18].address = erc20Address;
            expect(res.body.data.commitment).to.be.equal(
              erc20ConsolidationCommitment.mint[18].commitment,
            );
            expect(res.body.data.commitmentIndex).to.be.equal(
              erc20ConsolidationCommitment.mint[18].commitmentIndex,
            );
            return done();
          });
      });
      /*
       * Step 40.
       * Mint ERC-20 token commitment.
       */
      it(`Mint ${
        erc20Consolidation.toBeMintedAsCommitment[19]
      } ERC-20 token commitment`, function(done) {
        request
          .post('/mintFTCommitment')
          .use(prefix(apiServerURL))
          .send({ outputCommitments: [erc20ConsolidationCommitment.mint[19]] })
          .set('Accept', 'application/json')
          .set('Authorization', alice.token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res).to.have.nested.property('body.data.salt');
            expect(res).to.have.nested.property('body.data.commitment');
            expect(res).to.have.nested.property('body.data.commitmentIndex');

            erc20ConsolidationCommitment.mint[19].salt = res.body.data.salt; // set Salt from response to calculate and verify commitment.
            erc20ConsolidationCommitment.mint[19].address = erc20Address;
            expect(res.body.data.commitment).to.be.equal(
              erc20ConsolidationCommitment.mint[19].commitment,
            );
            expect(res.body.data.commitmentIndex).to.be.equal(
              erc20ConsolidationCommitment.mint[19].commitmentIndex,
            );
            return done();
          });
      });
      /*
       * Step 23.
       * Transfer ERC-20 Commitment.
       */
      it(`Transfer ${erc20Consolidation.transfer} ERC-20 Commitment to Bob`, function(done) {
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

            const outputCommitment = res.body.data;
            erc20ConsolidationCommitment.transfer.salt = outputCommitment.salt; // set Salt from response to calculate and verify commitment.
            erc20ConsolidationCommitment.transfer.address = erc20Address;
            expect(res.body.data.commitment).to.be.equal(
              erc20ConsolidationCommitment.transferData.commitment,
            );
            expect(res.body.data.commitmentIndex).to.be.equal(
              erc20ConsolidationCommitment.transferData.commitmentIndex,
            );
            return done();
          });
      });
    });
  });

  describe('*** Batch ERC 20 commitment transfer ***', function() {
    before(function() {
      if (process.env.COMPLIANCE) {
        this.skip();
      }
    });
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
          erc20CommitmentBatchTransfer.address = erc20Address;
          erc20CommitmentBatchTransfer.commitmentIndex = res.body.data.commitmentIndex;

          expect(res.body.data.commitment).to.be.equal(erc20CommitmentBatchTransfer.commitment);
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
          erc20CommitmentBatchTransfer.transferData[0].address = erc20Address;

          expect(res.body.data[0].commitment).to.be.equal(
            erc20CommitmentBatchTransfer.transferData[0].commitment,
          );
          expect(res.body.data[0].commitmentIndex).to.be.equal(
            erc20CommitmentBatchTransfer.commitmentIndex + 1,
          );
          return done();
        });
    });
  });
});
