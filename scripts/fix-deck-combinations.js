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

// Valid deck combinations based on actual Limitless TCG meta
const validDeckCombinations = [
  // Single Pokemon decks (deck_archetype_2_id = null)
  { primary: 'Gardevoir ex', secondary: null },
  { primary: 'Dragapult ex', secondary: null },
  { primary: 'Gholdengo ex', secondary: null },
  
  // Two-Pokemon combination decks (both archetype IDs used)
  { primary: 'Raging Bolt Ogerpon', secondary: null }, // This is actually a dual-Pokemon deck name
  { primary: 'Grimmsnarl Froslass', secondary: null }, // This is actually a dual-Pokemon deck name
  { primary: 'Dragapult Charizard', secondary: null }, // This is actually a dual-Pokemon deck name
  { primary: 'Dragapult Dusknoir', secondary: null }, // This is actually a dual-Pokemon deck name
  { primary: 'Flareon Noctowl', secondary: null }, // This is actually a dual-Pokemon deck name
  { primary: 'Gholdengo Dragapult', secondary: null }, // This is actually a dual-Pokemon deck name
  { primary: 'Joltik Box', secondary: null }, // Box deck with multiple variants
];

async function fixDeckCombinations() {
  try {
    console.log('Fixing invalid deck combinations with realistic tournament data...');

    // Get all current deck archetype IDs
    const { data: deckArchetypes, error: deckError } = await supabase
      .from('deck_archetype_1')
      .select('id, Name');
    
    if (deckError) {
      console.log('Error fetching deck archetypes:', deckError);
      return;
    }

    // Create a mapping of deck names to IDs
    const deckNameToId = {};
    deckArchetypes.forEach(deck => {
      deckNameToId[deck.Name] = deck.id;
    });

    console.log('Available deck archetypes:');
    deckArchetypes.forEach(deck => {
      console.log(`- ID ${deck.id}: ${deck.Name}`);
    });

    // Get all tournament results
    const { data: results, error: resultError } = await supabase
      .from('result')
      .select('id, player_id, week_start, wins, losses, ties');
    
    if (resultError) {
      console.log('Error fetching results:', resultError);
      return;
    }

    console.log(`\nUpdating ${results.length} tournament results with valid deck combinations...`);

    // Update each result with a valid deck combination
    for (const result of results) {
      // Pick a random valid deck combination
      const combination = validDeckCombinations[Math.floor(Math.random() * validDeckCombinations.length)];
      
      const primaryDeckId = deckNameToId[combination.primary];
      const secondaryDeckId = combination.secondary ? deckNameToId[combination.secondary] : null;

      if (!primaryDeckId) {
        console.log(`Warning: Deck "${combination.primary}" not found in database`);
        continue;
      }

      const { error: updateError } = await supabase
        .from('result')
        .update({
          deck_archetype_1_id: primaryDeckId,
          deck_archetype_2_id: secondaryDeckId
        })
        .eq('id', result.id);

      if (updateError) {
        console.log(`Error updating result ${result.id}:`, updateError);
      } else {
        const deckText = secondaryDeckId ? `${combination.primary} + ${combination.secondary}` : combination.primary;
        console.log(`✓ Result ${result.id}: ${deckText}`);
      }
    }

    console.log('\n🎉 Deck combinations fixed successfully!');
    console.log('All tournament results now use realistic deck combinations from the competitive meta.');

    // Verify the results
    console.log('\n--- Sample updated results ---');
    const { data: sampleResults, error: verifyError } = await supabase
      .from('result')
      .select(`
        id, wins, losses, ties,
        deck_archetype_1 (Name, image_url),
        deck_archetype_2 (Name, image_url)
      `)
      .limit(5);
    
    if (!verifyError && sampleResults) {
      sampleResults.forEach(result => {
        const deck1 = result.deck_archetype_1?.Name || 'Unknown';
        const deck2 = result.deck_archetype_2?.Name;
        const deckText = deck2 ? `${deck1} + ${deck2}` : deck1;
        console.log(`- Result ${result.id}: ${deckText} (${result.wins}W/${result.losses}L/${result.ties}T)`);
      });
    }

  } catch (error) {
    console.error('Error fixing deck combinations:', error);
  }
}

fixDeckCombinations();