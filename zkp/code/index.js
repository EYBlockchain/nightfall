/**
@module
@author iAmMichaelConnor
@desc Run from within nightfall/zkp/code
*/

import { argv } from 'yargs';
import os from 'os';
import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import config from 'config';

import keyExtractor from './key-extractor';

import zokrates from '../src/zokrates';

const utils = require('../../zkp-utils/index.js'); // eslint-disable-line import/no-commonjs

const isDirectory = source => fs.lstatSync(source).isDirectory();
const getDirectories = source =>
  fs
    .readdirSync(source)
    .map(name => path.join(source, name))
    .filter(isDirectory);

let container;

// SORT THROUGH ARGS:

// arguments to the command line:
// i - filename
const { i } = argv; // file name - pass the my-code.code file as the '-i' parameter

// a - arguments for compute-witness
const a0 = argv.a; // arguments for compute-witness (within quotes "")
let a1 = [];
if (!(a0 === undefined || a0 === '')) {
  a1 = a0.split(' ');
} else {
  a1 = null;
}

// s - suppress console streams
const { s } = argv; // suppress - stream off if -s is specified

// d - delete finished containers (WARNING: might delete containers for which the setup failed, so you wouldn't be able to go in and investigate the problem)
const { d } = argv;

/** create a promise that resolves to the output of a stream when the stream
ends.  It also does some ZoKrates-specific error checking because not all 'errors'
are supported on 'stderr'
*/
const promisifyStream = stream =>
  new Promise((resolve, reject) => {
    const MAX_RETURN = 10000000;
    let chunk = '';
    stream.on('data', dat => {
      // chunk += d.toString("utf8").replace(/[^\x40-\x7F]/g, "").replace(/\0/g, '') //remove non-ascii, non alphanumeric
      chunk += dat.toString('utf8'); // remove any characters that aren't in the proof.
      if (chunk.length > MAX_RETURN) chunk = '...[truncacted]'; // don't send back too much stuff
    });
    stream.on('end', () => {
      if (chunk.includes('panicked')) {
        // errors thrown by the application are not always recognised
        reject(new Error(chunk.slice(chunk.indexOf('panicked'))));
      } else {
        resolve(chunk);
      }
    });
    stream.on('error', err => reject(err));
  });

