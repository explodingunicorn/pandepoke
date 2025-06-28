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

// Individual Pokemon that should be available for combinations
const individualPokemon = [
  {
    name: 'Gardevoir',
    pokemon_id: 282,
    sprite_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/282.png'
  },
  {
    name: 'Dragapult',
    pokemon_id: 887,
    sprite_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/887.png'
  },
  {
    name: 'Charizard',
    pokemon_id: 6,
    sprite_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png'
  },
  {
    name: 'Gholdengo',
    pokemon_id: 1000,
    sprite_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1000.png'
  },
  {
    name: 'Raging Bolt',
    pokemon_id: 1021,
    sprite_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1021.png'
  },
  {
    name: 'Ogerpon',
    pokemon_id: 1017,
    sprite_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1017.png'
  },
  {
    name: 'Grimmsnarl',
    pokemon_id: 861,
    sprite_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/861.png'
  },
  {
    name: 'Froslass',
    pokemon_id: 478,
    sprite_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/478.png'
  },
  {
    name: 'Dusknoir',
    pokemon_id: 477,
    sprite_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/477.png'
  },
  {
    name: 'Flareon',
    pokemon_id: 136,
    sprite_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/136.png'
  },
  {
    name: 'Noctowl',
    pokemon_id: 164,
    sprite_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/164.png'
  },
  {
    name: 'Joltik',
    pokemon_id: 595,
    sprite_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/595.png'
  }
];

async function addIndividualPokemon() {
  try {
    console.log('Adding individual Pokemon for deck combinations...');

    // Add individual Pokemon to both archetype tables
    console.log('\nAdding individual Pokemon to deck_archetype_1...');
    for (const pokemon of individualPokemon) {
      const { data, error } = await supabase
        .from('deck_archetype_1')
        .insert({
          Name: pokemon.name,
          image_url: pokemon.sprite_url
        });
      
      if (error) {
        console.log(`Error inserting ${pokemon.name}:`, error);
      } else {
        console.log(`✓ Added ${pokemon.name} (Pokemon #${pokemon.pokemon_id})`);
      }
    }

    console.log('\nAdding individual Pokemon to deck_archetype_2...');
    for (const pokemon of individualPokemon) {
      const { data, error } = await supabase
        .from('deck_archetype_2')
        .insert({
          Name: pokemon.name,
          image_url: pokemon.sprite_url
        });
      
      if (error) {
        console.log(`Error inserting ${pokemon.name}:`, error);
      } else {
        console.log(`✓ Added ${pokemon.name} (Pokemon #${pokemon.pokemon_id})`);
      }
    }

    console.log('\n🎉 Individual Pokemon added successfully!');
    console.log('Now we can create proper two-Pokemon deck combinations.');

    // Show the updated archetype list
    console.log('\n--- Updated deck archetype list ---');
    const { data: allDecks, error: listError } = await supabase
      .from('deck_archetype_1')
      .select('id, Name')
      .order('id');
    
    if (!listError && allDecks) {
      allDecks.forEach(deck => {
        console.log(`ID ${deck.id}: ${deck.Name}`);
      });
    }

  } catch (error) {
    console.error('Error adding individual Pokemon:', error);
  }
}

addIndividualPokemon();