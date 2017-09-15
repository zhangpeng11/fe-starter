import {$test, assert} from '../../utils/ut'

$test(()=> {
  let a = 1;
  let b = 2;
  assert(a != b);
}, 'a & b should be correct');

$test(() => assert(2 == 2), '1 assert should be success');

$test(async () => {
  const a = await new Promise(s => {
    setTimeout(e => s(2), 500)
  });
  assert(a == 2);
}, '3 assert should be success');


