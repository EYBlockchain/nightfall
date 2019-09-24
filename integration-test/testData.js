import config from 'config';
import Utils from '../zkp-utils';

const utils = Utils('../config/stats');
const { rndHex, padHex } = utils;
const HASHLENGTH = config.get('HASHLENGTH');

const generateTokenID = async () => rndHex(32);
const numberToHexString = int => padHex(int, 128);

// test data.
export default {
  alice: {
    name: 'alice',
    email: 'alice@ey.com',
    password: 'pass',
    get pk() {
      return utils.hash(this.sk); // sk - set at login test suit (step 2)
    },
  },
  bob: {
    name: 'bob',
    email: 'bob@ey.com',
    password: 'pass',
    get pk() {
      return utils.hash(this.sk); // sk - set at login test suit (step 2)
    },
  },
  erc721: {
    tokenURI: 'one',
    tokenID: generateTokenID(),
  },
  erc20: {
    mint: 5,
    toBeMintedAsCommitment: [2, 3],
    transfer: 4,
    get change() {
      return this.toBeMintedAsCommitment.reduce((a, b) => a + b, -this.transfer);
    },
  },

  // dependent data
  async erc721Commitment() {
    const { alice, bob, erc721 } = this;

    erc721.tokenID = await erc721.tokenID;

    return {
      uri: erc721.tokenURI,
      tokenID: erc721.tokenID,
      mintCommitmentIndex: '0',
      transferCommitmentIndex: '1',

      // commitment while mint
      get mintCommitment() {
        return utils.recursiveHashConcat(
          utils.strip0x(this.tokenID).slice(-(HASHLENGTH * 2)),
          alice.pk,
          this.S_A, // S_A - set at erc-721 commitment mint (step 4)
        );
      },

      // commitment while transfer
      get transferCommitment() {
        return utils.recursiveHashConcat(
          utils.strip0x(this.tokenID).slice(-(HASHLENGTH * 2)),
          bob.pk,
          this.S_B, // S_B - set at erc-721 commitment transfer to bob (step 5)
        );
      },
    };
  },

  // dependent data
  async erc20Commitments() {
    const { alice, bob, erc20 } = this;

    return {
      mint: [
        {
          A: numberToHexString(erc20.toBeMintedAsCommitment[0]),
          commitmentIndex: 0,
          get commitment() {
            return utils.recursiveHashConcat(
              this.A,
              alice.pk,
              this.S_A, // S_A - set at erc-20 commitment mint (step 10)
            );
          },
        },
        {
          A: numberToHexString(erc20.toBeMintedAsCommitment[1]),
          commitmentIndex: 1,
          get commitment() {
            return utils.recursiveHashConcat(
              this.A,
              alice.pk,
              this.S_A, // S_A - set at erc-20 commitment mint (step 11)
            );
          },
        },
      ],
      transfer: {
        value: numberToHexString(erc20.transfer),
        commitmentIndex: 2,
        get commitment() {
          return utils.recursiveHashConcat(
            this.value,
            bob.pk,
            this.S_E, // S_E - set at erc-20 commitment transfer (step 12)
          );
        },
      },
      change: {
        value: numberToHexString(erc20.change),
        commitmentIndex: 3,
        get commitment() {
          return utils.recursiveHashConcat(
            this.value,
            alice.pk,
            this.S_F, // S_F - set at erc-20 commitment transfer (step 12)
          );
        },
      },
    };
  },

  /*
   *  This function will configure dependent test data.
   */
  async configureDependentTestData() {
    this.erc721Commitment = await this.erc721Commitment();
    this.erc20Commitments = await this.erc20Commitments();
  },
};
