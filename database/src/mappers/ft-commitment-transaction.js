/*
 *  this mapper on transfer case.
 *  for rest of the operation erc20Commitment mapper is used.
 *  as usecase is identical
 */

export default function({ outputCommitments, inputCommitments, sender, receiver }) {
  return {
    [outputCommitments && 'output_commitments']:
      outputCommitments &&
      outputCommitments.map(
        ({ value, salt, commitment, commitmentIndex, owner, receiver: _receiver }) => {
          return {
            value,
            salt,
            commitment,
            commitment_index: commitmentIndex,
            owner:
              (owner && { name: owner.name, public_key: owner.publicKey }) ||
              (_receiver && { name: _receiver.name, public_key: _receiver.publicKey }),
          };
        },
      ),
    [inputCommitments ? 'input_commitments' : undefined]: inputCommitments,
    [sender && 'sender']: sender && { ...sender, public_key: sender.publicKey },
    [receiver && 'receiver']: receiver && { ...receiver, public_key: receiver.publicKey },
  };
}
