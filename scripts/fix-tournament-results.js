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

async function fixTournamentResults() {
  try {
    console.log('Updating tournament results with new deck archetype IDs...');

    // First, get the new deck archetype IDs
    const { data: newDecks, error: deckError } = await supabase
      .from('deck_archetype_1')
      .select('id, Name')
      .gte('id', 11); // Get the newly added decks (should be ID 11+)
    
    if (deckError) {
      console.log('Error fetching new decks:', deckError);
      return;
    }

    console.log('New deck archetypes found:');
    newDecks.forEach(deck => {
      console.log(`- ID ${deck.id}: ${deck.Name}`);
    });

    // Update all existing tournament results to use new deck IDs randomly
    const { data: results, error: resultError } = await supabase
      .from('result')
      .select('id, deck_archetype_1_id, deck_archetype_2_id');
    
    if (resultError) {
      console.log('Error fetching results:', resultError);
      return;
    }

    console.log(`\nUpdating ${results.length} tournament results...`);

    for (const result of results) {
      // Randomly assign new deck archetypes
      const randomDeck1 = newDecks[Math.floor(Math.random() * newDecks.length)];
      const randomDeck2 = Math.random() < 0.7 ? newDecks[Math.floor(Math.random() * newDecks.length)] : null;

      const { error: updateError } = await supabase
        .from('result')
        .update({
          deck_archetype_1_id: randomDeck1.id,
          deck_archetype_2_id: randomDeck2 ? randomDeck2.id : null
        })
        .eq('id', result.id);

      if (updateError) {
        console.log(`Error updating result ${result.id}:`, updateError);
      } else {
        const deck2Text = randomDeck2 ? ` + ${randomDeck2.Name}` : '';
        console.log(`✓ Result ${result.id}: ${randomDeck1.Name}${deck2Text}`);
      }
    }

    // Now delete the old deck archetypes (IDs 1-10)
    console.log('\nRemoving old deck archetypes...');
    
    const { error: deleteOld1Error } = await supabase
      .from('deck_archetype_1')
      .delete()
      .lte('id', 10);
    
    if (deleteOld1Error) {
      console.log('Error deleting old deck_archetype_1 records:', deleteOld1Error);
    } else {
      console.log('✓ Removed old deck_archetype_1 records');
    }

    const { error: deleteOld2Error } = await supabase
      .from('deck_archetype_2')
      .delete()
      .lte('id', 10);
    
    if (deleteOld2Error) {
      console.log('Error deleting old deck_archetype_2 records:', deleteOld2Error);
    } else {
      console.log('✓ Removed old deck_archetype_2 records');
    }

    console.log('\n🎉 Tournament results updated successfully!');
    console.log('All tournament results now reference current meta deck archetypes.');

  } catch (error) {
    console.error('Error fixing tournament results:', error);
  }
}

fixTournamentResults();