/**
@module
@author iAmMichaelConnor
@desc Run from within nightfall/zkp/code
*/

import { argv } from 'yargs';
import util from 'util';
import os from 'os';
import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
// eslint-disable-next-line import/extensions
import { compile, setup, exportVerifier } from '@eyblockchain/zokrates.js';
import keyExtractor from './keyExtractor';

const readdirAsync = util.promisify(fs.readdir);

const isDirectory = source => fs.lstatSync(source).isDirectory();
const getDirectories = source =>
  fs
    .readdirSync(source)
    .map(name => path.join(source, name))
    .filter(isDirectory);

/**
 * Returns an array of all imported files in dataLines.
 * @param {String[]} dataLines - Array of lines that make up a .code file.
 * @returns {String[]} - Array of imported files in dataLines.
 */
function getImportFiles(dataLines) {
  const cpDataLines = [...dataLines];
  return cpDataLines.reduce((accArr, line) => {
    // parses each line of the .code file for a line of the form:
    // import "./aux-adder.code" as ADD
    //  and extracts "./aux-adder.code"
    // ZoKrates' own packages will be ignored, as they are of the form:
    // import "LIBSNARK/sha256compression"
    //  which doesn't include ".code", and so are ignored.
    line.replace(/((import ")+(.+\.+code+)+("+))+?/g, (m1, m2, ii, c) => {
      if (c !== undefined) {
        accArr.push(c);
      }
    });
    return accArr;
  }, []);
}

/**
 * Ensures that any imported dependencies in code files are present.
 * @param {String} codeFileDirectory - Directory in which code file resides (i.e., /gm17/ft-burn)
 * @param {String} codeFile - Name of code file (i.e., ft-burn)
 * @throws {Error} - If a dependent code file is not found
 */
async function checkForImportFiles(codeFileDirectory, codeFile) {
  const dataLines = fs
    .readFileSync(`${codeFileDirectory}/${codeFile}`)
    .toString('UTF8')
    .split(os.EOL);

  // Assumes that any dependencies will exist in the /code/gm17 directory.
  const codeFileParentPath = path.join(codeFileDirectory, '../../');

  let importFiles = [];
  importFiles = getImportFiles(dataLines);
  if (!(importFiles === undefined || importFiles.length === 0)) {
    // array is nonempty
    for (let j = 0; j < importFiles.length; j += 1) {
      const file = importFiles[j];
      if (!fs.existsSync(codeFileParentPath + file)) {
        // throw new Error(`Imported file in ${codeFile}: ${file} not found in ${codeFileParentPath}`);
      }
    }
  }
}

/**
 * Copies files over to /code/safe-dump, and then checks to ensure imports are present.
 * @param {string} codeDirectory - Directory that contains the .code file (e.g., '/code/gm17/ft-burn')
 */
async function filingChecks(codeDirectory) {
  const files = await readdirAsync(codeDirectory);

  // Looking for the .code file, e.g., ft-burn.out
  let codeFileName;
  let codeFileExt;
  for (let j = 0; j < files.length; j += 1) {
    codeFileName = files[j].substring(0, files[j].lastIndexOf('.'));
    codeFileExt = files[j].substring(files[j].lastIndexOf('.') + 1, files[j].length);

    // Output directory
    // Looking for a .code file, but not out.code
    if (codeFileExt === 'code' && codeFileName !== 'out') {
      break;
    }
  }

  // Copies files over to /code/safe-dump
  const safeDumpDirectory = path.join(codeDirectory, '../../safe-dump');
  fs.copyFileSync(
    `${codeDirectory}/${codeFileName}.${codeFileExt}`,
    `${safeDumpDirectory}/${codeFileName}.${codeFileExt}`,
    err => {
      if (err) throw new Error('Error while copying file:', err);
    },
  );

  await checkForImportFiles(`${codeDirectory}`, `${codeFileName}.${codeFileExt}`);
}

/**
 * Given a directory that contains a .code file, calls Zokrates compile, setup and export verifier
 * @param {String} directoryPath
 * @param {Boolean} suppress - Flag for logging out zokrates output or not.
 */
