"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <div>
      <div className="text-sm text-black mb-2 font-medium">
        Selected Pokemon ({selectedPokemon.length}/{MAX_POKEMON_SELECTION}) - Choose any Pokemon that define your deck
      </div>
      {selectedPokemon.length > 0 && (
        <div className="flex flex-col gap-2 mb-4">
          {selectedPokemon.map((pokemon, index) => (
            <div
              key={`${pokemon.name}-${pokemon.pokedex_number}-${index}`}
              className="p-3 border border-blue-200 rounded-md bg-blue-50 w-full"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={pokemon.sprite_url}
                    alt={pokemon.name}
                    className="w-10 h-10 rounded-md object-contain"
                  />
                  <div className="flex flex-col gap-0">
                    <span className="font-medium text-sm text-black">{pokemon.name}</span>
                    <div className="flex gap-1">
                      {pokemon.types.map(type => (
                        <span key={type} className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemovePokemon(pokemon)}
                  className="text-lg min-w-0 h-auto px-2 py-1 text-red-600"
                >
                  ×
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      {canAddMore && (
        <div className="flex flex-col gap-3">
          {selectedPokemon.length > 0 && (
            <div className="text-sm text-black font-medium">
              Add Another Pokemon ({MAX_POKEMON_SELECTION - selectedPokemon.length} remaining)
            </div>
          )}
          <Input
            placeholder="🔍 Search any Pokemon by name (e.g., Roaring Moon, Pikachu)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {isLoading && (
            <div className="text-sm text-gray-600">Searching...</div>
          )}
          {searchResults.length > 0 && (
            <div className="max-h-52 overflow-y-auto border border-gray-200 rounded-md p-2">
              <div className="flex flex-col gap-1">
                {searchResults.map((pokemon) => {
                  const selected = isSelected(pokemon);
                  return (
                    <Button
                      key={`${pokemon.name}-${pokemon.pokedex_number}`}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddPokemon(pokemon)}
                      disabled={selected}
                      className={`justify-start h-auto py-2 ${selected ? "bg-gray-100" : ""}`}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <img
                          src={pokemon.sprite_url}
                          alt={pokemon.name}
                          className="w-8 h-8 rounded-md object-contain"
                        />
                        <div className="flex flex-col gap-0 flex-1">
                          <span className="text-sm font-medium text-left text-black">
                            {pokemon.name} (#{pokemon.pokedex_number})
                          </span>
                          <div className="flex gap-1">
                            {pokemon.types.map(type => (
                              <span key={type} className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded">
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>
                        {selected && (
                          <span className="inline-block bg-blue-500 text-white text-xs px-2 py-0.5 rounded">Selected</span>
                        )}
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
          {searchQuery.length >= 3 && searchResults.length === 0 && !isLoading && (
            <div className="text-sm text-gray-600 text-center py-2">
              No Pokemon found matching &quot;{searchQuery}&quot;. Try a different search term.
            </div>
          )}
        </div>
      )}
    </div>
  );
}