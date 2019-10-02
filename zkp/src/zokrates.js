/**
@module zokrates.js
@author Westlad, iAmMichaelConnor
@desc Set of functions needed to drive ZoKrates from Node.  Note: a better way
to do this would be to use ephemeral contains that wrote their output to a
volume but experiments with a Mac show this to be too slow, as OSx differs too
much from a standard linux kernel for this to work efficiently with Docker.
*/

import path from 'path';
import { Docker } from 'node-docker-api';
import { readFileSync } from 'jsonfile';
import config from 'config';

const docker = new Docker({
  socketPath: '/var/run/docker.sock',
});

/** create a promise that resolves to the output of a stream when the stream
ends.  It also does some ZoKrates-specific error checking because not all 'errors'
are supported on 'stderr'
@param stream - a stream of console logging as defined in the node-docker-api docs.
*/
const promisifyStream = stream =>
  new Promise((resolve, reject) => {
    const MAX_RETURN = 10000000;
    let chunk = '';
    stream.on('data', d => {
      chunk += d.toString('utf8'); // remove any characters that aren't in the proof.
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

/**
Create and start a container using the zokrates image and make it durable
*/
async function runContainer() {
  console.log('Running the container');
  const container = await docker.container.create({
    Image: config.ZOKRATES_IMAGE,
    Cmd: ['/bin/bash', '-c', 'tail -f /var/log/alternatives.log'],
  });
  console.log('Container running');
  console.log(`Container id: ${container.id}`);
  console.log(`To connect to the container manually: 'docker exec -ti ${container.id} bash'`);
  return container.start();
}

/**
Used by the zkp/code/index.js
Create and start a container using the zokrates image and make it durable
*/
async function runContainerMounted(_hostDirPath) {
  // if we're running this under docker-compose, the input directory is fixed, otherwise we need to set it:
  console.log(`ZoKrates running with Nodejs environment ${process.env.NODE_ENV}`);
  const hostDirPath = process.env.NODE_ENV !== 'setup' ? config.zkpCodeVolume : _hostDirPath;
  // We mount from the safe_dir, to avoid accidental deletion or overwriting of the oringinal files that sit in config.ZOKRATES_HOST_CODE_DIRPATH_REL.
  // We mount to a new 'code' folder in the container. We can't mount to the 'outputs' folder, because we'll overwrite the zokrates app.
  console.log(
    `Running the container; mounted: ${hostDirPath}:${config.ZOKRATES_CONTAINER_CODE_DIRPATH_ABS}:cached`,
  );

  try {
    const container = await docker.container.create({
      Image: config.ZOKRATES_IMAGE,
      HostConfig: {
        Binds: [`${hostDirPath}:${config.ZOKRATES_CONTAINER_CODE_DIRPATH_ABS}:cached`],
      },
      Cmd: ['/bin/bash', '-c', 'tail -f /var/log/alternatives.log'],
    });

    return container.start();
    // to verify that this has started correctly, in a shell type:
    // $ docker ps -a //to get the container id and to view the container's status
    // $ docker exec -ti <container-id> bash
  } catch (err) {
    return console.log(err);
  }
}

/**
Stop and remove the container after you have finished
*/
async function killContainer(container) {
  console.log('Killing the container');
  await container.stop();
  return container.delete({
    force: true,
  });
}

/**
This function and the following ones are direct equivalents of the corresponding
ZoKrates function.  They return Promises that resolve to the output (stdout, stderr)
from ZoKrates.
*/
async function compile(container, codeFile) {
  console.log('Compiling code in the container - this can take some minutes...');
  const exec = await container.exec.create({
    Cmd: [
      config.ZOKRATES_APP_FILEPATH_ABS,
      'compile',
      '-i',
      config.ZOKRATES_CONTAINER_CODE_DIRPATH_ABS + codeFile,
    ],
    AttachStdout: true,
    AttachStderr: true,
  });
  return promisifyStream(await exec.start(), 'compile'); // return a promisified stream
}

async function computeWitness(container, a, zkpPath) {
  console.log('\nCompute-witness: Executing the program C(w,x) with:\n (w,x)=', a, '...');
  // var config = Config.getProps()
  console.log('a ', ...a);
  const exec = await container.exec.create({
    Cmd: [
      config.ZOKRATES_APP_FILEPATH_ABS,
      'compute-witness',
      '-a',
      ...a,
      '-i',
      path.resolve(config.ZOKRATES_CONTAINER_CODE_DIRPATH_ABS, zkpPath, 'out'),
    ],
    AttachStdout: true,
    AttachStderr: true,
  });
  return promisifyStream(await exec.start(), 'compute-witness'); // return a promisified stream
}

/**
@param {string} b - OPTIONAL argument, for the zkp/code/index.js to specify the backend
*/
async function setup(container, b = config.ZOKRATES_BACKEND) {
  console.log('Setup: computing (pk,vk) := G(C,toxic) - this can take many minutes...');

  const exec = await container.exec.create({
    Cmd: [config.ZOKRATES_APP_FILEPATH_ABS, 'setup', '--proving-scheme', b],
    AttachStdout: true,
    AttachStderr: true,
  });
  return promisifyStream(await exec.start(), 'setup'); // return a promisified stream
}

/* TODO - the new zokrates outputs the Proof into a proof.json file, so we won't need the below Regex code to extract the proof.
 */
/**
@param {string} b - OPTIONAL argument, for the zkp/code/index.js to specify the backend. For regular ./nightfall runs, the backend defaults to config.ZOKRATES_BACKEND, so the b parameter won't get used.
*/
async function generateProof(container, b = config.ZOKRATES_BACKEND, zkpPath) {
  console.log('\nGenerating Proof := P(pk,w,x)');

  console.log('Backend being used', b);

  const exec = await container.exec.create({
    Cmd: [
      config.ZOKRATES_APP_FILEPATH_ABS,
      'generate-proof',
      '--proving-scheme',
      b,
      '-p',
      path.resolve(config.ZOKRATES_CONTAINER_CODE_DIRPATH_ABS, zkpPath, 'proving.key'),
      '-i',
      path.resolve(config.ZOKRATES_CONTAINER_CODE_DIRPATH_ABS, zkpPath, 'out'),
    ], // "| tail -n 9 | head -n 8"],
    // Cmd: [config.ZOKRATES_APP_DIRPATH_ABS + "generate-proof.sh"], //this runs a script which strips the proof parameters out of zokrates generate-proof output
    AttachStdout: true,
    AttachStderr: true,
  });

  await promisifyStream(await exec.start(), 'generate-proof'); // wait for console output to end
  // move the proof.json into the shared host folder annoyinly you can't get zokrates to write it here
  const exec2 = await container.exec.create({
    Cmd: [
      'mv',
      path.resolve(config.ZOKRATES_OUTPUTS_DIRPATH_ABS, 'proof.json'),
      path.resolve(config.ZOKRATES_CONTAINER_CODE_DIRPATH_ABS, zkpPath, 'proof.json'),
    ],
    AttachStdout: true,
    AttachStderr: true,
  });
  await promisifyStream(await exec2.start(), 'move-proof'); // wait for console output to end
  const { proof } = readFileSync(
    path.resolve(config.ZOKRATES_HOST_CODE_DIRPATH_REL, zkpPath, 'proof.json'),
  );
  console.log('Read proof.json, with result', proof);
  // check the proof for reasonableness
  if (proof.a === undefined || proof.b === undefined || proof.c === undefined) {
    console.log('\nproof.a', proof.a, '\nproof.b', proof.b, '\nproof.c', proof.c);
    throw new Error('proof object does not contain a,b, or c parameter(s)');
  }
  proof.A = proof.a; // our code expects uppercase keys
  proof.B = proof.b;
  proof.C = proof.c;
  return proof;
}

/**
@param {string} b - OPTIONAL argument, for the tar creator to specify the backend
*/
async function exportVerifier(container, b = config.ZOKRATES_BACKEND) {
  const exec = await container.exec.create({
    Cmd: [config.ZOKRATES_APP_FILEPATH_ABS, 'export-verifier', '--proving-scheme', b],
    AttachStdout: true,
    AttachStderr: true,
  });
  return promisifyStream(await exec.start(), 'export-verifier'); // return a promisified stream
}

export default {
  compile,
  computeWitness,
  setup,
  generateProof,
  exportVerifier,
  runContainer,
  runContainerMounted,
  killContainer,
  promisifyStream,
};
