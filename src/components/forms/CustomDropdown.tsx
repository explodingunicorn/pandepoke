"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getSpriteUrl } from "@/utils/pokemon";
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

  const getSelectedDisplayText = (): string => {
    if (selectedDeck === "other") return "Other (Custom Deck)";
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
    <div className="relative">
      <Button
        variant="outline"
        className={`w-full flex justify-between items-center text-left font-normal text-base px-4 py-3 min-h-[48px] ${error ? "border-red-500" : "border-gray-200"}`}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span>{getSelectedDisplayText()}</span>
        <span>{isOpen ? "▲" : "▼"}</span>
      </Button>
      {isOpen && (
        <div className="absolute left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto mt-1">
          <button
            className={`w-full text-left px-4 py-4 text-base ${selectedDeck === "" ? "bg-blue-50" : ""} hover:bg-gray-50`}
            onClick={() => handleOptionClick("")}
            type="button"
          >
            Select your deck...
          </button>
          {metaDecks.filter(deck => deck.is_active).sort((a, b) => a.rank - b.rank).map((deck) => (
            <button
              key={deck.id}
              className={`w-full text-left px-4 py-4 text-base flex items-center gap-4 ${selectedDeck === deck.id ? "bg-blue-50" : ""} hover:bg-gray-50`}
              onClick={() => handleOptionClick(deck.id)}
              type="button"
            >
              <span className="flex gap-2">
                {deck.pokemon.slice(0, 2).map((pokemon, index) => (
                  <img
                    key={`${pokemon.pokedex_number}-${index}`}
                    src={getSpriteUrl(pokemon.pokedex_number)}
                    alt={pokemon.name}
                    className="w-8 h-8 object-contain"
                  />
                ))}
              </span>
              <span className="text-black">{deck.name}</span>
            </button>
          ))}
          <button
            className={`w-full text-left px-4 py-4 text-base border-t border-gray-200 ${selectedDeck === "other" ? "bg-blue-50" : ""} hover:bg-gray-50`}
            onClick={() => handleOptionClick("other")}
            type="button"
          >
            Other (Custom Deck)
          </button>
        </div>
      )}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}