# Nightfall

Nightfall integrates a set of smart contracts and microservices, and the ZoKrates zk-snark toolkit,
to enable standard ERC-20 and ERC-721 tokens to be transacted on the Ethereum blockchain with
complete privacy. It is an experimental solution and still being actively developed. We decided to
share our research work in the belief that this will speed adoption of public blockchains. This is
not intended to be a production-ready application and we do not recommend that you use it as such.
If it accelerates your own work, then we are pleased to have helped. We hope that people will feel
motivated to contribute their own ideas and improvements.

**Note that this code has not yet completed a security review and therefore we strongly recommend
that you do not use it in production or to transfer items of material value. We take no
responsibility for any loss you may incur through the use of this code.**

As well as this file, please be sure to check out:

- [The Whitepaper](./doc/whitepaper/nightfall-v1.pdf) for technical details on the protocols and
  their application herein.
- [contributions.md](./contributing.md) to find out how to contribute code.
- [limitations.md](./limitations.md) to understand the limitations of the current code.
- [license.md](./license.md) to understand how we have placed this code completely in the public
  domain, without restrictions (but note that Nightfall makes use of other open source code which
  _does_ apply licence conditions).
- [UI.md](./UI.md) to learn how to drive the demonstration UI and make transactions.
- [SECURITY.md](./SECURITY.md) to learn about how we handle security issues.

## Security updates

