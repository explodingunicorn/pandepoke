import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_SERVER_SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: NextRequest) {
  try {
    const { playerName, password } = await request.json();

    // Validate password
    if (!password || password !== process.env.SUPER_SECRET_PASSWORD) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!playerName || typeof playerName !== 'string') {
      return NextResponse.json(
        { error: 'Player name is required and must be a string' },
        { status: 400 }
      );
    }

    const trimmedName = playerName.trim();
    if (trimmedName.length === 0) {
      return NextResponse.json(
        { error: 'Player name cannot be empty' },
        { status: 400 }
      );
    }

    // First, try to find existing player by name (case-insensitive)
    const { data: existingPlayers, error: searchError } = await supabase
      .from('player')
      .select('id, name')
      .ilike('name', trimmedName);

    if (searchError) {
      console.error('Error searching for player:', searchError);
      return NextResponse.json(
        { error: 'Failed to search for existing player' },
        { status: 500 }
      );
    }

    // If player exists, return their ID
    if (existingPlayers && existingPlayers.length > 0) {
      return NextResponse.json({
        success: true,
        player_id: existingPlayers[0].id,
        isNew: false
      });
    }

    const { data: newPlayer, error: createError } = await supabase
      .from('player')
      .insert({
        name: trimmedName
      })
      .select('id')
      .single();

    if (createError) {
      console.error('Error creating player:', createError);
      return NextResponse.json(
        { error: 'Failed to create new player' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      player_id: newPlayer.id,
      isNew: true
    });

  } catch (error) {
    console.error('Unexpected error in POST /api/players:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const playerName = searchParams.get('name');

    if (!playerName) {
      return NextResponse.json(
        { error: 'Player name parameter is required' },
        { status: 400 }
      );
    }

    const { data: players, error } = await supabase
      .from('player')
      .select('id, name')
      .ilike('name', `%${playerName.trim()}%`);

    if (error) {
      console.error('Error searching for players:', error);
      return NextResponse.json(
        { error: 'Failed to search for players' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      players: players || []
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/players:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 