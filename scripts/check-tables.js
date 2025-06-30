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
  console.log('🔍 Checking existing tables and data...\n');
  
  let tablesFound = 0;
  let tablesWithErrors = 0;
  
  // Check player table
  console.log('\n--- Player table ---');
  const { data: players, error: playerError } = await supabase
    .from('player')
    .select('*')
    .limit(5);
  
  if (playerError) {
    console.error('❌ Player table error:', playerError.message);
    tablesWithErrors++;
  } else {
    console.log('✅ Player table exists');
    console.log('Sample data:', players?.slice(0, 3) || 'No data found');
    tablesFound++;
  }

  // Check result table
  console.log('\n--- Result table ---');
  const { data: results, error: resultError } = await supabase
    .from('result')
    .select('*')
    .limit(5);
  
  if (resultError) {
    console.error('❌ Result table error:', resultError.message);
    tablesWithErrors++;
  } else {
    console.log('✅ Result table exists');
    console.log('Sample data:', results?.slice(0, 3) || 'No data found');
    tablesFound++;
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
      console.log(`✅ Table '${tableName}' exists`);
      if (data && data.length > 0) {
        console.log(`   Records found: ${data.length}`);
      } else {
        console.log('   No records found');
      }
      tablesFound++;
    } else {
      console.log(`❌ Table '${tableName}' does not exist or has error: ${error.message}`);
      tablesWithErrors++;
    }
  }
  
  console.log('\n📊 Database Check Summary:');
  console.log(`✅ Tables accessible: ${tablesFound}`);
  console.log(`❌ Tables with errors: ${tablesWithErrors}`);
  
  if (tablesWithErrors === 0) {
    console.log('\n🎉 All database checks passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some database issues detected. Check the errors above.');
    process.exit(1);
  }
}

checkTables();