Critical security updates will be listed
[here](https://github.com/EYBlockchain/nightfall/security/advisories/GHSA-36j7-5gjq-gq3w).
If you had previously installed Nightfall prior to one of these security updates, please pull the
latest code, and follow the extra re-installation steps.

## Getting started

These instructions give the most direct path to a working Nightfall setup. The application is
compute-intensive and so a high-end processor is preferred. Depending on your machine, setup can
take one to several hours.

If you are familiar with [Truffle](https://github.com/trufflesuite/truffle#readme) and would like a
Truffle-specific way to get started, check out the
[Nightfall Truffle Box](https://github.com/truffle-box/nightfall-box#nightfall-truffle-box).

### Supported hardware & prerequisites

Mac and Linux machines with at least 16GB of memory and 10GB of disk space are supported.

The Nightfall demonstration requires the following software to run:

- Docker
  - Launch Docker Desktop (on Mac, it is on the menu bar) and set memory to 8GB with 4GB of swap
    space (minimum - 12GB memory is better) or 16GB of memory with 512MB of swap. **The default
    values for Docker Desktop will NOT work. No, they really won't**.
- Python
  - Be sure npm is setup to use v2.7 of python, not python3. To check the python version, run
    `python --version`
  - You may need to run `npm config set python /usr/bin/python2.7` (or wherever your python 2
    location is)
- Node (tested with node 10.15.3) with npm and node-gyp.
  - Will not work with node v12. To check the node version, run `node --version`
  - If using mac/brew, then you may need to run `brew install node@10` and
    `brew link --overwrite node@10 --force`
- Xcode Command line tools:
  - If running macOS, install Xcode then run `xcode-select --install` to install command line tools.

### Starting servers

Start Docker:

- On Mac, open Docker.app.

### Installing Nightfall

Clone the Nightfall repository and use a terminal to enter the directory.

For Linux users:

- Change permission for the directory

  ```sh
  sudo chmod 777 -R zkp/code/
  ```
- Add the Linux user to docker group to run Docker commands without sudo ([read more](https://docs.docker.com/install/linux/linux-postinstall/)). Then log out and enter again.

  ```sh
  sudo groupadd docker
  sudo usermod --append --groups docker $USER
  ```    

Next pull a compatible Docker image of ZoKrates

```sh
docker pull zokrates/zokrates:0.4.11
```

Next we have to generate the keys and constraint files for Zero Knowledge Proofs
([read more](./zkp/code/README-trusted-setup.md)), this is about 7GB and depends on randomness
for security. This step can take a while, depending on your hardware. Before you start, check once
more that you have provisioned enough memory for Docker, as described above:

```sh
./nightfall-generate-trusted-setup
```

Note that this is a completely automated run: although questions will be asked by the script they
will automatically receive a 'yes' answer. Further documentation on the setup process is in
[the zkp module documentation](zkp/README.md).

Please be patient - you can check progress in the terminal window and by using `docker stats` in
another terminal.

You just created all the files needed to generate zk-SNARKs. The proving keys, verifying keys and
constraint files will allow you to create hidden tokens, move them under zero knowledge and then
recover them — both for fungible (ERC-20) and non-fungible (ERC-721) tokens.

### Starting Nightfall

If you have pulled new changes from the repo, then first run

```sh
docker-compose build
```

If any of the `.pcode` or `.code` files have been modified by new changes then, before anything
else, you will need to re-run

```sh
./nightfall-generate-trusted-setup
```

:night_with_stars: We're ready to go! Be sure to be in the main directory and run the demo:

```sh
./nightfall
```

and wait until you see the message `Compiled successfully` in the console.

This brings up each microservice using docker-compose and finally builds a UI running on a local
Angular server.

Navigate your web browser to <http://localhost:8000> to start using Nightfall (give everything
enough time to start up). There are instructions on how to use the application in the
[UI.md](./UI.md) file.

Note that ./nightfall has deployed an ERC-20 and ERC-721 contract for you (specifically FToken.sol
and NFTokenMetada.sol). These are designed to allow anyone to mint tokens for demonstration
purposes. You will probably want to curtail this behaviour in anything but a demonstration.

The UI pulls token names from the contracts you deploy. In the present case, the tokens are called
EY OpsCoin for the ERC-20 and EY Token for ERC-721.

Note that it can take up to 10 mins to compute a transfer proof (depending on your machine) and the
demonstration UI is intentionally modal while this happens (even though the action returns a
promise). You can see what's happening if you look at the terminal where you ran `./nightfall`.

If you want to close the application, make sure to stop containers and remove containers, networks,
volumes, and images created by up, using

```sh
docker-compose down -v
```

### To run zkp service unit tests

See [the zkp module documentation](zkp/README.md), "run zkp unit tests".

### To run Nightfall integration test

Be sure to be in the main directory and then open terminal and run

```sh
./nightfall-test
```

- Mac
  - Test suites will open a terminal, where you can see test container's log. And, this terminal
    will close automatically.
  - configure `Terminal.app` to close window when shell exits `exit`.

## Using other ERC-20 and ERC-721 contracts

Nightfall will operate with any ERC-20 and ERC-721 compliant contract. The contracts' addresses are
fed into FTokenShield.sol and NFTokenShield.sol respectively during the Truffle migration and cannot
be changed subsequently. If you wish to use pre-existing ERC-20 and ERC-721 contracts then edit
`2_Shield_migration.js` so that the address of the pre-existing ERC-20 contract is passed to
FTokenShield and the address of the pre-existing ERC-721 contract is passed to NFTokenShield i.e.
replace `FToken.address` and `NFTokenMetadata.address`. This can also be done from UI, by clicking
on the user to go to settings, then clicking on contracts option in this page. A new shield contract
address that has been deployed separately can be provided here. This new contract will be a
replacement for NFTokenShield.sol or FTokenShield.sol. Each of these contracts currently shields the
tokens of an ER721 or ERC20 contract instance respectively.

## Using other networks

The demo mode uses Ganache-cli as a blockchain emulator. This is easier than using a true blockchain
client but has the disadvantage that Ganache-cli doesn't currently support the Whisper protocol,
which Nightfall uses for exchanging secrets between sender and receiver. Accordingly we've written
a Whisper stub, which will emulate whisper for participants who are all on the same node server. If
you want to run across multiple blockchain nodes and server instances then replace all occurrences
of the words `whisper-controller-stub` with `whisper-controller` in the code — but you will need to
use Geth rather than Ganache-cli and construct an appropriate Docker container to replace the
Ganache one we provide

## Acknowledgements

Team Nightfall thanks those who have indirectly contributed to it, with the ideas and tools that
they have shared with the community:

- [ZoKrates](https://hub.docker.com/r/michaelconnor/zok)
- [Libsnark](https://github.com/scipr-lab/libsnark)
- [Zcash](https://github.com/zcash/zcash)
- [GM17](https://eprint.iacr.org/2017/540.pdf)
- [0xcert](https://github.com/0xcert/ethereum-erc721/)
- [OpenZeppelin](https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/token/ERC20/ERC20.sol)
