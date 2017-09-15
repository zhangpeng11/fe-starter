const {walk} = require('../utils/fs');
const {assert, $test} = require('../utils/ut');

$test(() => {
    assert(walk('./webpack').length == 5);
}, 'should get files in dir');
$test(() => {
    try {
        walk('./yarn.lock');
        throw new Error('tmp');
    } catch(e) {
        if (e.message == 'tmp') {
            assert(0);
        }
    }
}, 'should throw error');


