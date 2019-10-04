# Nightfall Zero-Knowledge Proof Service

*This module is part of Nightfall. Most users will only be interested in using the application as a whole, we direct those readers to [the main README](../../README.md). This file provides additional information on how this module works so you can learn about, tinker and improve it.*

This module is responsbile for setting up cryptographic key pairs which, relying on the magic of zk-SNARKs, allow one party to perform a computation and another to confirm it while avoiding information flow from the former to the latter. Nightfall exploits this to allow transfer of tokens while hiding the origin, destination, and even identity of these tokens.

## Tasks you can perform

### Generate key pairs

You will need key pairs to run the full application. And the `setupAll` script does indeed perform this step as part of the demonstration [in the main project README](../README.md). Generating the key pairs uses randomness as an input, so every time you setup, the pairs will be different. **If you are attaching Nightfall to an existing deployment then you will import those keys and you will NOT generate your own key pairs** since yours would be incompatible with the deployed application.

⚠️ This task will run approximately one to three hours depending on your machine.

📖 ​This task has a recipe in [the Nightfall makefile](../Makefile), execute it using `make zkp-generate-keys` from the top-level folder. Or you can directly run:

```sh
docker-compose run --rm zkp --env NODE_ENV=setup npx babel-node code/index.js
```

### Run zkp service unit tests

*Requires key pairs to be generated already.*

After following the steps from [the main README.md](../README.md), "Installing Nightfall"' section,

There is a volume conflict sometimes, please run `docker volume rm nightfall_zkp-code`

Then run

```sh
make truffle-compile truffle-migrate
npm run generate-keys
```

and wait until you see the message `VK setup complete` in the console.

To run tests of ZKP service, open another terminal and run

```sh
make zkp-test
```

The relevant files for these tests can be found under `zkp/__tests__` and `offchain/__tests__`
directories.

- `f-token-controller.test.js` - These are units tests to verify mint, transfer and burn of ERC-20
  tokens and ERC-20 commitments
- `nf-token-controller.test.js` - These are units tests to verify mint, transfer and burn of ERC-721
  tokens and ERC-721 commitments
- `utils.test.js` - These are unit tests for utils used for running the tests.

Note that, the zkp service tests take a while to run (approx. 2 hours)


### Development

Running the zkp module as part of the fully application is handled by Docker Compose. But you will be running this directly on your machine. Prerequesites for development of Nightfall are documented in [the main project README](../README.md). Satisfy those first before proceeding.

Build and run service (on port 80)

```sh
# These instructions are interpreted from docker-compose.yml, zkp section, and the zkp Dockerfile
cd zkp
mkdir -p node_modules
cp -r ../zkp-utils node_modules
cp -r ../account-utils src
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