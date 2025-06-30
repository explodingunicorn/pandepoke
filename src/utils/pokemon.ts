import { POKEMON_SPRITES_BASE } from '@/lib/constants';

export const getSpriteUrl = (pokedexNumber: number): string => {
  return `${POKEMON_SPRITES_BASE}/${pokedexNumber}.png`;
};