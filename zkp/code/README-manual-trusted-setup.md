#Manual Trusted Setup

Instructions for manually generating the verification keys and proving keys for ZoKrates from the
.pcode files.

Transpile the .pcode

**Note**: To avoid manual setup, you can instead use the automated trusted setup tool from the
command line: `cd path/to/nightfall/zkp/code/`  
`node index.js`  
See the dedicated [README](./README-trusted-setup.md) for detailed instructions.

##Manual setup From your local machine's command line:

`cd path/to/nightfall/zkp/code/gm17/`  
`ls`

You should see six folders: ft-burn, ft-mint, ft-transfer, nft-burn, nft-mint, nft-transfer. We'll
give an example of manually performing the trusted setup for a nft-mint.

Let's inspect the nft-mint folder:

`cd nft-mint`  
`ls`

If you've newly cloned the Nightfall repository, you'll only see one file: `nft-mint.code`.

Now we can run ZoKrates.

`cd path/to/nightfall/zkp/code/`

Mount to a containerized image of zokrates (we use an image called
'[michaelconnor/zok:2Jan2019](https://hub.docker.com/r/michaelconnor/zok)' in this example):

`docker run -v $PWD/gm17/nft-mint:/home/zokrates/code -ti michaelconnor/zok:2Jan2019 /bin/bash`

Now you're in the zokrates container.

From this ZoKrates command line:

`cd /home/zokrates/`

`ls`

Ensure there is a folder called `code` (which only exists because we mounted our local machine's
'code' folder to here when we ran Docker) and an executable file called `zokrates` in here.

Compile your .code file

`./zokrates compile -i code/nft-mint.code`

Perform the trusted setup to generate proving key files: `./zokrates setup`

'JSONify' the verification key:

`./zokrates export-verifier`

This produces a `verifier.sol` file in /home/zokrates/ which contains a solidity-formatted
verification key.

Copy all of the output files to the 'code' folder, so that they appear on your local machine:

`cp * code`

Keep the container open for now.

From a new terminal window on your local machine:

Navigate to the folder which contains `key-extractor-standalone.js`:

`cd path/to/nightfall/zkp/code/`

Extract the verification key from `verifier.sol` (which in this example is saved in
`gm17/nft-mint/verifier.sol` (relative to your pwd) on your local machine). We save it to a newly
created json file:

`node key-extractor-standalone.js -i gm17/nft-mint/verifier.sol >nft-mint-vk.json`

We're all done! We have the proving key and verification key for nft-mint.code. All saved on our
local machine.

You should be able to now close your container. The below exits and removes all containers:

`exit` `` docker stop `docker ps -aq `` `` docker rm `docker ps -aq ``
