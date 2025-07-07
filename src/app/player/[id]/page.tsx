"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Result {
  id: number;
  week_start: string;
  wins: number;
  losees: number;
  ties: number;
  deck_archetype_1: { image_url: string; Name: string } | null;
  deck_archetype_2: { image_url: string; Name: string } | null;
}

export default function PlayerPage() {
  const { id } = useParams<{ id: string }>();
  const [results, setResults] = useState<Result[]>([]);
  const [playerName, setPlayerName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      // Fetch player name
      const { data: playerData } = await supabase
        .from("player")
        .select("name")
        .eq("id", id)
        .single();
      setPlayerName(playerData?.name || "");

      // Fetch results with joined pokemon data
      const { data, error } = await supabase
        .from("result")
        .select(`*, deck_archetype_1 (image_url, Name), deck_archetype_2 (image_url, Name)`)
        .eq("player_id", id)
        .order("week_start", { ascending: false });
      if (!error && data) {
        setResults(
          data.map((result: any) => ({
            ...result,
            deck_archetype_1: result.deck_archetype_1 ? result.deck_archetype_1 : null,
            deck_archetype_2: result.deck_archetype_2 ? result.deck_archetype_2 : null,
          }))
        );
      }
      setLoading(false);
    }
    if (id) fetchResults();
  }, [id]);

  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
      <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block font-bold">← Back to Players</Link>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">{playerName}</h1>
      {loading ? (
        <div>Loading...</div>
      ) : results.length === 0 ? (
        <div>No results found for this player.</div>
      ) : (
        <div className="grid gap-6">
          {results.map((result) => (
            <Card key={result.id} className="bg-white">
              <CardContent className="flex flex-col sm:flex-row items-center gap-4 p-4">
                <div className="flex items-center gap-2">
                  {result.deck_archetype_1 && (
                    <div className="flex flex-col items-center">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={result.deck_archetype_1.image_url} alt={result.deck_archetype_1.Name} />
                        <AvatarFallback>{result.deck_archetype_1.Name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs mt-1">{result.deck_archetype_1.Name}</span>
                    </div>
                  )}
                  {result.deck_archetype_2 && (
                    <div className="flex flex-col items-center">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={result.deck_archetype_2.image_url} alt={result.deck_archetype_2.Name} />
                        <AvatarFallback>{result.deck_archetype_2.Name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs mt-1">{result.deck_archetype_2.Name}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm text-gray-500 mb-1">Week of {new Date(result.week_start).toLocaleDateString()}</div>
                  <div className="flex gap-4 text-sm">
                    <span className="font-semibold text-green-700">Wins: {result.wins}</span>
                    <span className="font-semibold text-red-700">Losses: {result.losees}</span>
                    <span className="font-semibold text-yellow-700">Ties: {result.ties}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
} 