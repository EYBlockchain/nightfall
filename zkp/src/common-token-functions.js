import { formatInputsForZkSnark } from './format-inputs';
import zok from './zokrates';

let container; // used to hold a reference to the Zokrates container

/**
This function needs to be run *before* computing any proofs in order to deploy
the necessary code to the docker container, after instantiating the same. It
will be called automatically by computeProof if it detects tha there is no container
being instantiated.
@param {string} hostDir - the directory on the host to mount into the runContainerMounted
*/
export async function setupComputeProof(hostDir) {
  container = await zok.runContainerMounted(hostDir);
}

/**
This is a convenience function to compute a witness and generate a proof in one hit.
If you haven't yet deployed the code to the docker container to
enable this computation, this routine will call setupComputeProof to do that for
you.
@param {array} elements - array containing all of the public and private parameters the proof needs
@param {string} hostDir - the directory on the host to mount into the runContainerMounted
@returns the proof object
*/
export async function computeProof(elements, hostDir) {
  if (container === undefined || container === null) await setupComputeProof(hostDir);

  console.log(`Container id: ${container.id}`);
  console.log(`To connect to the container manually: 'docker exec -ti ${container.id} bash'`);
  // console.log('output vectors', formatInputsForZkSnark(elements));
  await zok.computeWitness(container, formatInputsForZkSnark(elements), hostDir);

  const proof = await zok.generateProof(container, undefined, hostDir);

  console.group(`Proof: ${JSON.stringify(proof, undefined, 2)}`);
  console.groupEnd();

  zok.killContainer(container);
  container = null; // clear out the container for the next run

  return proof;
}
