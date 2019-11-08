import bc from '../src/web3';
import vk from '../src/vk-controller';

(async function loadVkIds() {
  if (!(await bc.isConnected())) return;
  await vk.runController();
})();
