export default function({
  isMinted,
  isTransferred,
  isBurned,
  isReceived,
  isChange,
  isBatchTransferred,
  outputCommitments,
  zCorrect,
  zOnchainCorrect,
}) {
  const flags = {
    [isMinted && 'isMinted']: isMinted,
    [isTransferred && 'isTransferred']: isTransferred,
    [isBurned && 'isBurned']: isBurned,
    [isReceived && 'isReceived']: isReceived,
    [isChange && 'isChange']: isChange,
    [isBatchTransferred && 'isBatchTransferred']: isBatchTransferred,
  };
  if (!outputCommitments) {
    return flags;
  }
  const [{ value, salt, commitment, commitmentIndex, owner }] = outputCommitments;
  return {
    [value && 'value']: value,
    [salt && 'salt']: salt,
    [commitment && 'commitment']: commitment,
    [commitmentIndex !== undefined && 'commitmentIndex']: commitmentIndex,
    owner,
    ...flags,
    [zCorrect !== undefined && 'commitmentReconciles']: zCorrect,
    [zOnchainCorrect !== undefined && 'commitmentExistsOnchain']: zOnchainCorrect,
  };
}
