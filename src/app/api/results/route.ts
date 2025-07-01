import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_SERVER_SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: NextRequest) {
  try {
    const {
      week_start,
      wins,
      losses,
      ties,
      player_id,
      deck_archetype_1_id,
      deck_archetype_2_id,
      password
    } = await request.json();

    // Validate password
    if (!password || password !== process.env.SUPER_SECRET_PASSWORD) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate required fields
    if (!week_start) {
      return NextResponse.json(
        { error: 'Week start date is required' },
        { status: 400 }
      );
    }

    if (!player_id) {
      return NextResponse.json(
        { error: 'Player ID is required' },
        { status: 400 }
      );
    }

    if (!deck_archetype_1_id) {
      return NextResponse.json(
        { error: 'Primary deck archetype is required' },
        { status: 400 }
      );
    }

    // Validate numeric fields
    if (typeof wins !== 'number' || wins < 0) {
      return NextResponse.json(
        { error: 'Wins must be a non-negative number' },
        { status: 400 }
      );
    }

    if (typeof losses !== 'number' || losses < 0) {
      return NextResponse.json(
        { error: 'Losses must be a non-negative number' },
        { status: 400 }
      );
    }

    if (typeof ties !== 'number' || ties < 0) {
      return NextResponse.json(
        { error: 'Ties must be a non-negative number' },
        { status: 400 }
      );
    }

    // Validate deck archetype IDs
    if (typeof deck_archetype_1_id !== 'number' || deck_archetype_1_id <= 0) {
      return NextResponse.json(
        { error: 'Primary deck archetype ID must be a positive number' },
        { status: 400 }
      );
    }

    if (deck_archetype_2_id !== null && deck_archetype_2_id !== undefined) {
      if (typeof deck_archetype_2_id !== 'number' || deck_archetype_2_id <= 0) {
        return NextResponse.json(
          { error: 'Secondary deck archetype ID must be a positive number or null' },
          { status: 400 }
        );
      }
    }

    // Validate date format
    const weekStartDate = new Date(week_start);
    if (isNaN(weekStartDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid week start date format' },
        { status: 400 }
      );
    }

    // Check if a result already exists for this player and week_start
    const { data: existingResults, error: checkError } = await supabase
      .from('result')
      .select('id')
      .eq('player_id', player_id)
      .eq('week_start', week_start);

    if (checkError) {
      console.error('Error checking for existing result:', checkError);
      return NextResponse.json(
        { error: 'Failed to check for existing result' },
        { status: 500 }
      );
    }

    if (existingResults && existingResults.length > 0) {
      return NextResponse.json(
        { error: 'A result for this player and week already exists.' },
        { status: 409 }
      );
    }

    // NEW RESTRICTION: No more than 50 results per week_start
    const { count: weekCount, error: weekCountError } = await supabase
      .from('result')
      .select('id', { count: 'exact', head: true })
      .eq('week_start', week_start);

    if (weekCountError) {
      console.error('Error counting results for week_start:', weekCountError);
      return NextResponse.json(
        { error: 'Failed to check results count for this date' },
        { status: 500 }
      );
    }

    if (typeof weekCount === 'number' && weekCount >= 50) {
      return NextResponse.json(
        { error: 'The maximum number of results (50) for this date has been reached.' },
        { status: 409 }
      );
    }

    // Insert tournament result
    const { data: resultData, error: resultError } = await supabase
      .from('result')
      .insert({
        week_start: week_start,
        wins: wins,
        losses: losses,
        ties: ties,
        player_id: player_id,
        deck_archetype_1: deck_archetype_1_id,
        deck_archetype_2: deck_archetype_2_id || null
      })
      .select('id')
      .single();

    if (resultError) {
      console.error('Error creating result:', resultError);
      return NextResponse.json(
        { error: 'Failed to save tournament result' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      result_id: resultData.id
    });

  } catch (error) {
    console.error('Unexpected error in POST /api/results:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 