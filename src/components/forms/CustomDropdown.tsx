"use client";

import { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Image,
  Button,
} from "@chakra-ui/react";
import metaDecksData from "@/data/meta-decks.json";
import type { MetaDeck } from "@/types/submission";

interface CustomDropdownProps {
  selectedDeck: number | "other" | "";
  onDeckChange: (deck: number | "other" | "") => void;
  error?: string;
}

export function CustomDropdown({ selectedDeck, onDeckChange, error }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [metaDecks] = useState<MetaDeck[]>(metaDecksData.metaDecks);

  const getSpriteUrl = (pokedexNumber: number): string => {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokedexNumber}.png`;
  };

  const getSelectedDisplayText = (): string => {
    if (selectedDeck === "other") {
      return "Other (Custom Deck)";
    }
    if (typeof selectedDeck === "number") {
      const deck = metaDecks.find(d => d.id === selectedDeck);
      return deck ? deck.name : "";
    }
    return "Select your deck...";
  };

  const handleOptionClick = (value: number | "other" | "") => {
    onDeckChange(value);
    setIsOpen(false);
  };

  return (
    <Box position="relative">
      {/* Dropdown Trigger */}
      <Button
        variant="outline"
        width="100%"
        justifyContent="space-between"
        onClick={() => setIsOpen(!isOpen)}
        borderColor={error ? "red.500" : "gray.200"}
        bg="white"
        color="black"
        textAlign="left"
        fontWeight="normal"
        fontSize="16px"
        px={4}
        py={3}
        height="auto"
        minHeight="48px"
      >
        <Text>{getSelectedDisplayText()}</Text>
        <Text>{isOpen ? "▲" : "▼"}</Text>
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <Box
          position="absolute"
          bottom="100%"
          left={0}
          right={0}
          bg="white"
          borderWidth="1px"
          borderColor="gray.200"
          borderRadius="md"
          boxShadow="lg"
          zIndex={1000}
          maxHeight="400px"
          overflowY="auto"
        >
          <VStack gap={0} align="stretch">
            {/* Default option */}
            <Button
              variant="ghost"
              width="100%"
              height="auto"
              py={4}
              px={4}
              justifyContent="flex-start"
              onClick={() => handleOptionClick("")}
              bg={selectedDeck === "" ? "blue.50" : "transparent"}
              _hover={{ bg: "gray.50" }}
              borderRadius={0}
              fontWeight="normal"
              color="black"
              minHeight="56px"
            >
              <Text fontSize="16px">Select your deck...</Text>
            </Button>

            {/* Meta deck options */}
            {metaDecks
              .filter(deck => deck.is_active)
              .sort((a, b) => a.rank - b.rank)
              .map((deck) => (
                <Button
                  key={deck.id}
                  variant="ghost"
                  width="100%"
                  height="auto"
                  py={4}
                  px={4}
                  justifyContent="flex-start"
                  onClick={() => handleOptionClick(deck.id)}
                  bg={selectedDeck === deck.id ? "blue.50" : "transparent"}
                  _hover={{ bg: "gray.50" }}
                  borderRadius={0}
                  fontWeight="normal"
                  minHeight="56px"
                >
                  <HStack gap={4} width="100%">
                    <HStack gap={2}>
                      {deck.pokemon.slice(0, 2).map((pokemon, index) => (
                        <Image
                          key={`${pokemon.pokedex_number}-${index}`}
                          src={getSpriteUrl(pokemon.pokedex_number)}
                          alt={pokemon.name}
                          boxSize="32px"
                          objectFit="contain"
                        />
                      ))}
                    </HStack>
                    <Text fontSize="16px" color="black" textAlign="left">
                      {deck.name}
                    </Text>
                  </HStack>
                </Button>
              ))}

            {/* Other option */}
            <Button
              variant="ghost"
              width="100%"
              height="auto"
              py={4}
              px={4}
              justifyContent="flex-start"
              onClick={() => handleOptionClick("other")}
              bg={selectedDeck === "other" ? "blue.50" : "transparent"}
              _hover={{ bg: "gray.50" }}
              borderRadius={0}
              fontWeight="normal"
              borderTop="1px solid"
              borderColor="gray.200"
              minHeight="56px"
            >
              <Text fontSize="16px" color="black">Other (Custom Deck)</Text>
            </Button>
          </VStack>
        </Box>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <Box
          position="fixed"
          top={0}
          left={0}
          width="100vw"
          height="100vh"
          zIndex={999}
          onClick={() => setIsOpen(false)}
        />
      )}
    </Box>
  );
}