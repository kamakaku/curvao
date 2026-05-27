const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase('http://127.0.0.1:8090');

async function test() {
  try {
    const list = await pb.collection('stadiums').getList(1, 1);
    console.log(list.items);
  } catch(e) { console.error('stadiums failed', e.message); }
}

test();
