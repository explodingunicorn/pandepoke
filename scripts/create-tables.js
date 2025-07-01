const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function loadEnvironmentVariables() {
  try {
    const envPath = path.join(__dirname, '..', '.env.local');
    
    if (!fs.existsSync(envPath)) {
      throw new Error('.env.local file not found. Please create it with your Supabase credentials.');
    }
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');
    
    let supabaseUrl, supabaseAnonKey;
    envLines.forEach(line => {
      const [key, value] = line.split('=');
      if (key === 'NEXT_PUBLIC_SUPABASE_URL') {
        supabaseUrl = value?.trim();
      } else if (key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY') {
        supabaseAnonKey = value?.trim();
      }
    });
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing required environment variables. Please check your .env.local file.');
    }
    
    return { supabaseUrl, supabaseAnonKey };
  } catch (error) {
    console.error('❌ Environment Error:', error.message);
    process.exit(1);
  }
}

const { supabaseUrl, supabaseAnonKey } = loadEnvironmentVariables();
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTables() {
  console.log('🏗️  Creating database tables...\n');
  
  let successCount = 0;
  let errorCount = 0;

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
      console.error('❌ Error creating deck_archetype_1:', deck1Error.message);
      errorCount++;
    } else {
      console.log('✅ deck_archetype_1 table created successfully');
      successCount++;
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
      console.error('❌ Error creating deck_archetype_2:', deck2Error.message);
      errorCount++;
    } else {
      console.log('✅ deck_archetype_2 table created successfully');
      successCount++;
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
      console.error('❌ Error creating player table:', playerError.message);
      errorCount++;
    } else {
      console.log('✅ player table created successfully');
      successCount++;
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
      console.error('❌ Error creating result table:', resultError.message);
      errorCount++;
    } else {
      console.log('✅ result table created successfully');
      successCount++;
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Successfully created: ${successCount} tables`);
    console.log(`❌ Errors encountered: ${errorCount} tables`);
    
    if (errorCount === 0) {
      console.log('\n🎉 Database schema creation completed successfully!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Database schema creation completed with errors.');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n💥 Fatal error during table creation:', error.message);
    process.exit(1);
  }
}

createTables();