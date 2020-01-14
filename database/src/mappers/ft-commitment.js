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
    [isMinted ? 'is_minted' : undefined]: isMinted,
    [isTransferred ? 'is_transferred' : undefined]: isTransferred,
    [isBurned ? 'is_burned' : undefined]: isBurned,
    [isReceived ? 'is_received' : undefined]: isReceived,
    [isChange ? 'is_change' : undefined]: isChange,
    [isBatchTransferred ? 'is_batch_transferred' : undefined]: isBatchTransferred,
  };
  if (!outputCommitments) {
    return flags;
  }
  const [{ value, salt, commitment, commitmentIndex, owner }] = outputCommitments;
  return {
    [value && 'value']: value,
    [salt && 'salt']: salt,
    [commitment && 'commitment']: commitment,
    [commitmentIndex !== undefined ? 'commitment_index' : undefined]: commitmentIndex,
    owner: { ...owner, public_key: owner.publicKey },

    [zCorrect || zCorrect === false ? 'commitment_reconciles' : undefined]: zCorrect,
    [zOnchainCorrect || zOnchainCorrect === false
      ? 'commitment_exists_onchain'
      : undefined]: zOnchainCorrect,

    ...flags,
  };
}
