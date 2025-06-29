"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import type { SubmissionFormData, DatabaseInsertResult } from "@/types/submission";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Custom hook for submitting tournament records to the database
 */
export function useSubmitRecord() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Generate a UUID v4 for new players
   */
  const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  /**
   * Find or create a player record
   */
  const findOrCreatePlayer = async (playerName: string): Promise<{ success: boolean; player_id?: string; error?: string }> => {
    try {
      // First, try to find existing player by name (case-insensitive)
      const { data: existingPlayers, error: searchError } = await supabase
        .from('player')
        .select('id, name')
        .ilike('name', playerName.trim());

      if (searchError) {
        console.error('Error searching for player:', searchError);
        return { success: false, error: 'Failed to search for existing player' };
      }

      // If player exists, return their ID
      if (existingPlayers && existingPlayers.length > 0) {
        return { success: true, player_id: existingPlayers[0].id };
      }

      // Create new player
      const newPlayerId = generateUUID();
      const { data: newPlayer, error: createError } = await supabase
        .from('player')
        .insert({
          id: newPlayerId,
          name: playerName.trim()
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating player:', createError);
        return { success: false, error: 'Failed to create new player' };
      }

      return { success: true, player_id: newPlayer.id };
    } catch (error) {
      console.error('Unexpected error in findOrCreatePlayer:', error);
      return { success: false, error: 'Unexpected error occurred' };
    }
  };

  /**
   * Get deck archetype IDs based on form selection
   */
  const getDeckArchetypeIds = async (formData: SubmissionFormData): Promise<{ 
    deck_archetype_1_id?: number; 
    deck_archetype_2_id?: number; 
    error?: string 
  }> => {
    try {
      if (typeof formData.selectedDeck === "number") {
        // For meta decks, we need to find the corresponding individual Pokemon in our archetype tables
        // This is a bit complex because our current system stores individual Pokemon, not meta deck references
        // For now, we'll map meta decks to their primary Pokemon
        
        // Import meta decks data to map to Pokemon
        const metaDecksModule = await import("@/data/meta-decks.json");
        const metaDeck = metaDecksModule.metaDecks.find(deck => deck.id === formData.selectedDeck);
        
        if (!metaDeck) {
          return { error: "Selected meta deck not found" };
        }

        // Find the Pokemon in our archetype tables
        const primaryPokemon = metaDeck.pokemon[0];
        const secondaryPokemon = metaDeck.pokemon[1];

        // Search for matching Pokemon in deck_archetype_1 table
        const { data: archetype1Data, error: archetype1Error } = await supabase
          .from('deck_archetype_1')
          .select('id, Name')
          .eq('Name', primaryPokemon.name)
          .single();

        if (archetype1Error && archetype1Error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Error finding primary Pokemon:', archetype1Error);
          return { error: "Failed to find primary Pokemon in database" };
        }

        let deck_archetype_1_id = archetype1Data?.id;
        let deck_archetype_2_id: number | undefined;

        // If we didn't find it, we need to create it
        if (!deck_archetype_1_id) {
          const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${primaryPokemon.pokedex_number}.png`;
          const { data: newArchetype1, error: createError1 } = await supabase
            .from('deck_archetype_1')
            .insert({
              Name: primaryPokemon.name,
              image_url: spriteUrl
            })
            .select('id')
            .single();

          if (createError1) {
            console.error('Error creating primary Pokemon archetype:', createError1);
            return { error: "Failed to create primary Pokemon archetype" };
          }
          deck_archetype_1_id = newArchetype1.id;
        }

        // Handle secondary Pokemon if it exists
        if (secondaryPokemon) {
          const { data: archetype2Data, error: archetype2Error } = await supabase
            .from('deck_archetype_2')
            .select('id, Name')
            .eq('Name', secondaryPokemon.name)
            .single();

          if (archetype2Error && archetype2Error.code !== 'PGRST116') {
            console.error('Error finding secondary Pokemon:', archetype2Error);
            return { error: "Failed to find secondary Pokemon in database" };
          }

          deck_archetype_2_id = archetype2Data?.id;

          if (!deck_archetype_2_id) {
            const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${secondaryPokemon.pokedex_number}.png`;
            const { data: newArchetype2, error: createError2 } = await supabase
              .from('deck_archetype_2')
              .insert({
                Name: secondaryPokemon.name,
                image_url: spriteUrl
              })
              .select('id')
              .single();

            if (createError2) {
              console.error('Error creating secondary Pokemon archetype:', createError2);
              return { error: "Failed to create secondary Pokemon archetype" };
            }
            deck_archetype_2_id = newArchetype2.id;
          }
        }

        return { deck_archetype_1_id, deck_archetype_2_id };
      } 
      else if (formData.selectedDeck === "other" && formData.customPokemon) {
        // Handle custom Pokemon selection
        const primaryPokemon = formData.customPokemon[0];
        const secondaryPokemon = formData.customPokemon[1];

        if (!primaryPokemon) {
          return { error: "No primary Pokemon selected" };
        }

        // Find or create primary Pokemon archetype
        const { data: archetype1Data, error: archetype1Error } = await supabase
          .from('deck_archetype_1')
          .select('id, Name')
          .eq('Name', primaryPokemon.name)
          .single();

        if (archetype1Error && archetype1Error.code !== 'PGRST116') {
          console.error('Error finding primary Pokemon:', archetype1Error);
          return { error: "Failed to find primary Pokemon in database" };
        }

        let deck_archetype_1_id = archetype1Data?.id;

        if (!deck_archetype_1_id) {
          const { data: newArchetype1, error: createError1 } = await supabase
            .from('deck_archetype_1')
            .insert({
              Name: primaryPokemon.name,
              image_url: primaryPokemon.sprite_url
            })
            .select('id')
            .single();

          if (createError1) {
            console.error('Error creating primary Pokemon archetype:', createError1);
            return { error: "Failed to create primary Pokemon archetype" };
          }
          deck_archetype_1_id = newArchetype1.id;
        }

        let deck_archetype_2_id: number | undefined;

        // Handle secondary Pokemon if selected
        if (secondaryPokemon) {
          const { data: archetype2Data, error: archetype2Error } = await supabase
            .from('deck_archetype_2')
            .select('id, Name')
            .eq('Name', secondaryPokemon.name)
            .single();

          if (archetype2Error && archetype2Error.code !== 'PGRST116') {
            console.error('Error finding secondary Pokemon:', archetype2Error);
            return { error: "Failed to find secondary Pokemon in database" };
          }

          deck_archetype_2_id = archetype2Data?.id;

          if (!deck_archetype_2_id) {
            const { data: newArchetype2, error: createError2 } = await supabase
              .from('deck_archetype_2')
              .insert({
                Name: secondaryPokemon.name,
                image_url: secondaryPokemon.sprite_url
              })
              .select('id')
              .single();

            if (createError2) {
              console.error('Error creating secondary Pokemon archetype:', createError2);
              return { error: "Failed to create secondary Pokemon archetype" };
            }
            deck_archetype_2_id = newArchetype2.id;
          }
        }

        return { deck_archetype_1_id, deck_archetype_2_id };
      }

      return { error: "Invalid deck selection" };
    } catch (error) {
      console.error('Unexpected error in getDeckArchetypeIds:', error);
      return { error: "Unexpected error occurred while processing deck selection" };
    }
  };

  /**
   * Submit a tournament record
   */
  const submitRecord = async (formData: SubmissionFormData): Promise<DatabaseInsertResult> => {
    setIsSubmitting(true);

    try {
      // Step 1: Find or create player
      const playerResult = await findOrCreatePlayer(formData.playerName);
      if (!playerResult.success || !playerResult.player_id) {
        return { 
          success: false, 
          error: playerResult.error || "Failed to process player",
          player_id: "",
          result_id: 0
        };
      }

      // Step 2: Get deck archetype IDs
      const deckResult = await getDeckArchetypeIds(formData);
      if (deckResult.error) {
        return {
          success: false,
          error: deckResult.error,
          player_id: playerResult.player_id,
          result_id: 0
        };
      }

      // Step 3: Insert tournament result
      const { data: resultData, error: resultError } = await supabase
        .from('result')
        .insert({
          week_start: formData.date,
          wins: formData.wins,
          losses: formData.losses,
          ties: formData.ties,
          player_id: playerResult.player_id,
          deck_archetype_1_id: deckResult.deck_archetype_1_id,
          deck_archetype_2_id: deckResult.deck_archetype_2_id || null
        })
        .select('id')
        .single();

      if (resultError) {
        console.error('Error creating result:', resultError);
        return {
          success: false,
          error: "Failed to save tournament result",
          player_id: playerResult.player_id,
          result_id: 0
        };
      }

      return {
        success: true,
        player_id: playerResult.player_id,
        result_id: resultData.id
      };

    } catch (error) {
      console.error('Unexpected error in submitRecord:', error);
      return {
        success: false,
        error: "An unexpected error occurred. Please try again.",
        player_id: "",
        result_id: 0
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitRecord,
    isSubmitting
  };
}