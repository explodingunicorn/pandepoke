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

// Valid deck combinations with proper two-Pokemon setups
const validDeckSetups = [
  // Single Pokemon decks (only deck_archetype_1, no deck_archetype_2)
  { type: 'single', primary: 'Gardevoir', secondary: null },
  { type: 'single', primary: 'Dragapult', secondary: null },
  { type: 'single', primary: 'Gholdengo', secondary: null },
  { type: 'single', primary: 'Joltik', secondary: null }, // Joltik Box
  
  // Two-Pokemon combination decks (both deck_archetype_1 and deck_archetype_2)
  { type: 'combo', primary: 'Dragapult', secondary: 'Charizard' },
  { type: 'combo', primary: 'Gholdengo', secondary: 'Dragapult' },
  { type: 'combo', primary: 'Raging Bolt', secondary: 'Ogerpon' },
  { type: 'combo', primary: 'Grimmsnarl', secondary: 'Froslass' },
  { type: 'combo', primary: 'Dragapult', secondary: 'Dusknoir' },
  { type: 'combo', primary: 'Flareon', secondary: 'Noctowl' },
];

async function createTwoPokemonCombos() {
  try {
    console.log('Creating proper two-Pokemon deck combinations...');

    // Get all current deck archetype IDs
    const { data: deckArchetypes, error: deckError } = await supabase
      .from('deck_archetype_1')
      .select('id, Name');
    
    if (deckError) {
      console.log('Error fetching deck archetypes:', deckError);
      return;
    }

    // Create a mapping of Pokemon names to IDs
    const pokemonNameToId = {};
    deckArchetypes.forEach(deck => {
      pokemonNameToId[deck.Name] = deck.id;
    });

    console.log('Available Pokemon:');
    Object.keys(pokemonNameToId).forEach(name => {
      console.log(`- ${name}: ID ${pokemonNameToId[name]}`);
    });

    // Get all tournament results
    const { data: results, error: resultError } = await supabase
      .from('result')
      .select('id, player_id, week_start, wins, losses, ties');
    
    if (resultError) {
      console.log('Error fetching results:', resultError);
      return;
    }

    console.log(`\nUpdating ${results.length} tournament results with proper two-Pokemon combinations...`);

    // Update each result with a valid deck setup
    for (const result of results) {
      // Pick a random valid deck setup
      const setup = validDeckSetups[Math.floor(Math.random() * validDeckSetups.length)];
      
      const primaryId = pokemonNameToId[setup.primary];
      const secondaryId = setup.secondary ? pokemonNameToId[setup.secondary] : null;

      if (!primaryId) {
        console.log(`Warning: Pokemon "${setup.primary}" not found in database`);
        continue;
      }

      if (setup.secondary && !secondaryId) {
        console.log(`Warning: Pokemon "${setup.secondary}" not found in database`);
        continue;
      }

      const { error: updateError } = await supabase
        .from('result')
        .update({
          deck_archetype_1_id: primaryId,
          deck_archetype_2_id: secondaryId
        })
        .eq('id', result.id);

      if (updateError) {
        console.log(`Error updating result ${result.id}:`, updateError);
      } else {
        const deckText = secondaryId ? `${setup.primary} + ${setup.secondary}` : setup.primary;
        console.log(`✓ Result ${result.id}: ${deckText} (${setup.type})`);
      }
    }

    console.log('\n🎉 Two-Pokemon combinations created successfully!');
    console.log('Tournament results now properly show single Pokemon or two-Pokemon combinations.');

    // Verify the results
    console.log('\n--- Sample updated results ---');
    const { data: sampleResults, error: verifyError } = await supabase
      .from('result')
      .select(`
        id, wins, losses, ties,
        deck_archetype_1 (Name, image_url),
        deck_archetype_2 (Name, image_url)
      `)
      .limit(8);
    
    if (!verifyError && sampleResults) {
      sampleResults.forEach(result => {
        const deck1 = result.deck_archetype_1?.Name || 'Unknown';
        const deck2 = result.deck_archetype_2?.Name;
        const deckText = deck2 ? `${deck1} + ${deck2}` : deck1;
        const type = deck2 ? 'COMBO' : 'SINGLE';
        console.log(`- Result ${result.id}: ${deckText} [${type}] (${result.wins}W/${result.losses}L/${result.ties}T)`);
      });
    }

  } catch (error) {
    console.error('Error creating two-Pokemon combinations:', error);
  }
}

createTwoPokemonCombos();