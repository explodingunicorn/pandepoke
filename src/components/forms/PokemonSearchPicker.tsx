"use client";

import { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Image,
  Button,
  Input,
  Badge,
} from "@chakra-ui/react";
import { POKEMON_API_BASE, POKEMON_SEARCH_LIMIT, POKEMON_RESULTS_LIMIT, MAX_POKEMON_SELECTION, POKEMON_PER_GENERATION, SEARCH_DEBOUNCE_MS } from "@/lib/constants";
import { getSpriteUrl } from "@/utils/pokemon";
import type { PokemonVariant } from "@/types/submission";

interface Pokemon {
  name: string;
  pokedex_number: number;
  sprite_url: string;
  types: string[];
}

interface PokemonSearchPickerProps {
  selectedPokemon: PokemonVariant[];
  onPokemonChange: (pokemon: PokemonVariant[]) => void;
}

export function PokemonSearchPicker({ selectedPokemon, onPokemonChange }: PokemonSearchPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Pokemon[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchPokemon = async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${POKEMON_API_BASE}/pokemon?limit=${POKEMON_SEARCH_LIMIT}`);
      const data = await response.json();
      
      const cosmeticVariants = [
        'rock-star', 'belle', 'popstar', 'phd', 'libre', 'cosplay',
        'battle-bond', 'ash-', 'cap', 'partner', 'spiky-eared',
        'totem', 'school', 'sunshine', 'midnight', 'dusk',
        'own-tempo', 'original-color', 'orange', 'violet'
      ];
      
      const filteredPokemon = data.results
        .filter((pokemon: { name: string; url: string }) => {
          const name = pokemon.name.toLowerCase();
          const matchesQuery = name.includes(query.toLowerCase());
          const isCosmetic = cosmeticVariants.some(variant => name.includes(variant));
          return matchesQuery && !isCosmetic;
        })
        .slice(0, POKEMON_RESULTS_LIMIT);

      const pokemonWithDetails = await Promise.all(
        filteredPokemon.map(async (pokemon: { name: string; url: string }) => {
          try {
            const detailResponse = await fetch(pokemon.url);
            const detail = await detailResponse.json();
            
            return {
              name: pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1),
              pokedex_number: detail.id,
              sprite_url: detail.sprites.front_default || getSpriteUrl(detail.id),
              types: detail.types.map((type: { type: { name: string } }) => type.type.name)
            };
          } catch {
            return null;
          }
        })
      );

      setSearchResults(pokemonWithDetails.filter(Boolean).sort((a, b) => a.pokedex_number - b.pokedex_number));
    } catch {
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchPokemon(searchQuery);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const isSelected = (pokemon: Pokemon): boolean => {
    return selectedPokemon.some(p => p.pokedex_number === pokemon.pokedex_number);
  };

  const canAddMore = selectedPokemon.length < MAX_POKEMON_SELECTION;

  const handleAddPokemon = (pokemon: Pokemon) => {
    if (!isSelected(pokemon) && canAddMore) {
      const pokemonVariant: PokemonVariant = {
        name: pokemon.name,
        base_name: pokemon.name,
        pokedex_number: pokemon.pokedex_number,
        generation: Math.ceil(pokemon.pokedex_number / POKEMON_PER_GENERATION),
        types: pokemon.types,
        sprite_url: pokemon.sprite_url,
        is_competitive: false
      };
      
      const newSelection = [...selectedPokemon, pokemonVariant];
      onPokemonChange(newSelection);
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  const handleRemovePokemon = (pokemon: PokemonVariant) => {
    const newSelection = selectedPokemon.filter(p => p.pokedex_number !== pokemon.pokedex_number);
    onPokemonChange(newSelection);
  };

  return (
    <Box>
      <Text fontSize="sm" color="black" mb={2} fontWeight="medium">
        Selected Pokemon ({selectedPokemon.length}/{MAX_POKEMON_SELECTION}) - Choose any Pokemon that define your deck
      </Text>
      
      {selectedPokemon.length > 0 && (
        <VStack gap={2} mb={4}>
          {selectedPokemon.map((pokemon, index) => (
            <Box
              key={`${pokemon.name}-${pokemon.pokedex_number}-${index}`}
              p={3}
              borderWidth="1px"
              borderRadius="md"
              bg="blue.50"
              borderColor="blue.200"
              width="100%"
            >
              <HStack justify="space-between">
                <HStack gap={3}>
                  <Image
                    src={pokemon.sprite_url}
                    alt={pokemon.name}
                    boxSize="40px"
                    borderRadius="md"
                    objectFit="contain"
                  />
                  <VStack align="start" gap={0}>
                    <Text fontWeight="medium" fontSize="sm" color="black">
                      {pokemon.name}
                    </Text>
                    <HStack gap={1}>
                      {pokemon.types.map(type => (
                        <Badge key={type} size="xs" colorScheme="gray" variant="subtle">
                          {type}
                        </Badge>
                      ))}
                    </HStack>
                  </VStack>
                </HStack>
                <Button
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  onClick={() => handleRemovePokemon(pokemon)}
                  fontSize="lg"
                  minWidth="auto"
                  height="auto"
                  p={1}
                >
                  ×
                </Button>
              </HStack>
            </Box>
          ))}
        </VStack>
      )}

      {canAddMore && (
        <VStack gap={3} align="stretch">
          {selectedPokemon.length > 0 && (
            <Text fontSize="sm" color="black" fontWeight="medium">
              Add Another Pokemon ({MAX_POKEMON_SELECTION - selectedPokemon.length} remaining)
            </Text>
          )}
          
          <Input
            placeholder="🔍 Search any Pokemon by name (e.g., Roaring Moon, Pikachu)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            color="black"
            _placeholder={{ color: "gray.500" }}
          />

          {isLoading && (
            <Text fontSize="sm" color="gray.600">Searching...</Text>
          )}

          {searchResults.length > 0 && (
            <Box
              maxHeight="200px"
              overflowY="auto"
              borderWidth="1px"
              borderRadius="md"
              p={2}
            >
              <VStack gap={1} align="stretch">
                {searchResults.map((pokemon) => {
                  const selected = isSelected(pokemon);
                  
                  return (
                    <Button
                      key={`${pokemon.name}-${pokemon.pokedex_number}`}
                      variant="ghost"
                      size="sm"
                      justifyContent="flex-start"
                      onClick={() => handleAddPokemon(pokemon)}
                      disabled={selected}
                      bg={selected ? "gray.100" : "transparent"}
                      _hover={{ bg: selected ? "gray.100" : "gray.50" }}
                      height="auto"
                      py={2}
                    >
                      <HStack gap={3} width="100%">
                        <Image
                          src={pokemon.sprite_url}
                          alt={pokemon.name}
                          boxSize="32px"
                          borderRadius="md"
                          objectFit="contain"
                        />
                        <VStack align="start" gap={0} flex={1}>
                          <Text fontSize="sm" fontWeight="medium" textAlign="left" color="black">
                            {pokemon.name} (#{pokemon.pokedex_number})
                          </Text>
                          <HStack gap={1}>
                            {pokemon.types.map(type => (
                              <Badge key={type} size="xs" colorScheme="gray" variant="subtle">
                                {type}
                              </Badge>
                            ))}
                          </HStack>
                        </VStack>
                        {selected && (
                          <Badge colorScheme="blue" variant="solid" size="xs">
                            Selected
                          </Badge>
                        )}
                      </HStack>
                    </Button>
                  );
                })}
              </VStack>
            </Box>
          )}

          {searchQuery.length >= 3 && searchResults.length === 0 && !isLoading && (
            <Text fontSize="sm" color="gray.600" textAlign="center" py={2}>
              No Pokemon found matching &quot;{searchQuery}&quot;. Try a different search term.
            </Text>
          )}
        </VStack>
      )}
    </Box>
  );
}