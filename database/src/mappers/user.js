export default function({ name, email, address, shhIdentity, secretkey, publickey }) {
  return {
    [name ? 'name' : undefined]: name,
    [email ? 'email' : undefined]: email,
    [address ? 'address' : undefined]: address ? address.toLowerCase() : undefined,
    [shhIdentity ? 'shh_identity' : undefined]: shhIdentity,
    [secretkey ? 'secretkey' : undefined]: secretkey,
    [publickey ? 'publickey' : undefined]: publickey,
  };
}
