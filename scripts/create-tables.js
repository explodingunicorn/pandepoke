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

async function createTables() {
  console.log('Creating database tables...');

  try {
    // Create deck_archetype_1 table
    console.log('Creating deck_archetype_1 table...');
    const { error: deck1Error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS deck_archetype_1 (
          id SERIAL PRIMARY KEY,
          "Name" TEXT NOT NULL,
          image_url TEXT NOT NULL
        );
      `
    });
    
    if (deck1Error) {
      console.log('Error creating deck_archetype_1:', deck1Error);
    } else {
      console.log('✓ deck_archetype_1 table created');
    }

    // Create deck_archetype_2 table
    console.log('Creating deck_archetype_2 table...');
    const { error: deck2Error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS deck_archetype_2 (
          id SERIAL PRIMARY KEY,
          "Name" TEXT NOT NULL,
          image_url TEXT NOT NULL
        );
      `
    });
    
    if (deck2Error) {
      console.log('Error creating deck_archetype_2:', deck2Error);
    } else {
      console.log('✓ deck_archetype_2 table created');
    }

    // Create player table
    console.log('Creating player table...');
    const { error: playerError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS player (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL
        );
      `
    });
    
    if (playerError) {
      console.log('Error creating player:', playerError);
    } else {
      console.log('✓ player table created');
    }

    // Create result table
    console.log('Creating result table...');
    const { error: resultError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS result (
          id SERIAL PRIMARY KEY,
          week_start DATE NOT NULL,
          wins INTEGER NOT NULL DEFAULT 0,
          losses INTEGER NOT NULL DEFAULT 0,
          ties INTEGER NOT NULL DEFAULT 0,
          player_id TEXT REFERENCES player(id),
          deck_archetype_1_id INTEGER REFERENCES deck_archetype_1(id),
          deck_archetype_2_id INTEGER REFERENCES deck_archetype_2(id)
        );
      `
    });
    
    if (resultError) {
      console.log('Error creating result:', resultError);
    } else {
      console.log('✓ result table created');
    }

    console.log('Database schema creation completed!');

  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

createTables();