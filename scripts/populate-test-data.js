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

// Generate UUID v4
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Test data
const deckArchetypes = [
  {
    Name: "Charizard ex",
    image_url: "https://images.pokemontcg.io/pgo/9.png"
  },
  {
    Name: "Miraidon ex",
    image_url: "https://images.pokemontcg.io/sv1/81.png"
  },
  {
    Name: "Pikachu ex",
    image_url: "https://images.pokemontcg.io/sv4pt5/8.png"
  },
  {
    Name: "Lost Box",
    image_url: "https://images.pokemontcg.io/swsh11/196.png"
  },
  {
    Name: "Pidgeot Control",
    image_url: "https://images.pokemontcg.io/sv3-5/164.png"
  },
  {
    Name: "Chien-Pao ex",
    image_url: "https://images.pokemontcg.io/sv2/61.png"
  },
  {
    Name: "Roaring Moon ex",
    image_url: "https://images.pokemontcg.io/sv4-5/124.png"
  },
  {
    Name: "Iron Valiant ex",
    image_url: "https://images.pokemontcg.io/sv2/89.png"
  },
  {
    Name: "Gardevoir ex",
    image_url: "https://images.pokemontcg.io/sv1/86.png"
  },
  {
    Name: "Gholdengo ex",
    image_url: "https://images.pokemontcg.io/sv2/139.png"
  }
];

const players = [
  { id: generateUUID(), name: "Alex Chen" },
  { id: generateUUID(), name: "Jordan Smith" },
  { id: generateUUID(), name: "Taylor Kim" },
  { id: generateUUID(), name: "Morgan Rivera" },
  { id: generateUUID(), name: "Casey Williams" },
  { id: generateUUID(), name: "Blake Thompson" }
];

// Generate dates for the last 6 weeks
function getWeekDates() {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 6; i++) {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - (i * 7) - today.getDay());
    dates.push(weekStart.toISOString().split('T')[0]);
  }
  return dates.reverse();
}

const weekDates = getWeekDates();

async function populateDatabase() {
  try {
    console.log('Starting database population...');

    // Step 1: Insert deck archetypes
    console.log('Inserting deck archetypes...');
    for (const archetype of deckArchetypes) {
      const { data, error } = await supabase
        .from('deck_archetype_1')
        .insert(archetype);
      
      if (error) {
        console.log(`Error inserting archetype ${archetype.Name}:`, error);
      } else {
        console.log(`✓ Inserted archetype: ${archetype.Name}`);
      }
    }

    // Also insert into deck_archetype_2 table (assuming same structure)
    console.log('Inserting deck archetypes into second table...');
    for (const archetype of deckArchetypes) {
      const { data, error } = await supabase
        .from('deck_archetype_2')
        .insert(archetype);
      
      if (error) {
        console.log(`Error inserting archetype ${archetype.Name} into deck_archetype_2:`, error);
      } else {
        console.log(`✓ Inserted archetype into deck_archetype_2: ${archetype.Name}`);
      }
    }

    // Step 2: Insert players
    console.log('Inserting players...');
    for (const player of players) {
      const { data, error } = await supabase
        .from('player')
        .insert(player);
      
      if (error) {
        console.log(`Error inserting player ${player.name}:`, error);
      } else {
        console.log(`✓ Inserted player: ${player.name}`);
      }
    }

    // Step 3: Generate and insert tournament results
    console.log('Inserting tournament results...');
    let resultId = 1;
    
    for (const weekDate of weekDates) {
      // Each week, generate 4-5 results for different players
      const playersThisWeek = players.slice(0, 4 + Math.floor(Math.random() * 2));
      
      for (const player of playersThisWeek) {
        const wins = Math.floor(Math.random() * 5);
        const losses = Math.floor(Math.random() * (5 - wins));
        const ties = Math.random() < 0.1 ? 1 : 0; // 10% chance of a tie
        
        // Randomly select 1-2 deck archetypes
        const numDecks = Math.random() < 0.3 ? 1 : 2; // 30% chance of single deck
        const shuffledArchetypes = [...deckArchetypes].sort(() => Math.random() - 0.5);
        
        const result = {
          id: resultId++,
          week_start: weekDate,
          wins: wins,
          losses: losses,
          ties: ties,
          player_id: player.id,
          deck_archetype_1: shuffledArchetypes[0].Name,
          deck_archetype_2: numDecks === 2 ? shuffledArchetypes[1].Name : null
        };

        const { data, error } = await supabase
          .from('result')
          .insert(result);
        
        if (error) {
          console.log(`Error inserting result for ${player.name}:`, error);
        } else {
          console.log(`✓ Inserted result: ${player.name} - ${wins}W/${losses}L/${ties}T`);
        }
      }
    }

    console.log('Database population completed successfully!');
    
  } catch (error) {
    console.error('Error populating database:', error);
  }
}

populateDatabase();