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

async function checkTables() {
  console.log('Checking existing tables and data...');
  
  // Check player table
  console.log('\n--- Player table ---');
  const { data: players, error: playerError } = await supabase
    .from('player')
    .select('*')
    .limit(5);
  
  if (playerError) {
    console.log('Player table error:', playerError);
  } else {
    console.log('Player table exists. Sample data:', players);
  }

  // Check result table
  console.log('\n--- Result table ---');
  const { data: results, error: resultError } = await supabase
    .from('result')
    .select('*')
    .limit(5);
  
  if (resultError) {
    console.log('Result table error:', resultError);
  } else {
    console.log('Result table exists. Sample data:', results);
  }

  // Try to find deck archetype tables
  console.log('\n--- Testing deck archetype table names ---');
  
  const tableNames = ['deck_archetype', 'deck_archetype_1', 'deck_archetype_2', 'pokemon', 'archetype'];
  
  for (const tableName of tableNames) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (!error) {
      console.log(`✓ Table '${tableName}' exists:`, data);
    } else {
      console.log(`✗ Table '${tableName}' does not exist or has error:`, error.message);
    }
  }
}

checkTables();