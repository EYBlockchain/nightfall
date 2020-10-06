# Limitations

There are currently a number of limitations to the code that users should be aware of:

## Security

The code is still undergoing a security audit and therefore security should not be assumed.

## ZK-SNARKs

The code makes use of ZK-SNARKS for transaction hiding, this approach is maximally efficient but
carries the normal requirement for trusted setup and the knowledge of exponent assumption. We hope
to address the former of these soon.

## Hash and Key lengths

Most hashes are sha256 based but truncated to 216 bits for convenience in the generation of proofs.
Keys are also 216 bit. Whilst we do not believe this has a significant impact on security in itself,
we mention it so that you can make up your own mind.

## Storage of secrets

Secrets are stored in the clear in your local Mongodb instance. Therefore this database should be
appropriately protected.

## Persistence of Whisper messages and Events

We have not implemented persistence of Whisper messages (beyond the time to live) and therefore if a
user is not logged in they may miss a transaction. If this is a problem, we recommend using a
mailserver to offload whisper messages as described in the Whisper documentation. Likewise we do not
currently search for old blockchain events.

## Use of ZoKrates Docker image

We use a ZoKrates Docker image for proof generation. This is stored separately from the main
ZoKrates github so that changes to ZoKrates do not break this code. However this means that future
improvements and bugfixes that the ZoKrates team implement will not automatically carry through into
this code.

## Oudated ZoKrates release

Our image from ZoKrates is from January 2019 and is already outdated. It might include security bugs
which have since been fixed over in the ZoKrates repository. The syntax of the ZoKrates DSL has also
changed considerably since January 2019, and therefore the `.pcode` files of Nightfall are written
in outdated syntax.

## No batching or aggregation of proofs

We currently treat each ZKP transaction as a separate event. In the future we expect to aggregate
proofs to improve efficiency of verification.

## Analysis of transactions

Zero Knowledge transactions are exactly that, an observer learns exactly nothing about the
transaction. However, this does not mean that analysis of the blockchain will in all circumstances
tell one nothing. For example if I mint 123456789 coins and send them directly to Bob, who then
converts them back into conventional ERC-20, it indicates with high probability that I just
transacted with Bob because of the disappearance and reappearance of the same unusual value. The
situation is worse with non-fungible tokens. Therefore transactions should be made with care, making
use of transactions that change fungible token values and not burning non-fungible tokens
commitments.
