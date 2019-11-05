# Nightfall Zero-Knowledge Proof Service

*This module is part of Nightfall. Most users will only be interested in using the application as a whole, we direct those readers to [the main README](../../README.md). This file provides additional information on how this module works so you can learn about, tinker and improve it.*

## Tasks you can perform

### Run zkp service unit tests

You will need to have completed the trusted setup. This is done simply by running (from the Nightfall root):

```sh
./nightfall-generate-trusted-setup
```
If you have previously run the Nightfall application, you will already have completed this step and there is no need to repeat it (it takes about and hour so it's worth avoiding where possible!).

_Alternatively_, if you change one of the proofs in the Nightfall suite, then you can perform the
trusted setup for just that proof, which is a lot faster. You need to change to the zkp sub directory
to do that:

```sh
cd zkp
npm run setup -- -i gm17/<dir containing your proof>
cd ..
```

Also, before running these tests, don't forget to make sure you have a current version of the zkp container.  If in doubt, run:

```sh
docker-compose build zkp
```

After your trusted setup is complete run:

```sh
docker-compose run --rm truffle-zkp compile --all
docker-compose run --rm truffle-zkp migrate --reset --network=default
```

This will run up ganache in a container and load all of the nightfall contracts.

To run the zkp unit tests:

```sh
docker-compose run --rm zkp npm test
```

The relevant files for these tests can be found under `zkp/__tests__`.

- `f-token-controller.test.js` - These are units tests to verify mint, transfer and burn of ERC-20
  tokens and ERC-20 commitments
- `nf-token-controller.test.js` - These are units tests to verify mint, transfer and burn of ERC-721
  tokens and ERC-721 commitments
- `utils.test.js` - These are unit tests for utils used for running the tests.

Note that the zkp service tests take a while to run (approx. 1 hour)


### Development

Running the zkp module as part of the fully application is handled by Docker Compose. But you will be running this directly on your machine. Prerequesites for development of Nightfall are documented in [the main project README](../README.md). Satisfy those first before proceeding.

Build and run service (on port 80)

```sh
# These instructions are interpreted from docker-compose.yml, zkp section, and the zkp Dockerfile
cd zkp
mkdir -p node_modules
cp -r ../zkp-utils node_modules
cp -r ../config .
npm start
```

Troubleshooting

```sh
# REQUIRES NPM V6.10.1+
# Source https://github.com/ethereum/web3.js/issues/2863#issuecomment-514226742
npm update -g npm
```

Run trusted setup

```sh
NODE_ENV=setup npx babel-node code/index.js
```

Clean

```sh
rm -rf node_modules
```

## Further reading

* [README-tools-trusted-setup.md](code/README-tools-trusted-setup.md) explains the steps that npm will run in the "setup" and "setupAll" tasks.
* [README-manual-trusted-setup.md](code/README-manual-trusted-setup.md) is a deeper walkthrough of the "generating key pairs" task above.
* [README-tools-code-preprop.md](code/README-tools-code-preprop.md) explains "pcode", an abbreviated language Nightfall uses that transpiles down to the ZoKrates "code" language.
