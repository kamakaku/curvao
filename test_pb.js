const PocketBase = require('pocketbase/cjs');
const pb = new PocketBase('http://127.0.0.1:8090');

async function test() {
  try {
    const list = await pb.collection('wanted_cards').getList(1, 50);
    console.log('wanted_cards collection fetch successful');
    console.log('Count:', list.totalItems);
    if (list.items.length > 0) {
      console.log('Sample record keys:', Object.keys(list.items[0]));
      console.log('Sample record user field:', list.items[0].user || list.items[0].userId || 'NONE');
    } else {
        console.log('No records found in wanted_cards.');
        // Try creating a dummy one to see field requirements
        try {
            console.log('Trying to create dummy...');
            // This will likely fail but error message might reveal fields
            await pb.collection('wanted_cards').create({ test: 1 });
        } catch (err) {
            console.log('Create failed (expected):', err.data?.data || err.message);
        }
    }
  } catch(e) { 
    console.error('wanted_cards fetch failed:', e.message); 
  }
}

test();
