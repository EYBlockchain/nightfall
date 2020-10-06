:warning: Note that Nightfall has not yet completed a security review and therefore we strongly
recommend that you do not use it in production or to transfer items of material value. We take no
responsibility for any loss you may incur through the use of this code.\*

# Production Usage Notes [DRAFT]

This file explains some of the considerations necessary to deploy Nightfall on a production network.

## Trusted setup

_People will need confidence that the trusted setup was not backdoored. Several approaches are
possible. But this is very simple and can be a minimal process._

1.  Start session on ASCII Cinema, for assurance (this is our "ceremony")
2.  Use Azure, Amazon, or Google cloud to spin up a new instance and login
3.  Repeat TEST FLIGHT steps with mainnet configuration
4.  SHA hash the keys (included in the ASCII session)
5.  End ASCII Cinema session
6.  (From outside the session) secure copy (scp) the keys out, 7 GB

Much more elaborate trusted setup ceremonies can provide additional protection and assurance against
backdoors. Such ceremonies are currently outside the scope of this document.

## Key distribution

_We need a practical way to distribute 7 GB of files. This is based on a study of Zcash and the
problems users had when downloading keys. Here is a possible approach._

1.  Publish the 7 GB of files to an Amazon S3 bucket
2.  Publish the keys to any alternate source, e.g. Dropbox
3.  Create a Torrent, publish to a reputable Torrent service (still searching), or create our own
    tracker (not preferred)
4.  Create magnet URL to everyone to download in parallel from torrent and webseeds

## Production instance documentation

1.  Create a web page (should NOT be part of Nightfall, to discuss) to document how to download
    keys, install locally and connect to this Nightfall instance
2.  Discuss policies for that server instance
3.  As current, the NFTokenMetadata contract is deployed which allows anybody to mint tokens. I
    don't see a problem with this for production uses

## References

- Zcash issues with key deployment https://github.com/zcash/zcash/issues/2695
