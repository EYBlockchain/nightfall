export default function({ name, email, address, shhIdentity, secretKey, publicKey }) {
  return {
    [name ? 'name' : undefined]: name,
    [email ? 'email' : undefined]: email,
    [address ? 'address' : undefined]: address ? address.toLowerCase() : undefined,
    [shhIdentity ? 'shhIdentity' : undefined]: shhIdentity,
    [secretKey ? 'secretKey' : undefined]: secretKey,
    [publicKey ? 'publicKey' : undefined]: publicKey,
  };
}
