/* eslint-disable camelcase, func-names */

import { expect } from 'chai';
import request from 'superagent';
import prefix from 'superagent-prefix';
import config from 'config';
import { GN } from 'general-number';

import testData from './testData';

const apiServerURL = config.get('apiServerURL');

// independent test data.
const { alice, bob, erc20, erc721 } = testData;

// dependent test data. which need to be configured.
let erc721CommitmentTransfer;
let erc20CommitmentTransfer;
let erc20CommitmentBatchTransfer;
let erc20CommitmentConsolidationTransfer;

describe('****** Integration Test ******\n', function() {
  before(async function() {
    await testData.configureDependentTestData();
    ({
      erc721CommitmentTransfer,
      erc20CommitmentTransfer,
      erc20CommitmentBatchTransfer,
      erc20CommitmentConsolidationTransfer,
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
    before(async function() {
      if (process.env.COMPLIANCE) {
        this.skip();
      } else {
        // Get the erc721 address so that we can use it to calculate the commitment hashes
        erc721.contractAddress = new GN(
          (await request
            .get('/getNFTokenContractAddress')
            .use(prefix(apiServerURL))
            .set('Authorization', alice.token)).body.data.nftAddress,
        );
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
        const { tokenUri, tokenId } = erc721CommitmentTransfer;
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

        // set Salt from response to calculate and verify commitment.
        erc721CommitmentTransfer.salt = res.body.data.salt;
        erc721CommitmentTransfer.mintCommitmentIndex = res.body.data.commitmentIndex;

        expect(res.body.data.commitment).to.be.equal(erc721CommitmentTransfer.mintCommitment);
      });

      /*
       * Step 5.
       * Transfer ERC-721 Commitment.
       */
      it('Transfer ERC-721 Commitment to Bob', function(done) {
        const {
          tokenId,
          tokenUri,
          salt,
          mintCommitment,
          mintCommitmentIndex,
          transferCommitmentIndex,
        } = erc721CommitmentTransfer;
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

            // set Salt from response to calculate and verify commitment.
            erc721CommitmentTransfer.transferredSalt = res.body.data.salt;

            expect(res.body.data.commitment).to.be.equal(
              erc721CommitmentTransfer.transferCommitment,
            );
            expect(res.body.data.commitmentIndex).to.be.equal(transferCommitmentIndex);
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
        } = erc721CommitmentTransfer;
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
    before(async function() {
      // Get the erc20 address so that we calculate the commitment hashes
      erc20.contractAddress = new GN(
        (await request
          .get('/getFTokenContractAddress')
          .use(prefix(apiServerURL))
          .set('Authorization', alice.token)).body.data.ftAddress,
      );

      if (!process.env.COMPLIANCE) {
        return;
      }
      await request
        .post('/mintFToken')
        .use(prefix(apiServerURL))
        .send({
          value: erc20.mint,
        })
        .set('Accept', 'application/json')
        .set('Authorization', bob.token);

      await request
        .post('/mintFTCommitment')
        .use(prefix(apiServerURL))
        .send({ outputCommitments: [erc20CommitmentTransfer.mintCommitments[0]] })
        .set('Accept', 'application/json')
        .set('Authorization', bob.token);
    });
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
      it(`Mint ${erc20.transfer.mintCommitments[0]} ERC-20 token commitment`, function(done) {
        const commitment = erc20CommitmentTransfer.mintCommitments[0];
        request
          .post('/mintFTCommitment')
          .use(prefix(apiServerURL))
          .send({ outputCommitments: [commitment] })
          .set('Accept', 'application/json')
          .set('Authorization', alice.token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res).to.have.nested.property('body.data.salt');
            expect(res).to.have.nested.property('body.data.commitment');
            expect(res).to.have.nested.property('body.data.commitmentIndex');

            // set Salt from response to calculate and verify commitment.
            commitment.salt = res.body.data.salt;
            commitment.commitmentIndex = res.body.data.commitmentIndex;

            expect(res.body.data.commitment).to.be.equal(commitment.commitment);
            return done();
          });
      });

      /*
       * Step 11.
       * Mint ERC-20 token commitment.
       */
      it(`Mint ${erc20.transfer.mintCommitments[1]} ERC-20 token commitment`, function(done) {
        const commitment = erc20CommitmentTransfer.mintCommitments[1];
        request
          .post('/mintFTCommitment')
          .use(prefix(apiServerURL))
          .send({ outputCommitments: [commitment] })
          .set('Accept', 'application/json')
          .set('Authorization', alice.token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res).to.have.nested.property('body.data.salt');
            expect(res).to.have.nested.property('body.data.commitment');
            expect(res).to.have.nested.property('body.data.commitmentIndex');

            // set Salt from response to calculate and verify commitment.
            commitment.salt = res.body.data.salt;
            commitment.commitmentIndex = res.body.data.commitmentIndex;

            expect(res.body.data.commitment).to.be.equal(commitment.commitment);
            return done();
          });
      });

      /*
       * Step 12.
       * Transfer ERC-20 Commitment.
       */
      it(`Transfer ${erc20.transfer.transferCommitment} ERC-20 Commitment to Bob`, function(done) {
        const { mintCommitments, transferCommitment, changeCommitment } = erc20CommitmentTransfer;
        request
          .post('/transferFTCommitment')
          .use(prefix(apiServerURL))
          .send({
            inputCommitments: mintCommitments,
            outputCommitments: [transferCommitment, changeCommitment],
            receiver: { name: bob.name },
          })
          .set('Accept', 'application/json')
          .set('Authorization', alice.token)
          .end((err, res) => {
            if (err) return done(err);

            const outputCommitments = res.body.data;

            // set Salt from response to calculate and verify commitment.
            transferCommitment.salt = outputCommitments[0].salt;

            // set Salt from response to calculate and verify commitment.
            changeCommitment.salt = outputCommitments[1].salt;
            expect(outputCommitments[0].commitment).to.be.equal(transferCommitment.commitment);
            expect(outputCommitments[1].commitment).to.be.equal(changeCommitment.commitment);

            transferCommitment.commitmentIndex = outputCommitments[0].commitmentIndex;
            changeCommitment.commitmentIndex = outputCommitments[1].commitmentIndex;
            expect(transferCommitment.commitmentIndex).to.be.equal(
              mintCommitments[1].commitmentIndex + 1,
            );
            expect(changeCommitment.commitmentIndex).to.be.equal(
              mintCommitments[1].commitmentIndex + 2,
            );
            return done();
          });
      });

      /*
       * Step 13.
       * Burn ERC-20 Commitment.
       */
      it(`Burn ${erc20.transfer.changeCommitment} ERC-20 Commitment`, function(done) {
        if (!erc20.transfer.changeCommitment) this.skip();
        request
          .post('/burnFTCommitment')
          .use(prefix(apiServerURL))
          .send({
            inputCommitments: [erc20CommitmentTransfer.changeCommitment],
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
      it(`Burn ${erc20.transfer.transferCommitment} ERC-20 Commitment`, function(done) {
        request
          .post('/burnFTCommitment')
          .use(prefix(apiServerURL))
          .send({
            inputCommitments: [erc20CommitmentTransfer.transferCommitment],
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
      it(`Transfer ${erc20.transfer.changeCommitment +
        erc20.transfer.transferCommitment} ERC-20 tokens to Alice`, function(done) {
        request
          .post('/transferFToken')
          .use(prefix(apiServerURL))
          .send({
            value: erc20.transfer.changeCommitment + erc20.transfer.transferCommitment,
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
      it(`Burn 2 ERC-20 tokens`, function(done) {
        request
          .post('/burnFToken')
          .use(prefix(apiServerURL))
          .send({
            value: 2,
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
    before(function() {
      if (process.env.COMPLIANCE) {
        this.skip();
      }
    });
    context(`${alice.name} tasks: `, function() {
      /*
       * Step 17.
       * Mint ERC-20 token commitment.
       */
      it(`Mint ${erc20.batchTransfer.mintCommitment} ERC-20 token commitment`, function(done) {
        const { mintCommitment } = erc20CommitmentBatchTransfer;
        request
          .post('/mintFTCommitment')
          .use(prefix(apiServerURL))
          .send({
            outputCommitments: [mintCommitment],
          })
          .set('Accept', 'application/json')
          .set('Authorization', alice.token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res).to.have.nested.property('body.data.salt');
            expect(res).to.have.nested.property('body.data.commitment');
            expect(res).to.have.nested.property('body.data.commitmentIndex');

            // set Salt from response to calculate and verify commitment.
            mintCommitment.salt = res.body.data.salt;
            mintCommitment.commitmentIndex = res.body.data.commitmentIndex;

            expect(res.body.data.commitment).to.be.equal(mintCommitment.commitment);
            return done();
          });
      });

      /*
       * Step 18.
       * Batch Transfer ERC-20 Commitment.
       */
      it(`Batch transfer ERC-20 Commitment to users`, function(done) {
        const { mintCommitment, transferCommitments } = erc20CommitmentBatchTransfer;
        request
          .post('/simpleFTCommitmentBatchTransfer')
          .use(prefix(apiServerURL))
          .send({
            inputCommitments: [mintCommitment],
            outputCommitments: transferCommitments,
          })
          .set('Accept', 'application/json')
          .set('Authorization', alice.token)
          .end((err, res) => {
            if (err) return done(err);
            expect(res.body.data.length).to.be.equal(
              erc20.batchTransfer.transferCommitments.length,
            );

            for (const indx in transferCommitments) {
              if (res.body.data[indx]) {
                const { salt, commitmentIndex, commitment } = res.body.data[indx];
                transferCommitments[indx].salt = salt;
                expect(commitment).to.be.equal(transferCommitments[indx].commitment);
                transferCommitments[indx].commitmentIndex = commitmentIndex;
              }
            }

            return done();
          });
      });
    });
  });

  describe('*** Consolidation ERC-20 commitment transfer ***', function() {
    before(function(done) {
      if (!process.env.MIMC) {
        this.skip();
      }
      setTimeout(done, 20000);
    });
    context(`${bob.name} tasks: `, function() {
      /*
       * Step 19.
       * Consolidation Transfer ERC-20 Commitment.
       */
      it(`Consolidation Transfer of ${erc20.batchTransfer.mintCommitment} ERC-20 Commitment to Alice`, function(done) {
        const { mintCommitments, transferCommitment } = erc20CommitmentConsolidationTransfer;
        request
          .post('/consolidationTransfer')
          .use(prefix(apiServerURL))
          .send({
            inputCommitments: mintCommitments,
            outputCommitment: transferCommitment,
            receiver: { name: alice.name },
          })
          .set('Accept', 'application/json')
          .set('Authorization', bob.token)
          .end((err, res) => {
            if (err) return done(err);

            // set Salt from response to calculate and verify commitment.
            transferCommitment.salt = res.body.data.salt;
            expect(res.body.data.commitment).to.be.equal(transferCommitment.commitment);
            expect(res.body.data.commitmentIndex).to.be.equal(
              mintCommitments[mintCommitments.length - 1].commitmentIndex + 1,
            );
            return done();
          });
      });
    });
  });
});
