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

// Mapping deck archetypes to their corresponding Pokemon sprite IDs
const spriteMapping = {
  'Charizard ex': {
    pokemon_id: 6, // Charizard
    sprite_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png'
  },
  'Miraidon ex': {
    pokemon_id: 1008, // Miraidon
    sprite_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1008.png'
  },
  'Pikachu ex': {
    pokemon_id: 25, // Pikachu
    sprite_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png'
  },
  'Lost Box': {
    pokemon_id: 592, // Frillish (represents "Lost" theme)
    sprite_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/592.png'
  },
  'Pidgeot Control': {
    pokemon_id: 18, // Pidgeot
    sprite_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/18.png'
  },
  'Chien-Pao ex': {
    pokemon_id: 1002, // Chien-Pao
    sprite_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1002.png'
  },
  'Roaring Moon ex': {
    pokemon_id: 1005, // Roaring Moon
    sprite_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1005.png'
  },
  'Iron Valiant ex': {
    pokemon_id: 1006, // Iron Valiant
    sprite_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1006.png'
  },
  'Gardevoir ex': {
    pokemon_id: 282, // Gardevoir
    sprite_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/282.png'
  },
  'Gholdengo ex': {
    pokemon_id: 1000, // Gholdengo
    sprite_url: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1000.png'
  }
};

async function updateSprites() {
  try {
    console.log('Starting sprite URL updates...');

    // Update deck_archetype_1 table
    console.log('\nUpdating deck_archetype_1 table...');
    for (const [archetypeName, spriteInfo] of Object.entries(spriteMapping)) {
      const { data, error } = await supabase
        .from('deck_archetype_1')
        .update({ image_url: spriteInfo.sprite_url })
        .eq('Name', archetypeName);
      
      if (error) {
        console.log(`Error updating ${archetypeName} in deck_archetype_1:`, error);
      } else {
        console.log(`✓ Updated ${archetypeName} → Pokemon #${spriteInfo.pokemon_id}`);
      }
    }

    // Update deck_archetype_2 table
    console.log('\nUpdating deck_archetype_2 table...');
    for (const [archetypeName, spriteInfo] of Object.entries(spriteMapping)) {
      const { data, error } = await supabase
        .from('deck_archetype_2')
        .update({ image_url: spriteInfo.sprite_url })
        .eq('Name', archetypeName);
      
      if (error) {
        console.log(`Error updating ${archetypeName} in deck_archetype_2:`, error);
      } else {
        console.log(`✓ Updated ${archetypeName} → Pokemon #${spriteInfo.pokemon_id}`);
      }
    }

    console.log('\n🎉 Sprite update completed successfully!');
    console.log('All deck archetypes now use pixelated Pokemon sprites instead of card images.');

    // Verify the updates
    console.log('\n--- Verification ---');
    const { data: sampleData, error: verifyError } = await supabase
      .from('deck_archetype_1')
      .select('Name, image_url')
      .limit(3);
    
    if (!verifyError && sampleData) {
      console.log('Sample updated records:');
      sampleData.forEach(record => {
        console.log(`- ${record.Name}: ${record.image_url}`);
      });
    }

  } catch (error) {
    console.error('Error updating sprites:', error);
  }
}

updateSprites();