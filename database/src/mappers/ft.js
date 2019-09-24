export default function({
  amount,
  shieldContractAddress,

  receiver,
  receiverAddress,
  sender,
  senderAddress,

  isMinted,
  isTransferred,
  isReceived,
  isBurned,
}) {
  return {
    amount,
    shield_contract_address: shieldContractAddress,

    [receiver ? 'receiver' : undefined]: receiver,
    [receiverAddress ? 'receiver_address' : undefined]: receiverAddress,
    [sender ? 'sender' : undefined]: sender,
    [senderAddress ? 'sender_address' : undefined]: senderAddress,

    [isMinted ? 'is_minted' : undefined]: isMinted,
    [isTransferred ? 'is_transferred' : undefined]: isTransferred,
    [isReceived ? 'is_received' : undefined]: isReceived,
    [isBurned ? 'is_burned' : undefined]: isBurned,
  };
}
