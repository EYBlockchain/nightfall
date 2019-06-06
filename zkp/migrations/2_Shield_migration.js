const Verifier_Registry = artifacts.require('Verifier_Registry.sol');

const BN256G2 = artifacts.require('BN256G2');
const GM17_v0 = artifacts.require('GM17_v0.sol');

const FToken = artifacts.require('FToken.sol');
const Xcert = artifacts.require('XcertToken');
const FTokenShield = artifacts.require('FTokenShield.sol');
const NFTokenShield = artifacts.require('NFTokenShield.sol');

module.exports = function(deployer) {
  deployer.then(async () => {
    await deployer.deploy(Verifier_Registry);

    await deployer.deploy(BN256G2);

    await deployer.link(BN256G2, [GM17_v0]);

    await deployer.deploy(GM17_v0, Verifier_Registry.address);

    await deployer.deploy(Xcert);

    await deployer.deploy(NFTokenShield, Verifier_Registry.address, GM17_v0.address, Xcert.address);

    await deployer.deploy(FToken);

    await deployer.deploy(FTokenShield, Verifier_Registry.address, GM17_v0.address, FToken.address);
  });
};
