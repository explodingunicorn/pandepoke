"use client";

import { Label } from "@/components/ui/label";
import { PokemonSearchPicker } from "./PokemonSearchPicker";
import type { PokemonVariant } from "@/types/submission";

interface UnifiedDeckSelectorProps {
  selectedDeck: number | "other" | "";
  customPokemon?: PokemonVariant[];
  onDeckChange: (deck: number | "other" | "") => void;
  onCustomPokemonChange: (pokemon?: PokemonVariant[]) => void;
  error?: string;
}

export function UnifiedDeckSelector({ 
  customPokemon, 
  onCustomPokemonChange, 
  error 
}: UnifiedDeckSelectorProps) {
  return (
    <div>
      <Label className={`mb-3 ${error ? "text-red-500" : "text-black"}`}>Deck Selection *</Label>
      <div className="flex flex-col gap-4">
        <PokemonSearchPicker
          selectedPokemon={customPokemon || []}
          onPokemonChange={onCustomPokemonChange}
        />
      </div>
      {error && (
        <span className="text-red-500 text-xs mt-2 block">{error}</span>
      )}
    </div>
  );
}