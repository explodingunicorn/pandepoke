# Database Scripts

This directory contains utility scripts for managing the PandePoke tournament tracking database. These scripts handle database setup, data population, maintenance, and migrations.

## Prerequisites

- Node.js installed
- `.env.local` file in the project root with Supabase credentials:
  ```
  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
  ```

## Scripts Overview

### 🏗️ Database Setup

#### `schema.sql`
**Purpose**: Complete SQL schema definition with sample data
**Usage**: Run directly in Supabase SQL Editor or any PostgreSQL client
**Contains**:
- Table creation statements (player, result, deck_archetype_1, deck_archetype_2)
- Sample deck archetypes with Pokemon card images
- Sample players and tournament results
- Foreign key relationships

#### `create-tables.js`
**Purpose**: Programmatically create database tables via Supabase API
**Usage**: `node scripts/create-tables.js`
**What it does**:
- Creates all required tables if they don't exist
- Uses Supabase RPC to execute SQL commands
- Provides success/error feedback for each table

### 📊 Data Management

#### `populate-test-data.js`
**Purpose**: Generate comprehensive test data for development
**Usage**: `node scripts/populate-test-data.js`
**What it does**:
- Inserts deck archetypes into both archetype tables
- Creates sample players with generated UUIDs
- Generates realistic tournament results for the last 6 weeks
- Assigns random but realistic win/loss records

#### `check-tables.js`
**Purpose**: Verify database connectivity and inspect existing data
**Usage**: `node scripts/check-tables.js`
**What it does**:
- Tests connection to Supabase
- Displays sample data from each table
- Checks for the existence of various table names
- Useful for debugging database issues

#### `add-individual-pokemon.js`
**Purpose**: Add individual Pokemon data for deck combinations
**Usage**: `node scripts/add-individual-pokemon.js`
**What it does**:
- Inserts individual Pokemon (non-ex variants) into archetype tables
- Uses PokeAPI sprite URLs for consistent imagery
- Enables more diverse deck combination possibilities

### 🔧 Maintenance & Updates

#### `update-sprites.js`
**Purpose**: Update deck archetype images to use Pokemon sprites
**Usage**: `node scripts/update-sprites.js`
**What it does**:
- Maps deck names to Pokemon IDs
- Replaces card images with PokeAPI sprites
- Updates both deck_archetype_1 and deck_archetype_2 tables
- Provides consistent, pixelated Pokemon imagery

#### `update-to-current-meta.js`
**Purpose**: Update deck archetypes to reflect current competitive meta
**Usage**: `node scripts/update-to-current-meta.js`
**⚠️ Warning**: This script clears existing data and will break tournament result references
**What it does**:
- Clears all existing deck archetypes
- Inserts current meta decks based on Limitless TCG data
- Updates deck names to reflect competitive tournament play

#### `fix-deck-combinations.js`
**Purpose**: Fix invalid deck combinations with realistic tournament data
**Usage**: `node scripts/fix-deck-combinations.js`
**What it does**:
- Defines valid meta deck combinations
- Updates existing tournament results with realistic deck assignments
- Ensures deck combinations reflect actual competitive play

#### `fix-tournament-results.js`
**Purpose**: Repair tournament results after deck archetype changes
**Usage**: `node scripts/fix-tournament-results.js`
**What it does**:
- Updates tournament results to use new deck archetype IDs
- Randomly assigns new deck combinations to existing results
- Cleans up outdated deck archetype records

#### `create-two-pokemon-combos.js`
**Purpose**: Implement proper two-Pokemon deck combination system
**Usage**: `node scripts/create-two-pokemon-combos.js`
**What it does**:
- Creates a system supporting both single and dual-Pokemon decks
- Updates tournament results with proper deck type assignments
- Provides realistic Pokemon TCG deck combinations

## Recommended Usage Workflow

### Initial Setup (New Environment)
1. **Create tables**: `node scripts/create-tables.js`
2. **Populate test data**: `node scripts/populate-test-data.js`
3. **Verify setup**: `node scripts/check-tables.js`

### Development & Testing
1. **Check current state**: `node scripts/check-tables.js`
2. **Add individual Pokemon** (if needed): `node scripts/add-individual-pokemon.js`
3. **Update sprites** (for UI consistency): `node scripts/update-sprites.js`

### Meta Updates (Competitive Scene Changes)
1. **Backup existing data** (if needed)
2. **Update to current meta**: `node scripts/update-to-current-meta.js`
3. **Fix broken references**: `node scripts/fix-tournament-results.js`
4. **Fix deck combinations**: `node scripts/fix-deck-combinations.js`

### Feature Development
1. **Implement two-Pokemon system**: `node scripts/create-two-pokemon-combos.js`
2. **Verify changes**: `node scripts/check-tables.js`

## NPM Scripts

For convenience, you can also use these npm commands:

```bash
npm run setup:db      # Create database tables
npm run seed:test     # Populate with test data
npm run check:db      # Verify database status
```

## Notes

- All scripts read credentials from `.env.local` which should never be committed
- Scripts are idempotent where possible (won't break if run multiple times)
- Always verify your changes with `check-tables.js` after running maintenance scripts
- Keep backups before running destructive operations like meta updates
- These scripts are essential for both development and production database management

## Troubleshooting

**Connection Issues**: Verify your `.env.local` file has correct Supabase credentials
**Permission Errors**: Ensure your Supabase anon key has necessary permissions
**Table Not Found**: Run `create-tables.js` to ensure all tables exist
**Data Inconsistencies**: Use `check-tables.js` to inspect current state before running fixes