# trusted setup tools

Command line tool for performing a zk-SNARK trusted setup - i.e. creation of a verification key and
a proving key from a .pcode file using ZoKrates.

## Warnings

### Non-deterministic randomness

This tool is intended for quickly generating a (proving key, verification key) pair. The 'trusted
setup' of this pair includes a source of randomness, which would change each time you repeat a
trusted setup for a particular set of logic gates. Therefore, if you wish to generate 'proofs'
(zk-SNARKs) to be verified against a verification key which has already been stored on the Ethereum
mainnet **then you should not use this tool!** Why? Because for each verification key stored
on-chain, there is a corresponding and unique proving key which was generated at the same time, from
the same randomness. It is this proving key which you must use to generate proofs; otherwise your
proofs will not verify against the verification key which has already been stored on-chain. If you
wish to generate a proof against an existing, already-deployed verification key, you will need to
request the corresponding proving key from the creator of the verification key. Note: proving keys
can be gigabytes in size.

### ZoKrates

Note: `npm run setupAll` pulls an image of zokrates from dockerhub (see src/config.js for the
current zokrates image being used). Since ZoKrates is still a fast-changing project (with many
breaking changes being pushed to its repo), it is likely that this opensource Nightfall repo will
lag behind the latest zokrates images and DSL syntax. This tool will need to updated alongside any
new versions of zokrates.

## Requirements

### Docker

Install docker.

You will need to allocate _significant_ computer resources to Docker Engine.

**Minimum specification** (known to work for testers): 2 CPUs, 8GiB Memory, 4 GiB Swap _Note: The
tool has been known to fail if less Swap is allocated. Using swap allows the container to write
excess memory requirements to disk when the container has exhausted all the RAM that is available to
it._

**Recommended**: 8 CPUs, 16 GiB Memory, 4 GiB Swap.

If insufficient resources are allocated to Docker, then ZoKrates might silently 'fall over' within
its container - **this is the most common problem encountered by those who are new to the project**.

### .code syntax

ZoKrates uses a Domain Specific Language (DSL) which enables constraints to be written in a
human-readable language. These DSL files have a '.code' file extension.

index.js is written to interpret .code syntax.

## Quick start

From the root directory, you can run the trusted setup on all folders under `zkp/code/gm17` by
running:

`npm run setupAll`

### Running Trusted Setup On One Code File

Alternatively, you can run the trusted setup on a specific code file by running:

`npm run setup -- -i gm17/<Code File Directory≥/`

For example: `npm run setup -- -i gm17/ft-mint`

Recommended initial filing structure:

```sh
zkp
  |
  code
    |
    gm17
      |
      ft-mint
        |
        ft-mint.code

      ft-transfer
        |
        ft-transfer.code

    pghr13 // note: pghr13 is not supported in the Nightfall repo - but index.js only supports it to mirror zokrates.
      |
      ft-mint
        |
        ft-mint.code

      ft-transfer
        |
        ft-transfer.code

    safe-dump   // required folder, in case of accidental overwriting from mounting of containers from the host.
      |
```

Example to compile and generate a new (proving key, verification key) pair for a 'fungible token
mint' in this context: `npm run setup -- -i gm17/ft-mint/`

New files following the use of `npm run setup -- -i gm17/ft-mint/`:

```sh
zkp
  |
  code
    |
    gm17
      |
      ft-mint
        |
        ft-mint-vk.json   // verification key in json format
        ft-mint.code
        out   // machine-readable file
        out.code   // flattening of the '.code' into a R1CS (rank-1 constraint system)
        proving.key   // proving key, used for generating proofs
        variables.inf   // a list of the variables used in the R1CS
        verification.key   // verification key
        verifier.sol   // example of a Verifier solidity contract (not compliant with EIP1922)

      ft-transfer
        |
        ft-transfer.code

    pghr13 // note: pghr13 is not supported in the Nightfall repo - but index.js only supports it to mirror zokrates.
      |
      ft-mint
        |
        ft-mint.code

      ft-transfer
        |
        ft-transfer.code

    safe-dump
      |
```

### Suppress Console Logs

`-s` OPTIONAL `-s` is for **suppression** of lengthy console outputs from the zokrates container. If
`-s` is included, then lengthy console outputs will be suppressed. If `-s` is not included, all of
the zokrates console outputs will be streamed to your console.

## Mounting

`npm run setup` will bind-mount from your local machine to a containerized image of zokrates.

## Outputs

`npm run setup` will:

- Run the following zokrates commands within a mounted container:
  - compile
  - setup
  - compute-witness (if the optional -a argument is given)
  - export-verifier
- Save any newly created files in path/to/nightfall/zkp/code/gm17/parent-dir-of-pcode/
