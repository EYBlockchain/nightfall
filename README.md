# Fork of Nightfall by 0xcert

The present document is a readme file for the fork of Nightfall done by 0xcert. The crucial update in the present fork is the replacement of ERC-721 standard-compliant non-fungible token within the Nightfall software code with Xcert, the ERC-721 standard-compliant non-fungible tokens enhanced with interoperability and certification features.

This fork of Nightfall by 0xcert integrates a set of smart contracts and microservices, and the ZoKrates zk-snark toolkit, to enable standard ERC-20 and Xcert tokens (ERC-721 non-fungible tokens enhanced with interoperability and certification features) to be transacted on the Ethereum blockchain with complete privacy. It is an experimental solution and still being actively developed. We decided to share our research work in the belief that this will speed the adoption of public blockchains. This is not intended to be a production-ready application, and we do not recommend that you use it as such. If it accelerates your work, then we are pleased to have helped. We hope that people will feel motivated to contribute their ideas and improvements.

**Note that this code has not yet completed a security review and therefore we strongly recommend that you do not use it in production or to transfer items of material value. We take no responsibility for any loss you may incur through the use of this code.**

As well as this file, please be sure to check out:

- [The Whitepaper](./doc/whitepaper/nightfall-v1.pdf) for technical details on the protocols and their application herein.
- [contributions.md](./contributing.md) to find out how to contribute code.
- [limitations.md](./limitations.md) to understand the limitations of the current code.
- [license.md](./license.md) to understand how we have placed this code completely in the public domain, without restrictions (but note that Nightfall makes use of other open-source code which _does_ apply license conditions).
- [UI.md](./UI.md) to learn how to drive the demonstration UI and make transactions.
- [SECURITY.md](./SECURITY.md) to learn about how we handle security issues.

## Getting started

These instructions give the most direct path to a working setup of this fork of Nightfall by 0xcert. The application is compute-intensive, and so a high-end processor is preferred. Depending on your machine, set-up can take one to several hours.

### Supported hardware & prerequisites

Mac and Linux machines with at least 16GB of memory and 10GB of disk space are supported.

The demonstration of this Nightfall fork requires the following software to run:

- Docker
  - Launch Docker Desktop (on Mac, it is on the menu bar) and set memory to 8GB with 4GB of swap space (minimum - 12GB memory is better) or 16GB of memory with 512MB of swap space. **The default values for Docker Desktop will NOT work. No, they really won't**.
- Node (tested with 10.15.3) with npm and node-gyp
  - If running macOS, install Xcode then run `xcode-select —install` to install these.
- docker-proxy
  - <https://github.com/aj-may/docker-proxy/>

### Starting servers

Start Docker:

- On Mac, open Docker.app.

Start docker-proxy:

- `docker-proxy start`

### Installing the Nightfall fork by 0xcert

Clone the repository of this Nightfall fork and use a terminal to enter the directory.

Next, pull a compatible Docker image of ZoKrates.

```sh
docker pull michaelconnor/zok:2Jan2019
```

Next, we have to generate the keys and constraint files for Zero Knowledge Proofs ([read more](./zkp/code/README-tools-trusted-setup.md)), this is about 7GB and depends on randomness for security. This step can take a while, depending on your hardware. Before you start, check once more that you have provisioned enough memory for Docker, as described above:

```sh
cd zkp-utils
npm ci
cd ../zkp
npm ci
npm run setup-all
cd ../
```

Note that this is a completely automated run: although the script will ask questions, it will automatically receive a 'yes' answer. Manual runs are described in the [readme](./zkp/code/README-tools-trusted-setup.md).

Please be patient - you can check progress in the terminal window and by using `docker stats` in another terminal.

You just created all the files needed to generate zk-SNARKs. The proving keys, verifying keys and constraint files will allow you to create hidden tokens, move them under zero knowledge and then
recover them — both for fungible (ERC-20) and enhanced non-fungible (Xcert) tokens.

Note that there is a bug in web3js which means you can get a string of npm errors if you run `npm ci` more than once. If this happens to you, delete all of the node modules and run npm ci again:

```sh
rm -rf node_modules
npm ci
```

### Starting the present fork of Nightfall by 0xcert

If you have pulled new changes from the repo, first run

```sh
docker-compose build
```

:night_with_stars: We're ready to go! Run the demo:

```sh
./zkp-demo
```

and wait until you see the message `Compiled successfully` in the console.

This brings up each microservice using docker-compose and finally builds a UI running on a local Angular server.

Navigate your web browser to <http://nightfall.docker> to start using Nightfall (give everything enough time to start up). There are instructions on how to use the application in the [UI.md](./UI.md) file.

Note that ./zkp-demo has deployed an ERC-20 and Xcert contract for you (specifically FToken.sol and NFTokenMetada.sol). These are designed to allow anyone to mint tokens for demonstration purposes. You will probably want to curtail this behavior in anything but a demonstration.

The UI pulls token names from the contracts you deploy. In the present case, the tokens are called EY OpsCoin for the ERC-20 and PCCToken for Xcert.

Note that it can take up to 10 mins to compute a transfer proof (depending on your machine) and the demonstration UI is intentionally modal while this happens (even though the action returns a promise). You can see what's happening if you look at the terminal where you ran `./zkp-demo`.

If you want to close the application, make sure to stop containers and remove containers, networks, volumes, and images created by up, using

```sh
docker-compose down -v
```

### To run tests (or if UI is not preferred)

After following the steps from 'Installing the Nightfall fork by 0xcert' section,

Sometimes, there is a volume conflict, please run `docker volume rm nightfall_zkp-code.`

Then run

```sh
make truffle-compile && make truffle-migrate && make zkp-start
```

and wait until you see the message `VK setup complete` in the console.

To run tests of ZKP service, open another terminal and run

```sh
make zkp-test
```

The relevant files for these tests can be found under `zkp/__tests__` and `offchain/__tests__` directories.

- `f-token-controller.test.js` - These are units tests to verify mint, transfer, and burn of ERC-20 tokens and ERC-20 commitments
- `nf-token-controller.test.js` - These are units tests to verify mint, transfer, and burn of Xcert (enhanced ERC-721) tokens and Xcert commitments
- `utils.test.js` - These are unit tests for utils used for running the tests.

Note that the zkp service tests take a while to run (approx. 2 hours).

## Using other networks

The demo mode uses Ganache-cli as a blockchain emulator. This is easier than using a true blockchain client but has the disadvantage that Ganache-cli doesn't currently support the Whisper protocol, used 
by this fork of Nightfall by 0xcert for exchanging secrets between sender and recipient. Accordingly, we've written a Whisper stub, which will emulate Whisper for participants who are all on the same node server. If
you want to run across multiple blockchain nodes and server instances, then replace all occurrences of the words `whisper-controller-stub` with `whisper-controller` in the code — but you will need to
use Geth rather than Ganache-cli and construct an appropriate Docker container to replace the Ganache one we provide.

## Acknowledgements

Team Nightfall thanks those who have indirectly contributed to it, with the ideas and tools that they have shared with the community:  
[ZoKrates](https://hub.docker.com/r/michaelconnor/zok)  
[Libsnark](https://github.com/scipr-lab/libsnark)  
[Zcash](https://github.com/zcash/zcash)  
[GM17](https://eprint.iacr.org/2017/540.pdf)
