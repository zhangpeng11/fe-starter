import {$test, assert} from '../../utils/ut'
import router from '../router'

$test(async () => {
  const start = Promise.resolve();
  const end = start.then(() => {
    router.push('/home');
    assert(location.pathname == '/home');
    return wait();
  }).then(() => {
    assert(document.querySelector('#home-title'));
  });

  try {
    await end;
  } catch(e) {
    throw e;
  }
}, 'router push should correct');

function wait(interval?: number) {
  return new Promise(r => {
    setTimeout(r, interval || 500);
  });
}


