import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSpriteUrl } from '@/utils/pokemon';

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface SubmissionData {
  playerName: string;
  date: string;
  wins: number;
  losses: number;
  ties: number;
  selectedDeck: number | "other" | "";
  customPokemon?: Array<{
    name: string;
    pokedex_number: number;
    sprite_url: string;
  }>;
}

interface ValidationError {
  field: string;
  message: string;
}

function validateSubmissionData(data: unknown): { isValid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  // Type guard for object
  if (!data || typeof data !== 'object') {
    errors.push({ field: 'general', message: 'Invalid request data' });
    return { isValid: false, errors };
  }

  const submission = data as Record<string, unknown>;

  if (!submission.playerName || typeof submission.playerName !== 'string' || !submission.playerName.trim()) {
    errors.push({ field: 'playerName', message: 'Player name is required' });
  } else if (submission.playerName.trim().length > 100) {
    errors.push({ field: 'playerName', message: 'Player name must be 100 characters or less' });
  }

  if (!submission.date || typeof submission.date !== 'string') {
    errors.push({ field: 'date', message: 'Date is required' });
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(submission.date)) {
    errors.push({ field: 'date', message: 'Date must be in YYYY-MM-DD format' });
  }

  if (typeof submission.wins !== 'number' || submission.wins < 0 || submission.wins > 50) {
    errors.push({ field: 'wins', message: 'Wins must be a number between 0 and 50' });
  }

  if (typeof submission.losses !== 'number' || submission.losses < 0 || submission.losses > 50) {
    errors.push({ field: 'losses', message: 'Losses must be a number between 0 and 50' });
  }

  if (typeof submission.ties !== 'number' || submission.ties < 0 || submission.ties > 50) {
    errors.push({ field: 'ties', message: 'Ties must be a number between 0 and 50' });
  }

  if (!submission.selectedDeck && submission.selectedDeck !== 0) {
    errors.push({ field: 'selectedDeck', message: 'Deck selection is required' });
  }

  if (submission.selectedDeck === "other" && (!submission.customPokemon || !Array.isArray(submission.customPokemon) || submission.customPokemon.length === 0)) {
    errors.push({ field: 'customPokemon', message: 'Custom Pokemon selection is required when "Other" is selected' });
  }

  return { isValid: errors.length === 0, errors };
}

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function findOrCreatePlayer(playerName: string): Promise<string> {
  const trimmedName = playerName.trim();
  
  const { data: existingPlayers, error: searchError } = await supabase
    .from('player')
    .select('id, name')
    .ilike('name', trimmedName);

  if (searchError) {
    throw new Error(`Database error while searching for player: ${searchError.message}`);
  }

  if (existingPlayers && existingPlayers.length > 0) {
    return existingPlayers[0].id;
  }

  const newPlayerId = generateUUID();
  const { data: newPlayer, error: createError } = await supabase
    .from('player')
    .insert({
      id: newPlayerId,
      name: trimmedName
    })
    .select('id')
    .single();

  if (createError) {
    throw new Error(`Failed to create new player: ${createError.message}`);
  }

  return newPlayer.id;
}

async function findOrCreateArchetype(tableName: string, pokemonName: string, spriteUrl: string): Promise<number> {
  const { data: existingArchetype, error: searchError } = await supabase
    .from(tableName)
    .select('id, Name')
    .eq('Name', pokemonName)
    .single();

  if (searchError && searchError.code !== 'PGRST116') {
    throw new Error(`Database error while searching for ${pokemonName}: ${searchError.message}`);
  }

  if (existingArchetype) {
    return existingArchetype.id;
  }

  const { data: newArchetype, error: createError } = await supabase
    .from(tableName)
    .insert({
      Name: pokemonName,
      image_url: spriteUrl
    })
    .select('id')
    .single();

  if (createError) {
    throw new Error(`Failed to create ${pokemonName} archetype: ${createError.message}`);
  }

  return newArchetype.id;
}

async function getDeckArchetypeIds(formData: SubmissionData): Promise<{ deck_archetype_1_id: number; deck_archetype_2_id?: number }> {
  if (typeof formData.selectedDeck === "number") {
    const metaDecksModule = await import("@/data/meta-decks.json");
    const metaDeck = metaDecksModule.metaDecks.find(deck => deck.id === formData.selectedDeck);
    
    if (!metaDeck) {
      throw new Error("Selected meta deck not found");
    }

    const primaryPokemon = metaDeck.pokemon[0];
    const secondaryPokemon = metaDeck.pokemon[1];

    const deck_archetype_1_id = await findOrCreateArchetype(
      'deck_archetype_1',
      primaryPokemon.name,
      getSpriteUrl(primaryPokemon.pokedex_number)
    );

    let deck_archetype_2_id: number | undefined;
    if (secondaryPokemon) {
      deck_archetype_2_id = await findOrCreateArchetype(
        'deck_archetype_2',
        secondaryPokemon.name,
        getSpriteUrl(secondaryPokemon.pokedex_number)
      );
    }

    return { deck_archetype_1_id, deck_archetype_2_id };
  } 
  else if (formData.selectedDeck === "other" && formData.customPokemon) {
    const primaryPokemon = formData.customPokemon[0];
    const secondaryPokemon = formData.customPokemon[1];

    if (!primaryPokemon) {
      throw new Error("No primary Pokemon selected");
    }

    const deck_archetype_1_id = await findOrCreateArchetype(
      'deck_archetype_1',
      primaryPokemon.name,
      primaryPokemon.sprite_url
    );

    let deck_archetype_2_id: number | undefined;
    if (secondaryPokemon) {
      deck_archetype_2_id = await findOrCreateArchetype(
        'deck_archetype_2',
        secondaryPokemon.name,
        secondaryPokemon.sprite_url
      );
    }

    return { deck_archetype_1_id, deck_archetype_2_id };
  }

  throw new Error("Invalid deck selection");
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    let body: SubmissionData;
    
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate submission data
    const { isValid, errors } = validateSubmissionData(body);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    // Process the submission
    const playerId = await findOrCreatePlayer(body.playerName);
    const { deck_archetype_1_id, deck_archetype_2_id } = await getDeckArchetypeIds(body);

    // Insert tournament result
    const { data: resultData, error: resultError } = await supabase
      .from('result')
      .insert({
        week_start: body.date,
        wins: body.wins,
        losses: body.losses,
        ties: body.ties,
        player_id: playerId,
        deck_archetype_1_id: deck_archetype_1_id,
        deck_archetype_2_id: deck_archetype_2_id || null
      })
      .select('id')
      .single();

    if (resultError) {
      throw new Error(`Failed to save tournament result: ${resultError.message}`);
    }

    return NextResponse.json({
      success: true,
      player_id: playerId,
      result_id: resultData.id
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    
    // Log error server-side for debugging (safe in production)
    console.error('Tournament submission error:', message);
    
    return NextResponse.json(
      { error: 'Failed to submit tournament record' },
      { status: 500 }
    );
  }
}