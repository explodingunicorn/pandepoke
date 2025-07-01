// API Configuration
export const POKEMON_API_BASE = process.env.NEXT_PUBLIC_POKEMON_API_BASE || 'https://pokeapi.co/api/v2';
export const POKEMON_SPRITES_BASE = process.env.NEXT_PUBLIC_POKEMON_SPRITES_BASE || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

// Pokemon Search Configuration
export const POKEMON_SEARCH_LIMIT = 1500;
export const POKEMON_RESULTS_LIMIT = 20;
export const MAX_POKEMON_SELECTION = 2;

// Generation calculation
export const POKEMON_PER_GENERATION = 151;

// Debounce timing
export const SEARCH_DEBOUNCE_MS = 300;