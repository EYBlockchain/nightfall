export default function({
  isMinted,
  isTransferred,
  isBurned,
  isReceived,
  outputCommitments,
  zCorrect,
  zOnchainCorrect,
}) {
  const flags = {
    [isMinted && 'isMinted']: isMinted,
    [isTransferred && 'isTransferred']: isTransferred,
    [isBurned && 'isBurned']: isBurned,
    [isReceived && 'isReceived']: isReceived,
  };
  if (!outputCommitments) {
    return flags;
  }
  const [{ tokenUri, tokenId, salt, commitment, commitmentIndex, owner }] = outputCommitments;
  return {
    [tokenUri && 'tokenUri']: tokenUri,
    [tokenId && 'tokenId']: tokenId,
    [salt && 'salt']: salt,
    [commitment && 'commitment']: commitment,
    [commitmentIndex !== undefined && 'commitmentIndex']: commitmentIndex,
    owner,
    ...flags,
    [zCorrect !== undefined && 'commitmentReconciles']: zCorrect,
    [zOnchainCorrect !== undefined && 'commitmentExistsOnchain']: zOnchainCorrect,
  };
}
