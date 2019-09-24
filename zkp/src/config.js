/**
@module config.js
@author Westlad, Chaitanya-Konda, iAmMichaelConnor
@desc constants used by a nubmer of other modules
*/

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
export default {
  HASHLENGTH: 27, // expected length of a hash in bytes
  ZOKRATES_IMAGE: 'zokrates/zokrates:0.4.11', // 20Nov2018", //tag of Zorates docker image
  ZKP_PWD: 'zkp',
  ZKP_SRC_REL: 'src/',
  ZKP_SAFE_DUMP_DIRPATH_REL: 'code/safe-dump/', // safe-dump is a folder for dumping new files which node or zokrates create onto the host machine. Using the safe-dump folder in this way reduces the risk of overwriting data in the 'code' folder.
  //* ****
  ZOKRATES_HOST_CODE_DIRPATH_REL: 'code/', // path to code files on the host from process.env.PWD (= path-to-/nightfall/zkp/)
  ZOKRATES_HOST_CODE_PARENTPATH_REL: './',
  //* ****
  ZOKRATES_CONTAINER_CODE_CALIBRATION_FILEPATH_ABS: 'home/zokrates/code/code-calibration.txt',
  //* ****
  ZOKRATES_CONTAINER_CODE_DIRPATH_ABS: '/home/zokrates/code/', // path to within the 'code' folder in the container - must exist
  ZOKRATES_CONTAINER_CODE_PARENTPATH_ABS: '/home/zokrates/',
  //* ****
  ZOKRATES_APP_FILEPATH_ABS: '/home/zokrates/zokrates', // path to the ZoKrates app in the container
  ZOKRATES_APP_DIRPATH_ABS: '/home/zokrates/',
  ZOKRATES_APP_PARENTPATH_ABS: '/home/',
  //* ****
  ZOKRATES_OUTPUTS_DIRPATH_ABS: '/home/zokrates/', // container path to the output files written by ZoKrates
  ZOKRATES_OUTPUTS_PARENTPATH_ABS: '/home/',
  //* ****
  ZOKRATES_PRIME: '21888242871839275222246405745257275088548364400416034343698204186575808495617', // decimal representation of the prime p of GaloisField(p)
  // NOTE: 2^253 < ZOKRATES_PRIME < 2^254 - so we must use 253bit numbers to be safe (and lazy) - let's use 248bit numbers (because hex numbers ought to be an even length, and 8 divides 248 (248 is 31 bytes is 62 hex numbers))
  ZOKRATES_PACKING_SIZE: '128', // ZOKRATES_PRIME is approx 253-254bits (just shy of 256), so we pack field elements into blocks of 128 bits.
  MERKLE_DEPTH: 33, // 27, //the depth of the coin Merkle tree
  MERKLE_CHUNK_SIZE: 512, // the number of tokens contained in a chunk of the merkle tree.

  ZOKRATES_BACKEND: 'gm17',

  NFT_MINT_DIR: 'gm17/nft-mint/',
  NFT_TRANSFER_DIR: 'gm17/nft-transfer/',
  NFT_BURN_DIR: 'gm17/nft-burn/',

  FT_MINT_DIR: 'gm17/ft-mint/',
  FT_TRANSFER_DIR: 'gm17/ft-transfer/',
  FT_BURN_DIR: 'gm17/ft-burn/',

  AGREE_CONTRACT_DIR: '/code/gm17/agree-contract/',

  NFT_MINT_VK: './code/gm17/nft-mint/nft-mint-vk.json',
  NFT_TRANSFER_VK: './code/gm17/nft-transfer/nft-transfer-vk.json',
  NFT_BURN_VK: './code/gm17/nft-burn/nft-burn-vk.json',

  FT_MINT_VK: './code/gm17/ft-mint/ft-mint-vk.json',
  FT_TRANSFER_VK: './code/gm17/ft-transfer/ft-transfer-vk.json',
  FT_BURN_VK: './code/gm17/ft-burn/ft-burn-vk.json',

  AGREE_CONTRACT_VK: './code/gm17/agree-contract/agree-contract-vk.json',

  VK_IDS: './src/vkIds.json',
  STATS: './src/stats.json',
  VERIFYING_KEY_CHUNK_SIZE: 10,
  INPUT_CHUNK_SIZE: 128,

  GASPRICE: 20000000000,
};
