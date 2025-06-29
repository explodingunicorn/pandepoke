const { createClient } = require('@supabase/supabase-js');

// Read environment variables directly from .env.local
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');

let supabaseUrl, supabaseAnonKey;
envLines.forEach(line => {
  const [key, value] = line.split('=');
  if (key === 'NEXT_PUBLIC_SUPABASE_URL') {
    supabaseUrl = value;
  } else if (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') {
    supabaseAnonKey = value;
  }
});

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Current meta deck archetypes from Limitless TCG with better sprite choices
const newDeckArchetypes = [
  {
    name: 'Gardevoir ex',
    pokemon_id: 282, // Gardevoir
    sprite_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/282.png'
  },
  {
    name: 'Raging Bolt Ogerpon',
    pokemon_id: 1021, // Raging Bolt (use front default sprite)
    sprite_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1021.png'
  },
  {
    name: 'Grimmsnarl Froslass',
    pokemon_id: 861, // Grimmsnarl
    sprite_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/861.png'
  },
  {
    name: 'Dragapult Charizard',
    pokemon_id: 887, // Dragapult
    sprite_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/887.png'
  },
  {
    name: 'Dragapult Dusknoir',
    pokemon_id: 887, // Dragapult
    sprite_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/887.png'
  },
  {
    name: 'Flareon Noctowl',
    pokemon_id: 136, // Flareon
    sprite_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/136.png'
  },
  {
    name: 'Dragapult ex',
    pokemon_id: 887, // Dragapult
    sprite_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/887.png'
  },
  {
    name: 'Joltik Box',
    pokemon_id: 595, // Joltik (better than small Pikachu)
    sprite_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/595.png'
  },
  {
    name: 'Gholdengo ex',
    pokemon_id: 1000, // Gholdengo
    sprite_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1000.png'
  },
  {
    name: 'Gholdengo Dragapult',
    pokemon_id: 1000, // Gholdengo
    sprite_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1000.png'
  }
];

async function updateToCurrentMeta() {
  try {
    console.log('Updating deck archetypes to current meta decks...');

    // Clear existing data from both tables
    console.log('\nClearing existing deck archetypes...');
    
    const { error: clear1Error } = await supabase
      .from('deck_archetype_1')
      .delete()
      .neq('id', 0); // Delete all records
    
    if (clear1Error) {
      console.log('Error clearing deck_archetype_1:', clear1Error);
    } else {
      console.log('✓ Cleared deck_archetype_1 table');
    }

    const { error: clear2Error } = await supabase
      .from('deck_archetype_2')
      .delete()
      .neq('id', 0); // Delete all records
    
    if (clear2Error) {
      console.log('Error clearing deck_archetype_2:', clear2Error);
    } else {
      console.log('✓ Cleared deck_archetype_2 table');
    }

    // Insert new deck archetypes into deck_archetype_1
    console.log('\nInserting new deck archetypes into deck_archetype_1...');
    for (const deck of newDeckArchetypes) {
      const { data, error } = await supabase
        .from('deck_archetype_1')
        .insert({
          Name: deck.name,
          image_url: deck.sprite_url
        });
      
      if (error) {
        console.log(`Error inserting ${deck.name}:`, error);
      } else {
        console.log(`✓ Inserted ${deck.name} (Pokemon #${deck.pokemon_id})`);
      }
    }

    // Insert new deck archetypes into deck_archetype_2
    console.log('\nInserting new deck archetypes into deck_archetype_2...');
    for (const deck of newDeckArchetypes) {
      const { data, error } = await supabase
        .from('deck_archetype_2')
        .insert({
          Name: deck.name,
          image_url: deck.sprite_url
        });
      
      if (error) {
        console.log(`Error inserting ${deck.name}:`, error);
      } else {
        console.log(`✓ Inserted ${deck.name} (Pokemon #${deck.pokemon_id})`);
      }
    }

    console.log('\n🎉 Meta deck update completed successfully!');
    console.log('Database now contains current tournament meta decks from Limitless TCG.');
    console.log('Note: Existing tournament results will show broken references until you update them.');

    // Show sample of new data
    console.log('\n--- Sample new deck archetypes ---');
    const { data: sampleData, error: verifyError } = await supabase
      .from('deck_archetype_1')
      .select('id, Name, image_url')
      .limit(5);
    
    if (!verifyError && sampleData) {
      sampleData.forEach(record => {
        console.log(`ID ${record.id}: ${record.Name}`);
      });
    }

  } catch (error) {
    console.error('Error updating meta decks:', error);
  }
}

updateToCurrentMeta();