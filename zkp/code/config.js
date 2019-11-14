/**
@module config.js
@author Westlad, Chaitanya-Konda, iAmMichaelConnor
@desc constants used by a nubmer of other modules
*/

let env = 'local'; // set the environment to local if not mentioned while starting the app

/* PATH NAMING CONVENTIONS:

FILENAME_FILEPATH - path up to and including a file called /fileName.extension


DIRNAME_DIRPATH - path to inside a folder called /dirName/.
E.g. for .../parentDir/dirName/fileName.extension, DIRNAME_DIRPATH is to within .../parentDir/dirName/

FILENAME_DIRPATH - path to inside the folder which contains fileName.extension.
E.g. for .../dirName/fileName.extension, FILENAME_DIRPATH is to within .../dirName/


DIRNAME_PARENTPATH - path to inside the parent directory of a directory. E.g. for /parentDir/dirName/fileName.extension, DIRNAME_PARENTPATH is to /parentDir/

FILENAME_PARENTPATH - path to inside the parent directory of a file's containing folder.
E.g. for .../parentDir/dirName/filename.extension, FILENAME_PARENTPATH is .../parentDir/

REL - relative path (relative from process.env.PWD, which in our repo is from path-to-/nightfall/zkp/) (the ./nightfall shell script executes all of this zkp node code from within path-to/zkp/)
i.e. DIRNAME_DIRPATH_REL: "/dirName/" is a relative path which (on the host machine) points to: path-to-/nightfall/zkp/dirName/

ABS - absolute path
*/

const props = {
  local: {
    INPUTS_HASHLENGTH: 32, // expected length of an input to a hash in bytes
    MERKLE_HASHLENGTH: 27, // expected length of inputs to hashes up the merkle tree, in bytes

    ZOKRATES_PRIME: '21888242871839275222246405745257275088548364400416034343698204186575808495617', // decimal representation of the prime p of GaloisField(p)
    // NOTE: 2^253 < ZOKRATES_PRIME < 2^254 - so we must use 253bit numbers to be safe (and lazy) - let's use 248bit numbers (because hex numbers ought to be an even length, and 8 divides 248 (248 is 31 bytes is 62 hex numbers))
    ZOKRATES_PACKING_SIZE: '128', // ZOKRATES_PRIME is approx 253-254bits (just shy of 256), so we pack field elements into blocks of 128 bits.
    MERKLE_DEPTH: 33, // the depth of the coin Merkle tree
    MERKLE_CHUNK_SIZE: 512, // the number of tokens contained in a chunk of the merkle tree.

    NFT_MINT_VK: './code/gm17/nft-mint/nft-mint-vk.json',
    NFT_TRANSFER_VK: './code/gm17/nft-transfer/nft-transfer-vk.json',
    NFT_BURN_VK: './code/gm17/nft-burn/nft-burn-vk.json',

    FT_MINT_VK: './code/gm17/ft-mint/ft-mint-vk.json',
    FT_TRANSFER_VK: './code/gm17/ft-transfer/ft-transfer-vk.json',
    FT_BURN_VK: './code/gm17/ft-burn/ft-burn-vk.json',

    AGREE_CONTRACT_VK: './code/gm17/agree-contract/agree-contract-vk.json',

    VK_IDS: './src/vkIds.json',
    VERIFYING_KEY_CHUNK_SIZE: 10,
    INPUT_CHUNK_SIZE: 128,

    GASPRICE: 20000000000,
    zkp: {
      app: {
        host: process.env.ZKP_HOST,
        port: process.env.ZKP_PORT,
      },
      rpc: {
        host: process.env.BLOCKCHAIN_HOST,
        port: process.env.BLOCKCHAIN_PORT,
      },
    },
  },
};

/**
 * Set the environment
 * @param { string } environment - environment of app
 */
const setEnv = environment => {
  if (props[environment]) {
    env = environment;
  }
};

/**
 * get the appropriate environment config
 */
const getProps = () => {
  return props[env];
};

export default {
  setEnv,
  getProps,
};
