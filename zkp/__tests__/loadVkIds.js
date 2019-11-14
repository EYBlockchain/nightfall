import bc from '../src/web3';
import vk from '../src/vk-controller';

module.exports = async function loadVkIds() {
  if (!(await bc.isConnected())) return;
  await vk.runController();
};
