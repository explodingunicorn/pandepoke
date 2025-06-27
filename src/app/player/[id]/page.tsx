"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import NextLink from "next/link";
import {
  Box,
  Heading,
  Spinner,
  Text,
  Flex,
  SimpleGrid,
  Link,
  Image as ChakraImage,
} from "@chakra-ui/react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Result {
  id: number;
  week_start: string;
  wins: number;
  losses: number;
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
        console.log(data);
        setResults(
          data.map((result: Result) => ({
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
    <Box maxW="2xl" mx="auto" py={10} px={4}>
      <Link as={NextLink} href="/" color="blue.500" mb={4} display="inline-block" fontWeight="bold">
        ← Back to Players
      </Link>
      <Heading as="h1" size="lg" mb={6} color="gray.800">
        {playerName}
      </Heading>
      {loading ? (
        <Spinner size="lg" />
      ) : results.length === 0 ? (
        <Text>No results found for this player.</Text>
      ) : (
        <SimpleGrid gap={6}>
          {results.map((result) => (
            <Flex
              key={result.id}
              bg="white"
              borderRadius="lg"
              boxShadow="sm"
              p={4}
              align="center"
              direction={{ base: "column", sm: "row" }}
              gap={4}
            >
              <Flex align="center" gap={2}>
                {result.deck_archetype_1 && (
                  <Flex direction="column" align="center">
                    <ChakraImage objectFit="contain" src={result.deck_archetype_1.image_url} alt={result.deck_archetype_1.Name} boxSize="48px" />
                  </Flex>
                )}
                {result.deck_archetype_2 && (
                  <Flex direction="column" align="center">
                    <ChakraImage objectFit="contain" src={result.deck_archetype_2.image_url} alt={result.deck_archetype_2.Name} boxSize="48px" />
                  </Flex>
                )}
              </Flex>
              <Box flex="1">
                <Text fontSize="sm" color="gray.500" mb={1}>
                  Week of {new Date(result.week_start).toLocaleDateString()}
                </Text>
                <Flex gap={4} fontSize="sm">
                  <Text fontWeight="semibold" color="green.700">Wins: {result.wins}</Text>
                  <Text fontWeight="semibold" color="red.700">Losses: {result.losses}</Text>
                  <Text fontWeight="semibold" color="yellow.700">Ties: {result.ties}</Text>
                </Flex>
              </Box>
            </Flex>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
} 