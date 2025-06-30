# PandePoke Rankings

A tournament tracking application for Pokemon TCG players to submit and view their weekly tournament results.

## Features

- **Tournament Record Submission**: Submit your weekly tournament results with wins, losses, and ties
- **Deck Selection**: Choose from popular meta decks or submit custom Pokemon combinations
- **Player Rankings**: View all players and their individual tournament histories
- **Clean UI**: Simple, responsive design built with Chakra UI

## Getting Started

### Prerequisites

- Node.js 18+ 
- A Supabase account and project

### Environment Setup

1. Clone the repository
2. Copy `.env.example` to `.env.local`
3. Fill in your Supabase project credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### Database Setup

1. Set up your database tables:
   ```bash
   npm run setup:db
   ```

2. (Optional) Populate with test data:
   ```bash
   npm run seed:test
   ```

3. Verify setup:
   ```bash
   npm run check:db
   ```

### Development

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run setup:db` - Create database tables
- `npm run seed:test` - Populate with test data
- `npm run check:db` - Verify database setup

## API Routes

### POST /api/tournament-records

Submit a new tournament record.

**Request Body:**
```json
{
  "playerName": "string",
  "date": "YYYY-MM-DD",
  "wins": 0-50,
  "losses": 0-50,
  "ties": 0-50,
  "selectedDeck": number | "other",
  "customPokemon": [
    {
      "name": "string",
      "pokedex_number": number,
      "sprite_url": "string"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "player_id": "uuid",
  "result_id": number
}
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

Ensure your deployment platform supports:
- Node.js 18+
- Environment variables
- API routes

## Database Schema

See `scripts/schema.sql` for the complete database structure. Key tables:

- `player` - Player information
- `result` - Tournament results
- `deck_archetype_1` & `deck_archetype_2` - Pokemon deck archetypes

## Contributing

This is a personal project for tracking friend group tournaments. Feel free to fork for your own use!

## Built With

- [Next.js 15](https://nextjs.org/) - React framework
- [Chakra UI](https://chakra-ui.com/) - Component library
- [Supabase](https://supabase.com/) - Database and backend
- [TypeScript](https://www.typescriptlang.org/) - Type safety