/**
A small utility to calculate sha padding.  This is often needed in a .zok file
and it's a bit of a pain to look up the NIST standard and manually compute it
each time
*/
const yargs = require('yargs');

const options = yargs.option('l', {
  alias: 'message-length',
  describe: 'the length of the message to be padded in bits',
  type: 'number',
  demandOption: true,
}).argv;

const { l } = options;
let padding = [];
padding.push('1');
const k = (((448 - l - 1) % 512) + 512) % 512; // this gives a true mod rather than a remainder
padding = padding.concat(new Array(k).fill('0'));
padding = padding.concat(
  BigInt(l)
    .toString(2)
    .padStart(64, '0')
    .split(''),
);
console.log('Padding length is', padding.length);
console.log('Padded length is', l + padding.length);
console.log('The padding that you are looking for is:', padding.join(',  '));
