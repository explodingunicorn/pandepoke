/**
 * Types for the tournament submission system
 */

export interface PokemonVariant {
  /** Full name of the Pokemon variant (e.g., "Wellspring Ogerpon", "Gardevoir ex") */
  name: string;
  /** Base Pokemon name (e.g., "Ogerpon", "Gardevoir") */
  base_name: string;
  /** National Pokedex number */
  pokedex_number: number;
  /** Pokemon generation (1-9) */
  generation: number;
  /** Pokemon types */
  types: string[];
  /** Variant type (e.g., "ex", "N's ex", "Cynthia's ex") */
  variant?: string;
  /** Form identifier (e.g., "Wellspring Mask", "Teal Mask") */
  form?: string;
  /** URL to the Pokemon sprite image */
  sprite_url: string;
  /** Whether this Pokemon is commonly used in competitive play */
  is_competitive?: boolean;
}

export interface MetaDeckPokemon {
  /** Full name of the Pokemon variant */
  name: string;
  /** National Pokedex number */
  pokedex_number: number;
  /** Variant type if applicable */
  variant?: string;
  /** Form identifier if applicable */
  form?: string;
}

export interface MetaDeck {
  /** Unique identifier for the meta deck */
  id: number;
  /** Display name of the deck */
  name: string;
  /** Popularity ranking (1-15) */
  rank: number;
  /** Pokemon that define this deck */
  pokemon: MetaDeckPokemon[];
  /** Whether this deck is currently active in the meta */
  is_active?: boolean;
}

export interface TournamentResult {
  /** Player name */
  player_name: string;
  /** Tournament date */
  date: string;
  /** Number of wins */
  wins: number;
  /** Number of losses */
  losses: number;
  /** Number of ties */
  ties: number;
  /** Selected meta deck (if any) */
  meta_deck?: MetaDeck;
  /** Custom Pokemon selection (if "Other" was chosen) */
  custom_pokemon?: PokemonVariant[];
}

export interface SubmissionFormData {
  /** Player name */
  playerName: string;
  /** Tournament date in YYYY-MM-DD format */
  date: string;
  /** Number of wins (0+) */
  wins: number;
  /** Number of losses (0+) */
  losses: number;
  /** Number of ties (0+) */
  ties: number;
  /** Selected deck - either meta deck ID or "other" for custom */
  selectedDeck: number | "other" | "";
  /** Selected custom Pokemon (when selectedDeck is "other") */
  customPokemon?: PokemonVariant[];
  password: string;
}

export interface SubmissionValidationErrors {
  playerName?: string;
  date?: string;
  wins?: string;
  losses?: string;
  ties?: string;
  deck?: string;
  general?: string;
  password?: string;
}

export interface DatabaseInsertResult {
  /** ID of the created player record */
  player_id: string;
  /** ID of the created result record */
  result_id: number;
  /** Whether the submission was successful */
  success: boolean;
  /** Error message if submission failed */
  error?: string;
}