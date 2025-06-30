"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Box,
  Heading,
  Spinner,
  SimpleGrid,
  Text,
  LinkBox,
  LinkOverlay,
} from "@chakra-ui/react";

interface Player {
  id: string;
  name: string;
}

export default function Home() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlayers() {
      const { data, error } = await supabase.from("player").select();
      if (!error && data) {
        setPlayers(data);
      }
      setLoading(false);
    }
    fetchPlayers();
  }, []);

  return (
    <Box maxW="2xl" mx="auto" py={10} px={4}>
      <Heading as="h1" size="xl" mb={8} color="gray.800">
        Players
      </Heading>
      {loading ? (
        <Spinner size="lg" />
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 1 }} gap={4}>
          {players.map((player) => (
            <Box
              key={player.id}
              borderWidth="1px"
              borderRadius="lg"
              boxShadow="sm"
              _hover={{ boxShadow: "md", bg: "gray.50" }}
              transition="box-shadow 0.2s, background 0.2s"
            >
              <LinkBox>
                <Box p={4}>
                  <LinkOverlay as={Link} href={`/player/${player.id}`}>
                    <Text fontSize="lg" fontWeight="medium" color="gray.900">
                      {player.name}
                    </Text>
                  </LinkOverlay>
                </Box>
              </LinkBox>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}