async function generateZokratesFiles(directoryPath, suppress) {
  const files = await readdirAsync(directoryPath);

  console.group(`Setup for directory ${directoryPath}`);

  const directoryWithSlash = directoryPath.endsWith('/') ? directoryPath : `${directoryPath}/`;

  let codeFile;
  // Look for a .code file that's not out.code. That's the file we're compiling.
  for (let j = 0; j < files.length; j += 1) {
    if (files[j].endsWith('.code') && files[j] !== 'out.code') {
      codeFile = files[j];
      break;
    }
  }

  console.log('Compiling at', `${directoryWithSlash}${codeFile}`);

  // Generate out.code and out in the same directory.
  const compileOutput = await compile(
    `${directoryWithSlash}${codeFile}`,
    directoryWithSlash,
    'out',
    {
      verbose: !suppress,
    },
  );
  if (!suppress) console.log('Compile output:', compileOutput);
  console.log('Finished compiling at', directoryPath);

  console.log('Running setup on', directoryPath);
  // Generate verification.key and proving.key
  const setupOutput = await setup(
    `${directoryWithSlash}out`,
    directoryWithSlash,
    'gm17',
    'verification.key',
    'proving.key',
    { verbose: !suppress },
  );
  if (!suppress) console.log('Setup output:', setupOutput);
  console.log('Finished setup at', directoryPath);

  console.log('Running export-verifier at', directoryPath);
  const exportVerifierOutput = await exportVerifier(
    `${directoryWithSlash}/verification.key`,
    directoryWithSlash,
    'verifier.sol',
    'gm17',
    { verbose: !suppress },
  );
  if (!suppress) console.log('Export-verifier output:', exportVerifierOutput);
  console.log('Finished export-verifier at', directoryPath);

  console.log(`Extracting key from ${directoryWithSlash}verifier.sol`);
  const vkJson = await keyExtractor(`${directoryWithSlash}verifier.sol`, true);

  console.log(`Writing ${directoryWithSlash}${codeFile.split('.')[0]}-vk.json`);
  // Create a JSON with the file name but without .code
  fs.writeFileSync(`${directoryWithSlash}${codeFile.split('.')[0]}-vk.json`, vkJson, err => {
    if (err) {
      console.error(err);
    }
  });
  console.log(directoryPath, 'is done setting up.');
  console.groupEnd();
}

/**
 * Calls Zokrates' compile, setup, and export-verifier on a single directory that contains a .code file.
 * @param {String} codeDirectory - A specific directory that contains a .code file (e.g., /code/gm17/ft-burn)
 * @param {Boolean} suppress - Flag to suppress console logs.
 */
async function runSetup(codeDirectory, suppress) {
  await filingChecks(codeDirectory);

  await generateZokratesFiles(codeDirectory, suppress);
}

/**
 * Calls zokrates' compile, setup, and export-verifier on all directories in `/zkp/code/gm17`.
 * @param {String} codeDirectory - Directory in which all the .code subfolders live.
 * @param {Boolean} suppress - Flag to suppress console logs.
 */
async function runSetupAll(codeDirectory, suppress) {
  // Array of all directories in the above directory.
  const codeDirectories = getDirectories(codeDirectory);

  await Promise.all(
    codeDirectories.map(subdirectory => {
      return filingChecks(subdirectory);
    }),
  );

  // The files don't compile correctly when we Promise.all these, so we're doing sequentially.
  // Maybe too much processing.
  for (let j = 0; j < codeDirectories.length; j += 1) {
    // eslint-disable-next-line no-await-in-loop
    await generateZokratesFiles(codeDirectories[j], suppress);
  }
}

/**
 * Trusted setup for Nightfall. Either compiles all directories in /code/gm17, or a single directory using the -i flag.
 */
async function main() {
  // -i being the name of the .code file (i.e., 'ft-mint')
  const { i } = argv;
  // eslint-disable-next-line no-unneeded-ternary
  const suppress = argv.s ? true : false;

  if (!i) {
    console.log(
      "The '-i' option has not been specified.\nThat's OK, we can go ahead and loop through every .code file.\nHOWEVER, if you wanted to choose just one file, cancel this process, and instead use option -i (see the README-trusted-setup)",
    );
    console.log('Be warned, this could take up to an hour!');

    const carryOn = await inquirer.prompt([
      {
        type: 'yesno',
        name: 'continue',
        message: 'Continue?',
        choices: ['y', 'n'],
      },
    ]);
    if (carryOn.continue !== 'y') return;

    try {
      await runSetupAll(`${process.cwd()}/code/gm17`, suppress); // we'll do all .code files if no option is specified
    } catch (err) {
      throw new Error(`Trusted setup failed: ${err}`);
    }
  } else {
    await runSetup(`${process.cwd()}/code/${i}`, suppress);
  }
}

// RUN
main().catch(err => console.log(err));
