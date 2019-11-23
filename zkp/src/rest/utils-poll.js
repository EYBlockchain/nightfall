/**
@module utils-poll.js contains all of the logic for starting and stopping a poll.
@author iAmMichaelConnor
*/

const poll = async (pollingFunction, interval, arg1, arg2) => {
  // console.log('Polling...');
  // this is called as a Promise which only resolves when the conditions of the pollingFunction have been satisfied (i.e. once the pollingFunction returns something other than false).
  const checkPollCondition = async (resolve, reject) => {
    const response = await pollingFunction(arg1, arg2); // polling function must return a FALSE if unsuccessful.
    if (response === false) {
      // if the polling function was unsuccessful, poll again:
      console.log('...');
      setTimeout(checkPollCondition, interval, resolve, reject);
    } else {
      // if the polling function was successful, resolve this poll.
      resolve(response);
    }
  };
  return new Promise(checkPollCondition);
};

// EXAMPLES

let exampleResponse;
let delayIncrementer = 1000;

const exampleDelayToResolution = async () => {
  exampleResponse = false;
  setTimeout(() => {
    exampleResponse = true;
  }, 25000);
};

function delayedPromise(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const exampleQueryDelay = async () => {
  await delayedPromise(delayIncrementer);
  delayIncrementer *= 2;
  return exampleResponse;
};

const exampleQuery = async () => {
  const response = await exampleQueryDelay();
  return response;
};

/**
EXAMPLE ONLY - an example of a pollingFunction
@returns {boolean} - ALWAYS!!!
*/
const examplePollingFunction = async () => {
  console.log('in pollingFunction');
  const response = await exampleQuery();
  console.log(`response: ${response}`);
  return response;
};

/**
EXAMPLE ONLY - an invokation of a poll
Execute from command line with:

node -e 'require("./utils-poll").examplePoll()'

*/
async function examplePoll() {
  exampleDelayToResolution();
  await poll(examplePollingFunction, 1000);
}

export default {
  examplePoll,
  poll,
};
