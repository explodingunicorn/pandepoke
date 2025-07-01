export interface PlayerApiResponse {
  success: boolean;
  player_id?: string;
  isNew?: boolean;
  error?: string;
}

export interface PlayerSearchResponse {
  success: boolean;
  players: Array<{
    id: string;
    name: string;
  }>;
  error?: string;
}

export interface ResultApiResponse {
  success: boolean;
  result_id?: number;
  error?: string;
} 