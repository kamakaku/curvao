const PocketBase = require('pocketbase/cjs');

// INFO: Trage hier deine PocketBase URL und Admin-Daten ein!
const PB_URL = 'http://192.168.2.198:8090'; 
const ADMIN_EMAIL = 'hallo@desiqn.co'; 
const ADMIN_PASS = 'Neylani_2021';

const pb = new PocketBase(PB_URL);

async function migrate() {
  try {
    console.log('--- PocketBase Migration für "wanted_cards" ---');
    console.log('Versuche Admin-Login...');
    await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASS);
    console.log('Login erfolgreich!\n');

    const collections = await pb.collections.getFullList();
    const findId = (name) => collections.find(c => c.name === name)?.id;

    const usersId = findId('users');
    const playersId = findId('players');
    const matchesId = findId('matches');
    const stadiumsId = findId('stadiums');
    const clubsId = findId('clubs');
    const templatesId = findId('card_templates');

    if (!usersId) throw new Error('Collection "users" nicht gefunden!');

    console.log('Hole aktuelle "wanted_cards" Definition...');
    const wantedCollection = await pb.collections.getOne('wanted_cards');

    // Felder definieren
    const schema = [
      {
        name: 'user',
        type: 'relation',
        required: true,
        options: {
          collectionId: usersId,
          maxSelect: 1,
          displayFields: ['email', 'name']
        }
      },
      {
        name: 'targetType',
        type: 'text',
        required: true
      },
      {
        name: 'player',
        type: 'relation',
        options: {
          collectionId: playersId,
          maxSelect: 1
        }
      },
      {
        name: 'match',
        type: 'relation',
        options: {
          collectionId: matchesId,
          maxSelect: 1
        }
      },
      {
        name: 'stadium',
        type: 'relation',
        options: {
          collectionId: stadiumsId,
          maxSelect: 1
        }
      },
      {
        name: 'club',
        type: 'relation',
        options: {
          collectionId: clubsId,
          maxSelect: 1
        }
      },
      {
        name: 'cardTemplate',
        type: 'relation',
        options: {
          collectionId: templatesId,
          maxSelect: 1
        }
      },
      {
        name: 'note',
        type: 'text'
      },
      {
        name: 'season',
        type: 'text'
      },
      {
        name: 'rarityTarget',
        type: 'text'
      }
    ];

    // Vorhandene IDs beibehalten, neue hinzufügen
    wantedCollection.schema = schema;
    
    // API Rules setzen
    wantedCollection.listRule = 'user = @request.auth.id';
    wantedCollection.viewRule = 'user = @request.auth.id';
    wantedCollection.createRule = '@request.auth.id != ""';
    wantedCollection.updateRule = 'user = @request.auth.id';
    wantedCollection.deleteRule = 'user = @request.auth.id';

    console.log('Aktualisiere Collection "wanted_cards"...');
    await pb.collections.update(wantedCollection.id, wantedCollection);

    console.log('\n✅ ERFOLG: Die Collection "wanted_cards" wurde aktualisiert!');
    console.log('Du kannst das Bookmarken jetzt in der App testen.');

  } catch (error) {
    console.error('\n❌ FEHLER bei der Migration:');
    console.error(error.message);
    if (error.data) console.error('Details:', JSON.stringify(error.data));
    console.log('\nHinweis: Stelle sicher, dass ADMIN_EMAIL und ADMIN_PASS in der Datei stimmen.');
  }
}

migrate();