async function getImportFiles(dataLines) {
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

async function checkForImportFiles(codeFilePath, codeFileName, codeFileParentPath) {
  console.log(`Checking for 'import' files in the .code file ${codeFileName}`);

  const dataLines = await fs
    .readFileSync(codeFilePath)
    .toString('UTF8')
    .split(os.EOL);

  let importFiles = [];
  importFiles = await getImportFiles(dataLines);
  if (!(importFiles === undefined || importFiles.length === 0)) {
    // array is nonempty
    const len = importFiles.length;
    for (let j = 0; i < len; j += 1) {
      const file = importFiles[j];
      try {
        if (fs.existsSync(codeFileParentPath + file)) {
          // file exists
          console.log(`${file} is saved in the correct place`);
        }
      } catch (err) {
        console.error(err);
        console.error(`${file} not found in ${codeFileParentPath}`);
      }
    }
  }
}

async function setup(codeFile, outputDirPath, backend, a) {
  const codeFileName = codeFile.substring(0, codeFile.lastIndexOf('.'));

  console.log(`codeFileName: ${codeFileName}`);
  console.log(`codeFile: ${codeFile}`);
  console.log(`outputDirPath: ${outputDirPath}`);
  console.log(`backend: ${backend}`);
  console.log(`public arguments: ${a}`);

  try {
    container = await zokrates.runContainerMounted(outputDirPath);

    await container;

    console.log(`\nContainer running for ${codeFileName}`);
    console.log(`Container id for ${codeFileName}`, `: ${container.id}`);
    console.log(
      `To connect to the ${codeFileName}`,
      ` container manually: 'docker exec -ti ${container.id} bash'`,
    );

    console.group('\nCompile', codeFileName, '...');
    // compile .code file
    let output = await zokrates.compile(container, codeFile).catch(err => {
      console.error(err);
    });
    if (!s) console.log(output);
    console.log(codeFileName, 'SETUP MESSAGE: COMPILATION COMPLETE');
    console.groupEnd();

    // optionally run a check on an input string (if parameter -a is specified at runtime)
    if (a) {
      console.group('\nComputing witness', codeFileName, '...');
      output = await zokrates.computeWitness(container, a).catch(err => {
        console.error(err);
      });
      if (!s) console.log(output);
      const lines = output.split(os.EOL);
      const cpData = [...lines];
      // ~out_130
      let outVals = [];
      const regex = /(~out_[0-9]+ )([0-9])+/g;
      cpData
        .filter(el => el.match(regex))
        .map(el =>
          el.replace(/(~out_[0-9]+ )([0-9])+/g, (m, out, _val) => {
            const val = parseInt(_val, 10); // get the first number
            outVals = outVals.concat(val);
          }),
        );
      outVals = outVals.reverse(); // the outputs of zokrates are the wrong way around

      if (!s) console.log(`outVals: \n${outVals}`);

      let outVal;
      switch (utils.isProbablyBinary(outVals)) {
        case 'decimal':
          console.group('\nOutput from compute-witness:\n');
          console.log(`output array length: ${outVals.length}\n`);
          console.log(`bin:  ${outVals.forEach(val => utils.decToBin(val))}`);
          console.log(`dec:  ${outVals}`);
          console.log(`hex:  ${outVals.forEach(val => utils.decToHex(val))}`);
          console.groupEnd();
          break;
        default:
          outVal = outVals.join('');
          console.group('\nOutput from compute-witness:\n');
          console.log(`output array length: ${outVals.length}\n`);
          console.log(`bin:  ${outVal}`);
          console.log(`dec:  ${utils.binToDec(outVal)}`);
          console.log(`hex:  ${utils.binToHex(outVal)}`);
          console.groupEnd();
      }
      console.log(codeFileName, 'SETUP MESSAGE: CREATE WITNESS COMPLETE');
      console.groupEnd();
    } else {
      // the below runs only if arg '-a' is NOT specified.
      // i.e. you can either compute a witness by specifying '-a', OR you can create a tar file...

      // trusted setup to produce pk and vk
      console.group('\nSetup', codeFileName, '...');
      output = await zokrates.setup(container).catch(err => {
        console.error(err);
      });
      if (!s) console.log(output);
      console.log('SETUP MESSAGE: SETUP COMPLETE');
      console.groupEnd();

      // create a verifier.sol
      console.group('\nExport Verifier', codeFileName, '...');
      output = await zokrates.exportVerifier(container).catch(err => {
        console.error(err);
      });
      if (!s) console.log(output);
      console.log(codeFileName, 'SETUP MESSAGE: EXPORT-VERIFIER COMPLETE');
      console.groupEnd();

      // move the newly created files into your 'code' folder within the zokrates container.
      const exec = await container.exec
        .create({
          Cmd: [
            '/bin/bash',
            '-c',
            `cp ${
              config.ZOKRATES_OUTPUTS_DIRPATH_ABS
            }{out,out.code,proving.key,verification.key,verifier.sol} ${
              config.ZOKRATES_CONTAINER_CODE_DIRPATH_ABS
            }`,
          ],
          AttachStdout: true,
          AttachStderr: true,
        })
        .catch(err => {
          console.error(err);
        });
      output = await promisifyStream(await exec.start());
      if (!s) console.log(output);
      console.log(
        codeFileName,
        `SETUP MESSAGE: FILES COPIED TO THE MOUNTED DIR WITHIN THE CONTAINER. THE FILES WILL NOW ALSO EXIST WITHIN YOUR LOCALHOST'S FOLDER: ${outputDirPath}`,
      );

      console.group('\nKey extraction', codeFileName, '...');

      // extract a JSON representation of the vk from the exported Verifier.sol contract.
      const vkJSON = await keyExtractor.keyExtractor(`${outputDirPath}verifier.sol`, s);

      if (vkJSON) {
        fs.writeFileSync(`${outputDirPath + codeFileName}-vk.json`, vkJSON, function logErr(err) {
          if (err) {
            console.error(err);
          }
        });
        console.log(`File: ${outputDirPath}${codeFileName}-vk.json created successfully`);
      }
      console.groupEnd();
    }
    if (!d) {
      console.log(
        `\nTo connect to the ${codeFileName} container manually: 'docker exec -ti ${
          container.id
        } bash'`,
      );
    } else {
      await zokrates.killContainer(container);
      console.log(`container ${container.id} killed`);
    }

    console.log(`${codeFileName} SETUP COMPLETE`);
  } catch (err) {
    console.log(err);
    console.log(
      '\n******************************************************************************************************************',
      `\nTrusted setup has failed for ${codeFile}. Please see above for additional information relating to this error.`,
      '\nThe most common cause of errors when using this tool is insufficient allocation of resources to Docker.',
      "\nYou can go to Docker's settings and increase the RAM being allocated to Docker. See the README for more details.",
      '\n******************************************************************************************************************',
    );
    return new Error(err);
  }
  return true; // looks like it worked. Return something for consistency
}

/**
@param {string} codeFile A filename string of the form "my-code.code" or "my-code.code"
@param {string} codeFileParentPath The path to, but not including, the codeFile.
@param {string} a OPTIONAL A string of arguments, separated by space characters only.
*/
async function filingChecks(codeFile, codeFileParentPath) {
  /**
  codeFilePath: e.g. "./code/my-code.code"
  codeFile: e.g. "my-code.code"
  codeFileName: e.g. "my-code"
  codeFileExt: e.g. "code"
  */
  console.log(`\nFiling checks for codeFile: ${codeFile}`);
  // check we're working with either a .code file.
  const codeFileName = await codeFile.substring(0, codeFile.lastIndexOf('.'));
  const codeFileExt = await codeFile.substring(codeFile.lastIndexOf('.') + 1, codeFile.length);
  if (!(codeFileExt === 'code')) {
    return new Error("Invalid file extenstion. Expected a '.code' file.");
  }
  const codeFilePath = codeFileParentPath + codeFile;
  let pwd = process.cwd();
  pwd += '/code/';

  // A .code file has been specified, but let's copy it into the safe_dump dir in case things go wrong; so we don't lose our original file.
  try {
    await fs.copyFileSync(codeFilePath, `${pwd}safe-dump/${codeFile}`);
    console.log(`${codeFilePath} was copied to safe-dump/${codeFile}`);
  } catch (err) {
    return new Error(err);
  }

  await checkForImportFiles(codeFilePath, codeFileName, codeFileParentPath);

  console.groupEnd();
  return codeFileName;
}

function readdirAsync(_path) {
  return new Promise(function prm(resolve, reject) {
    fs.readdir(_path, function rdr(error, result) {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

async function checkForOldFiles(dir) {
  const files = await readdirAsync(dir);

  console.log('\n\nFound existing files:', files, 'in', dir);
  console.log(
    "\n\nIf you continue, these files will be deleted (except for the '.code' file and any '.code' dependencies).",
  );

  const carryOn = await inquirer.prompt([
    {
      type: 'skip',
      name: 'skip',
      message: 'Continue with the trusted setup? y/n ',
      choices: ['y', 'n'],
    },
  ]);
  if (carryOn.skip !== 'y') return false;

  return files;
}

async function rmOldFiles(dir, files) {
  for (let j = 0; j < files.length; j += 1) {
    const fileExt = files[j].substring(files[j].lastIndexOf('.') + 1, files[j].length);
    if ((files[j] === 'out.code')||(fileExt !== 'code')) {
      console.log('deleting', files[j]);
      fs.unlink(path.join(dir, files[j]), err => {
        if (err) throw err;
      });
    }
  }
  const remainingFiles = await readdirAsync(dir);
  console.log('\nFiles remaining:', remainingFiles, 'in', dir);
}

// RUN
async function runSetup(a) {
  // check we're parsing the correct directory:
  console.group('Checking pwd...');
  let pwd = process.cwd();
  console.log(`pwd: ${pwd}`);
  const pwdName = pwd.substring(pwd.lastIndexOf('/') + 1, pwd.length);
  console.log(`pwdName: ${pwdName}`);
  if (pwdName !== config.ZKP_PWD) {
    throw new Error(`Wrong PWD. Please call this executable file from: ${config.ZKP_PWD}`);
  }
  pwd += '/code/';
  console.groupEnd();

  const dir = pwd + i;
  console.log(`directory: ${dir}`);

  let backend;
  if (i.indexOf('pghr13') >= 0) {
    backend = 'pghr13'; // NOTE: although this tool supports PGHR13, the wider Nightfall opensource repo does not support pghr13.
  } else if (i.indexOf('gm17') >= 0) {
    backend = 'gm17';
  } else {
    throw new Error("Incorrect backend or folder specified. Expected either 'pghr13' or 'gm17'.");
  }

  let files = await checkForOldFiles(dir);
  if (files === false) {
    throw new Error('user cancelled the setup');
  }
  await rmOldFiles(dir, files);

  files = await readdirAsync(dir);

  // filter all files for ones with extension .code
  files = files.filter(f => {
    const codeFileExt = f.substring(f.lastIndexOf('.') + 1, f.length);
    const codeFilePrefix = f.substring(0, 3);
    if (codeFileExt !== 'code') {
      return false;
    }
    return true;
  });

  for (let j = 0; j < files.length; j += 1) {
    const codeFile = files[j];
    const codeFileParentPath = `${dir}/`;
    const codeFileName = await filingChecks(codeFile, codeFileParentPath, a); // eslint-disable-line no-await-in-loop
    await setup(`${codeFileName}.code`, codeFileParentPath, backend, a); // eslint-disable-line no-await-in-loop
  }
}

async function runSetupAll(a) {
  // check we're parsing the correct directory:
  console.group('Checking pwd...');
  let pwd = process.cwd();
  console.log(`pwd: ${pwd}`);
  const pwdName = pwd.substring(pwd.lastIndexOf('/') + 1, pwd.length);
  console.log(`pwdName: ${pwdName}`);
  if (pwdName !== config.ZKP_PWD) {
    throw new Error(`Wrong PWD. Please call this executable file from: ${config.ZKP_PWD}`);
  }
  pwd += '/code/';
  console.groupEnd();

  let dirs = getDirectories(pwd);
  console.log('\n\ndirs in', pwd, ':');
  console.log(dirs);

  // filter dirs to those of interest to us
  dirs = dirs.filter(dir => {
    const dirName = dir.substring(dir.lastIndexOf('/') + 1, dir.length);
    if (dirName === 'gm17') {
      return true;
    }
    return false;
  });
  console.log('\n\nrelevant dirs in', pwd, ':');
  console.log(dirs);
  // get the dirs within the dirs
  const dirs2 = [];
  // get the files within the dirs
  for (let k = 0; k < dirs.length; k += 1) {
    dirs2[k] = getDirectories(dirs[k]);
    console.log('\n\ndirs in', dirs[k], ':');
    console.log(dirs2[k]);

    for (let l = 0; l < dirs2[k].length; l += 1) {
      const dir = dirs[k];
      const dir2 = dirs2[k][l];

      let files = await checkForOldFiles(dir2); // eslint-disable-line no-await-in-loop
      if (files !== []) {
        await rmOldFiles(dir2, files); // eslint-disable-line no-await-in-loop
        files = await readdirAsync(dir2); // eslint-disable-line no-await-in-loop
        // filter all files for ones with extension .code
        files = files.filter(f => {
          const codeFileExt = f.substring(f.lastIndexOf('.') + 1, f.length);
          const codeFilePrefix = f.substring(0, 3);
          if (codeFileExt !== 'code') {
            return false;
          }
          return true;
        });
        for (let j = 0; j < files.length; j += 1) {
          const codeFile = files[j];
          const codeFileParentPath = `${dir2}/`;
          const backend = dir.substring(dir.lastIndexOf('/') + 1, dir.length);
          const codeFileName = await filingChecks(codeFile, codeFileParentPath, a); // eslint-disable-line no-await-in-loop

          try {
            await setup(`${codeFileName}.code`, codeFileParentPath, backend, a); // eslint-disable-line no-await-in-loop
          } catch (err) {
            console.log(err);
            break;
          }
        }
      }
    }
  }
}

async function allOrOne() {
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
      runSetupAll(a1); // we'll do all .code files if no option is specified
    } catch (err) {
      throw new Error(`${err}Trusted setup failed.`);
    }
  } else {
    await runSetup(a1);
  }
}

// RUN
allOrOne().catch(err => console.log(err));
