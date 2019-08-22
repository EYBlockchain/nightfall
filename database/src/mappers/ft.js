export default function({
  amount,
  shieldContractAddress,

  transferee,
  transfereeAddress,
  transferor,
  transferorAddress,

  isMinted,
  isTransferred,
  isReceived,
  isBurned,
}) {
  return {
    amount,
    shield_contract_address: shieldContractAddress,

    [transferee ? 'transferee' : undefined]: transferee,
    [transfereeAddress ? 'transferee_address' : undefined]: transfereeAddress,
    [transferor ? 'transferor' : undefined]: transferor,
    [transferorAddress ? 'transferor_address' : undefined]: transferorAddress,

    [isMinted ? 'is_minted' : undefined]: isMinted,
    [isTransferred ? 'is_transferred' : undefined]: isTransferred,
    [isReceived ? 'is_received' : undefined]: isReceived,
    [isBurned ? 'is_burned' : undefined]: isBurned,
  };
}
