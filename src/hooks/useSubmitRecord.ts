"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { getSpriteUrl } from "@/utils/pokemon";
import type { SubmissionFormData, DatabaseInsertResult } from "@/types/submission";

export function useSubmitRecord() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateUUID = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const findOrCreatePlayer = async (playerName: string): Promise<{ success: boolean; player_id?: string; error?: string }> => {
    try {
      const { data: existingPlayers, error: searchError } = await supabase
        .from('player')
        .select('id, name')
        .ilike('name', playerName.trim());

      if (searchError) {
        return { success: false, error: 'Failed to search for existing player' };
      }

      if (existingPlayers && existingPlayers.length > 0) {
        return { success: true, player_id: existingPlayers[0].id };
      }

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
        return { success: false, error: 'Failed to create new player' };
      }

      return { success: true, player_id: newPlayer.id };
    } catch {
      return { success: false, error: 'Unexpected error occurred' };
    }
  };

  const getDeckArchetypeIds = async (formData: SubmissionFormData): Promise<{ 
    deck_archetype_1_id?: number; 
    deck_archetype_2_id?: number; 
    error?: string 
  }> => {
    try {
      if (typeof formData.selectedDeck === "number") {
        const metaDecksModule = await import("@/data/meta-decks.json");
        const metaDeck = metaDecksModule.metaDecks.find(deck => deck.id === formData.selectedDeck);
        
        if (!metaDeck) {
          return { error: "Selected meta deck not found" };
        }

        const primaryPokemon = metaDeck.pokemon[0];
        const secondaryPokemon = metaDeck.pokemon[1];

        const { data: archetype1Data, error: archetype1Error } = await supabase
          .from('deck_archetype_1')
          .select('id, Name')
          .eq('Name', primaryPokemon.name)
          .single();

        if (archetype1Error && archetype1Error.code !== 'PGRST116') {
          return { error: "Failed to find primary Pokemon in database" };
        }

        let deck_archetype_1_id = archetype1Data?.id;
        let deck_archetype_2_id: number | undefined;

        if (!deck_archetype_1_id) {
          const spriteUrl = getSpriteUrl(primaryPokemon.pokedex_number);
          const { data: newArchetype1, error: createError1 } = await supabase
            .from('deck_archetype_1')
            .insert({
              Name: primaryPokemon.name,
              image_url: spriteUrl
            })
            .select('id')
            .single();

          if (createError1) {
            return { error: "Failed to create primary Pokemon archetype" };
          }
          deck_archetype_1_id = newArchetype1.id;
        }

        if (secondaryPokemon) {
          const { data: archetype2Data, error: archetype2Error } = await supabase
            .from('deck_archetype_2')
            .select('id, Name')
            .eq('Name', secondaryPokemon.name)
            .single();

          if (archetype2Error && archetype2Error.code !== 'PGRST116') {
            return { error: "Failed to find secondary Pokemon in database" };
          }

          deck_archetype_2_id = archetype2Data?.id;

          if (!deck_archetype_2_id) {
            const spriteUrl = getSpriteUrl(secondaryPokemon.pokedex_number);
            const { data: newArchetype2, error: createError2 } = await supabase
              .from('deck_archetype_2')
              .insert({
                Name: secondaryPokemon.name,
                image_url: spriteUrl
              })
              .select('id')
              .single();

            if (createError2) {
              return { error: "Failed to create secondary Pokemon archetype" };
            }
            deck_archetype_2_id = newArchetype2.id;
          }
        }

        return { deck_archetype_1_id, deck_archetype_2_id };
      } 
      else if (formData.selectedDeck === "other" && formData.customPokemon) {
        const primaryPokemon = formData.customPokemon[0];
        const secondaryPokemon = formData.customPokemon[1];

        if (!primaryPokemon) {
          return { error: "No primary Pokemon selected" };
        }

        const { data: archetype1Data, error: archetype1Error } = await supabase
          .from('deck_archetype_1')
          .select('id, Name')
          .eq('Name', primaryPokemon.name)
          .single();

        if (archetype1Error && archetype1Error.code !== 'PGRST116') {
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
            return { error: "Failed to create primary Pokemon archetype" };
          }
          deck_archetype_1_id = newArchetype1.id;
        }

        let deck_archetype_2_id: number | undefined;

        if (secondaryPokemon) {
          const { data: archetype2Data, error: archetype2Error } = await supabase
            .from('deck_archetype_2')
            .select('id, Name')
            .eq('Name', secondaryPokemon.name)
            .single();

          if (archetype2Error && archetype2Error.code !== 'PGRST116') {
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
              return { error: "Failed to create secondary Pokemon archetype" };
            }
            deck_archetype_2_id = newArchetype2.id;
          }
        }

        return { deck_archetype_1_id, deck_archetype_2_id };
      }

      return { error: "Invalid deck selection" };
    } catch {
      return { error: "Unexpected error occurred while processing deck selection" };
    }
  };

  const submitRecord = async (formData: SubmissionFormData): Promise<DatabaseInsertResult> => {
    setIsSubmitting(true);

    try {
      const playerResult = await findOrCreatePlayer(formData.playerName);
      if (!playerResult.success || !playerResult.player_id) {
        return { 
          success: false, 
          error: playerResult.error || "Failed to process player",
          player_id: "",
          result_id: 0
        };
      }

      const deckResult = await getDeckArchetypeIds(formData);
      if (deckResult.error) {
        return {
          success: false,
          error: deckResult.error,
          player_id: playerResult.player_id,
          result_id: 0
        };
      }

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