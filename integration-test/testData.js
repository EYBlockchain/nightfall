import config from 'config';
import utils from '../zkp-utils';

const { leftPadHex } = utils;
const LEAF_HASHLENGTH = config.get('LEAF_HASHLENGTH');

function parseMintCommitments(erc20, type, user) {
  return erc20[type].mintCommitments.map(value => {
    return {
      value: leftPadHex(parseInt(value, 7), 32),
      get commitment() {
        return utils.concatenateThenHash(
          `0x${utils.strip0x(erc20.contractAddress).padStart(64, '0')}`,
          this.value,
          user.pk,
          this.salt === undefined ? '0x0' : this.salt, // S_A - set at erc-20 commitment mint (step 18)
        );
      },
    };
  });
}

function parseTransferCommitments(erc20, type, user) {
  return erc20[type].transferCommitments.map(value => {
    return {
      value: leftPadHex(parseInt(value, 7), 32),
      receiver: { name: user.name },
      get commitment() {
        return utils.concatenateThenHash(
          `0x${utils.strip0x(erc20.contractAddress).padStart(64, '0')}`,
          this.value,
          user.pk,
          this.salt === undefined ? '0x0' : this.salt, // S_A - set at erc-20 commitment mint (step 18)
        );
      },
    };
  });
}

// test data.
export default {
  alice: {
    name: 'alice',
    email: 'alice@ey.com',
    password: 'pass',
    get pk() {
      return this.secretKey === undefined ? undefined : utils.hash(this.secretKey); // secretKey - set at login test suit (step 2)
    },
  },
  bob: {
    name: 'bob',
    email: 'bob@ey.com',
    password: 'pass',
    get pk() {
      return this.secretKey === undefined ? undefined : utils.hash(this.secretKey); // secretKey - set at login test suit (step 2)
    },
  },
  erc721: {
    contractAddress: '',
    tokenUri: 'one',
  },
  erc20: {
    contractAddress: '',
    mint: 100,
    transfer: {
      mintCommitments: [2, 3],
      transferCommitment: 4,
      get changeCommitment() {
        return this.mintCommitments.reduce((a, b) => a + b, -this.transferCommitment);
      },
    },
    batchTransfer: {
      mintCommitment: 10,
      transferCommitments: [2, 2],
    },
    consolidationTransfer: {
      mintCommitments: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      transferCommitment: 20,
    },
  },

  // dependent data
  async erc721CommitmentTransfer() {
    const { alice, bob, erc721 } = this;
    return {
      tokenUri: erc721.tokenUri,
      get tokenId() {
        return erc721.tokenId;
      },
      // commitment while mint
      get mintCommitment() {
        return utils.concatenateThenHash(
          `0x${utils.strip0x(erc721.contractAddress).padStart(64, '0')}`,
          utils.strip0x(this.tokenId).slice(-(LEAF_HASHLENGTH * 2)),
          alice.pk,
          this.salt, // salt - set at erc-721 commitment mint (step 4)
        );
      },

      // commitment while transfer
      get transferCommitment() {
        return utils.concatenateThenHash(
          `0x${utils.strip0x(erc721.contractAddress).padStart(64, '0')}`,
          utils.strip0x(this.tokenId).slice(-(LEAF_HASHLENGTH * 2)),
          bob.pk,
          this.transferredSalt, // S_B - set at erc-721 commitment transfer to bob (step 5)
        );
      },
    };
  },

  // dependent data
  async erc20CommitmentTransfer() {
    const { alice, bob, erc20 } = this;
    return {
      mintCommitments: parseMintCommitments(erc20, 'transfer', alice),
      transferCommitment: {
        value: leftPadHex(parseInt(erc20.transfer.transferCommitment, 7), 32),
        get commitment() {
          return utils.concatenateThenHash(
            `0x${utils.strip0x(erc20.contractAddress).padStart(64, '0')}`,
            this.value,
            bob.pk,
            this.salt === undefined ? '0x0' : this.salt, // S_E - set at erc-20 commitment transfer (step 12)
          );
        },
      },
      changeCommitment: {
        value: leftPadHex(parseInt(erc20.transfer.changeCommitment, 7), 32),
        get commitment() {
          return utils.concatenateThenHash(
            `0x${utils.strip0x(erc20.contractAddress).padStart(64, '0')}`,
            this.value,
            alice.pk,
            this.salt === undefined ? '0x0' : this.salt, // S_F - set at erc-20 commitment transfer (step 12)
          );
        },
      },
    };
  },

  // dependent data
  async erc20CommitmentBatchTransfer() {
    const { alice, bob, erc20 } = this;
    return {
      mintCommitment: {
        value: leftPadHex(parseInt(erc20.batchTransfer.mintCommitment, 7), 32),
        get commitment() {
          return utils.concatenateThenHash(
            `0x${utils.strip0x(erc20.contractAddress).padStart(64, '0')}`,
            this.value,
            alice.pk,
            this.salt === undefined ? '0x0' : this.salt, // S_A - set at erc-20 commitment mint (step 18)
          );
        },
      },
      transferCommitments: parseTransferCommitments(erc20, 'batchTransfer', bob),
    };
  },

  // dependent data
  async erc20CommitmentConsolidationTransfer() {
    const { alice, bob, erc20 } = this;
    return {
      mintCommitments: parseMintCommitments(erc20, 'consolidationTransfer', alice),
      transferCommitment: {
        get value() {
          return leftPadHex(parseInt(erc20.consolidationTransfer.transferCommitment, 7), 32);
        },
        get commitment() {
          return utils.concatenateThenHash(
            `0x${utils.strip0x(erc20.contractAddress).padStart(64, '0')}`,
            this.value,
            bob.pk,
            this.salt === undefined ? '0x0' : this.salt, // S_E - set at erc-20 commitment transfer (step 12)
          );
        },
      },
    };
  },

  /*
   *  This function will configure dependent test data.
   */
  async configureDependentTestData() {
    this.erc721CommitmentTransfer = await this.erc721CommitmentTransfer();
    this.erc20CommitmentTransfer = await this.erc20CommitmentTransfer();
    this.erc20CommitmentBatchTransfer = await this.erc20CommitmentBatchTransfer();
    this.erc20CommitmentConsolidationTransfer = await this.erc20CommitmentConsolidationTransfer();
  },
};
