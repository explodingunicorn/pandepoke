"use client";

import { useState } from "react";
import type { SubmissionFormData, DatabaseInsertResult } from "@/types/submission";
import type { PlayerApiResponse, ResultApiResponse } from "@/types/api";
import { supabase } from "@/lib/supabase";

export function useSubmitRecord() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Find or create a player record using the API
   */
  const findOrCreatePlayer = async (playerName: string, password: string): Promise<{ success: boolean; player_id?: string; error?: string }> => {
    try {
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerName, password }),
      });

      const data: PlayerApiResponse = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to process player' };
      }

      return { success: true, player_id: data.player_id };
    } catch (error) {
      console.error('Error calling players API:', error);
      return { success: false, error: 'Failed to connect to server' };
    }
  };

  /**
   * Submit a tournament result using the API
   */
  const submitResult = async (resultData: {
    week_start: string;
    wins: number;
    losses: number;
    ties: number;
    player_id: string;
    deck_archetype_1_id: number;
    deck_archetype_2_id?: number;
    password: string;
  }): Promise<{ success: boolean; result_id?: number; error?: string }> => {
    try {
      const response = await fetch('/api/results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resultData),
      });

      const data: ResultApiResponse = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Failed to save tournament result' };
      }

      return { success: true, result_id: data.result_id };
    } catch (error) {
      console.error('Error calling results API:', error);
      return { success: false, error: 'Failed to connect to server' };
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
      // Helper to fetch Pokemon ID from a table by name
      const fetchPokemonId = async (table: string, name: string) => {
        
        const { data, error } = await supabase
          .from(table)
          .select('Number, formatted_name')
          .eq('formatted_name', name.toLowerCase())
          .single();
        if (error) {
          console.error(`Error finding Pokemon "${name}" in table "${table}":`, error);
          return { id: undefined, error: `Failed to find ${name} in database` };
        }
        return { id: data?.Number, error: undefined };
      };

      let primaryPokemon: { name: string } | undefined;
      let secondaryPokemon: { name: string } | undefined;
      const table1 = "pokemon";
      const table2 = "pokemon";

      if (formData.customPokemon) {
        // Custom deck: get Pokemon from form
        primaryPokemon = formData.customPokemon[0];
        secondaryPokemon = formData.customPokemon[1];
        if (!primaryPokemon) {
          return { error: "No primary Pokemon selected" };
        }
      } else {
        return { error: "Invalid deck selection" };
      }

      // Fetch primary Pokemon ID
      const { id: deck_archetype_1_id, error: primaryError } = await fetchPokemonId(table1, primaryPokemon.name);
      if (primaryError) {
        return { error: primaryError };
      }

      let deck_archetype_2_id: number | undefined;
      if (secondaryPokemon) {
        const { id, error: secondaryError } = await fetchPokemonId(table2, secondaryPokemon.name);
        if (secondaryError) {
          return { error: secondaryError };
        }
        deck_archetype_2_id = id;
      }

      return { deck_archetype_1_id, deck_archetype_2_id };
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
      // Step 1: Find or create player using the API
      const playerResult = await findOrCreatePlayer(formData.playerName, formData.password);
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

      // Step 3: Submit tournament result using the API
      const resultData = {
        week_start: formData.date,
        wins: formData.wins,
        losses: formData.losses,
        ties: formData.ties,
        player_id: playerResult.player_id,
        deck_archetype_1_id: deckResult.deck_archetype_1_id!,
        deck_archetype_2_id: deckResult.deck_archetype_2_id,
        password: formData.password
      };

      const resultResponse = await submitResult(resultData);
      if (!resultResponse.success || !resultResponse.result_id) {
        return {
          success: false,
          error: resultResponse.error || "Failed to save tournament result",
          player_id: playerResult.player_id,
          result_id: 0
        };
      }

      return {
        success: true,
        player_id: playerResult.player_id,
        result_id: resultResponse.result_id
      };

    } catch {
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