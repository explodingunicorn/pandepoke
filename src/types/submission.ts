export interface PokemonVariant {
  name: string;
  base_name: string;
  pokedex_number: number;
  generation: number;
  types: string[];
  variant?: string;
  form?: string;
  sprite_url: string;
  is_competitive?: boolean;
}

export interface MetaDeckPokemon {
  name: string;
  pokedex_number: number;
  variant?: string;
  form?: string;
}

export interface MetaDeck {
  id: number;
  name: string;
  rank: number;
  pokemon: MetaDeckPokemon[];
  is_active?: boolean;
}

export interface TournamentResult {
  player_name: string;
  date: string;
  wins: number;
  losses: number;
  ties: number;
  meta_deck?: MetaDeck;
  custom_pokemon?: PokemonVariant[];
}

export interface SubmissionFormData {
  playerName: string;
  date: string;
  wins: number;
  losses: number;
  ties: number;
  selectedDeck: number | "other" | "";
  customPokemon?: PokemonVariant[];
}

export interface SubmissionValidationErrors {
  playerName?: string;
  date?: string;
  wins?: string;
  losses?: string;
  ties?: string;
  deck?: string;
  general?: string;
}

export interface DatabaseInsertResult {
  player_id: string;
  result_id: number;
  success: boolean;
  error?: string;
}