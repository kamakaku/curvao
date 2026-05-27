const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase('http://127.0.0.1:8090');

async function test() {
  try {
    await pb.collection('stadiums').getFullList({ expand: 'club', sort: 'name' });
    console.log('stadiums ok');
  } catch(e) { console.error('stadiums failed', e.message); }
}

test();
