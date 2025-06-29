"use client";

import {
  Box,
  VStack,
  Text,
} from "@chakra-ui/react";
import { PokemonSearchPicker } from "./PokemonSearchPicker";
import { CustomDropdown } from "./CustomDropdown";
import type { PokemonVariant } from "@/types/submission";

interface UnifiedDeckSelectorProps {
  selectedDeck: number | "other" | "";
  customPokemon?: PokemonVariant[];
  onDeckChange: (deck: number | "other" | "") => void;
  onCustomPokemonChange: (pokemon?: PokemonVariant[]) => void;
  error?: string;
}

export function UnifiedDeckSelector({ 
  selectedDeck, 
  customPokemon, 
  onDeckChange, 
  onCustomPokemonChange, 
  error 
}: UnifiedDeckSelectorProps) {


  return (
    <Box>
      <Text fontSize="sm" fontWeight="medium" mb={3} color={error ? "red.500" : "black"}>
        Deck Selection *
      </Text>
      
      <VStack gap={4} align="stretch">
        {/* Custom Dropdown with Pokemon Images */}
        <CustomDropdown
          selectedDeck={selectedDeck}
          onDeckChange={onDeckChange}
          error={error}
        />


        {/* Pokemon Search Picker */}
        {selectedDeck === "other" && (
          <PokemonSearchPicker
            selectedPokemon={customPokemon || []}
            onPokemonChange={onCustomPokemonChange}
          />
        )}
      </VStack>
      
      {error && (
        <Text color="red.500" fontSize="xs" mt={2}>{error}</Text>
      )}
    </Box>
  );
}