"use client";

import { useState } from "react";
import {
  Box,
  Button,
  VStack,
  Input,
  Text,
  HStack,
  Stack,
} from "@chakra-ui/react";
import { UnifiedDeckSelector } from "./UnifiedDeckSelector";
import { useSubmitRecord } from "@/hooks/useSubmitRecord";
import type { SubmissionFormData, SubmissionValidationErrors } from "@/types/submission";

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubmissionModal({ isOpen, onClose }: SubmissionModalProps) {
  const { submitRecord, isSubmitting } = useSubmitRecord();
  
  const [formData, setFormData] = useState<SubmissionFormData>({
    playerName: "",
    date: new Date().toISOString().split('T')[0],
    wins: 0,
    losses: 0,
    ties: 0,
    selectedDeck: "",
  });

  const [displayWins, setDisplayWins] = useState<string>("");
  const [displayLosses, setDisplayLosses] = useState<string>("");
  const [displayTies, setDisplayTies] = useState<string>("");

  const [errors, setErrors] = useState<SubmissionValidationErrors>({});
  const [submitError, setSubmitError] = useState<string>("");
  const [submitSuccess, setSubmitSuccess] = useState<string>("");

  const validateForm = (): boolean => {
    const newErrors: SubmissionValidationErrors = {};

    if (!formData.playerName.trim()) {
      newErrors.playerName = "Player name is required";
    } else if (formData.playerName.length < 2) {
      newErrors.playerName = "Player name must be at least 2 characters";
    } else if (formData.playerName.length > 50) {
      newErrors.playerName = "Player name must be less than 50 characters";
    }

    if (!formData.date) {
      newErrors.date = "Tournament date is required";
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      if (selectedDate > today) {
        newErrors.date = "Tournament date cannot be in the future";
      }
    }

    if (formData.wins < 0) {
      newErrors.wins = "Wins cannot be negative";
    }
    if (formData.losses < 0) {
      newErrors.losses = "Losses cannot be negative";
    }
    if (formData.ties < 0) {
      newErrors.ties = "Ties cannot be negative";
    }

    const totalGames = formData.wins + formData.losses + formData.ties;
    if (totalGames === 0) {
      newErrors.general = "You must have played at least one game";
    }

    if (!formData.selectedDeck) {
      newErrors.deck = "Please select a deck";
    }
    if (formData.selectedDeck === "other" && (!formData.customPokemon || formData.customPokemon.length === 0)) {
      newErrors.deck = "Please select at least one Pokemon that defines your custom deck";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setSubmitError("");
    setSubmitSuccess("");
    
    if (!validateForm()) {
      return;
    }

    try {
      const result = await submitRecord(formData);
      
      if (result.success) {
        setSubmitSuccess(`Tournament result has been recorded for ${formData.playerName}!`);
        
        setFormData({
          playerName: "",
          date: new Date().toISOString().split('T')[0],
          wins: 0,
          losses: 0,
          ties: 0,
          selectedDeck: "",
        });
        setDisplayWins("");
        setDisplayLosses("");
        setDisplayTies("");
        setErrors({});
        
        setTimeout(() => {
          setSubmitSuccess("");
          onClose();
        }, 2000);
      } else {
        setSubmitError(result.error || "An error occurred while submitting your record");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitError("An unexpected error occurred. Please try again.");
    }
  };

  const handleClose = () => {
    setErrors({});
    setSubmitError("");
    setSubmitSuccess("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      width="100vw"
      height="100vh"
      bg="rgba(0, 0, 0, 0.5)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex="9999"
    >
      <Box
        bg="white"
        borderRadius="lg"
        boxShadow="xl"
        maxWidth="500px"
        width="90%"
        maxHeight="90vh"
        overflowY="auto"
        p={6}
      >
        <HStack justifyContent="space-between" mb={4}>
          <Text fontSize="xl" fontWeight="bold" color="black">Submit Tournament Record</Text>
          <Button 
            size="md" 
            variant="ghost" 
            onClick={handleClose}
            color="black"
            fontSize="xl"
            fontWeight="bold"
            _hover={{ bg: "gray.100" }}
            borderRadius="md"
            minWidth="40px"
            height="40px"
          >
            ✕
          </Button>
        </HStack>

        <VStack gap={4} align="stretch">
          {submitError && (
            <Box bg="red.50" border="1px solid" borderColor="red.200" borderRadius="md" p={3}>
              <Text color="red.700" fontSize="sm">{submitError}</Text>
            </Box>
          )}
          
          {submitSuccess && (
            <Box bg="green.50" border="1px solid" borderColor="green.200" borderRadius="md" p={3}>
              <Text color="green.700" fontSize="sm">{submitSuccess}</Text>
            </Box>
          )}
          
          {errors.general && (
            <Box bg="red.50" border="1px solid" borderColor="red.200" borderRadius="md" p={3}>
              <Text color="red.700" fontSize="sm">{errors.general}</Text>
            </Box>
          )}

          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2} color={errors.playerName ? "red.500" : "black"}>
              Player Name *
            </Text>
            <Input
              value={formData.playerName}
              onChange={(e) => setFormData(prev => ({ ...prev, playerName: e.target.value }))}
              placeholder="Enter your name"
              maxLength={50}
              borderColor={errors.playerName ? "red.500" : "gray.200"}
              color="black"
              _placeholder={{ color: "gray.500" }}
            />
            {errors.playerName && (
              <Text color="red.500" fontSize="xs" mt={1}>{errors.playerName}</Text>
            )}
          </Box>

          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2} color={errors.date ? "red.500" : "black"}>
              Tournament Date *
            </Text>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              max={new Date().toISOString().split('T')[0]}
              borderColor={errors.date ? "red.500" : "gray.200"}
              color="black"
            />
            {errors.date && (
              <Text color="red.500" fontSize="xs" mt={1}>{errors.date}</Text>
            )}
          </Box>

          <Stack gap={3}>
            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2} color={errors.wins ? "red.500" : "black"}>
                Wins
              </Text>
              <Input
                type="number"
                value={displayWins}
                onChange={(e) => {
                  const value = e.target.value;
                  setDisplayWins(value);
                  setFormData(prev => ({ ...prev, wins: Math.max(0, parseInt(value) || 0) }));
                }}
                onFocus={(e) => {
                  if (e.target.value === "0") {
                    setDisplayWins("");
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value === "") {
                    setDisplayWins("0");
                    setFormData(prev => ({ ...prev, wins: 0 }));
                  }
                }}
                placeholder="0"
                min={0}
                max={99}
                borderColor={errors.wins ? "red.500" : "gray.200"}
                color="black"
                _placeholder={{ color: "gray.500" }}
              />
              {errors.wins && (
                <Text color="red.500" fontSize="xs" mt={1}>{errors.wins}</Text>
              )}
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2} color={errors.losses ? "red.500" : "black"}>
                Losses
              </Text>
              <Input
                type="number"
                value={displayLosses}
                onChange={(e) => {
                  const value = e.target.value;
                  setDisplayLosses(value);
                  setFormData(prev => ({ ...prev, losses: Math.max(0, parseInt(value) || 0) }));
                }}
                onFocus={(e) => {
                  if (e.target.value === "0") {
                    setDisplayLosses("");
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value === "") {
                    setDisplayLosses("0");
                    setFormData(prev => ({ ...prev, losses: 0 }));
                  }
                }}
                placeholder="0"
                min={0}
                max={99}
                borderColor={errors.losses ? "red.500" : "gray.200"}
                color="black"
                _placeholder={{ color: "gray.500" }}
              />
              {errors.losses && (
                <Text color="red.500" fontSize="xs" mt={1}>{errors.losses}</Text>
              )}
            </Box>

            <Box>
              <Text fontSize="sm" fontWeight="medium" mb={2} color={errors.ties ? "red.500" : "black"}>
                Ties
              </Text>
              <Input
                type="number"
                value={displayTies}
                onChange={(e) => {
                  const value = e.target.value;
                  setDisplayTies(value);
                  setFormData(prev => ({ ...prev, ties: Math.max(0, parseInt(value) || 0) }));
                }}
                onFocus={(e) => {
                  if (e.target.value === "0") {
                    setDisplayTies("");
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value === "") {
                    setDisplayTies("0");
                    setFormData(prev => ({ ...prev, ties: 0 }));
                  }
                }}
                placeholder="0"
                min={0}
                max={99}
                borderColor={errors.ties ? "red.500" : "gray.200"}
                color="black"
                _placeholder={{ color: "gray.500" }}
              />
              {errors.ties && (
                <Text color="red.500" fontSize="xs" mt={1}>{errors.ties}</Text>
              )}
            </Box>
          </Stack>

          <UnifiedDeckSelector
            selectedDeck={formData.selectedDeck}
            customPokemon={formData.customPokemon}
            onDeckChange={(selectedDeck) => setFormData(prev => ({ 
              ...prev, 
              selectedDeck,
              customPokemon: selectedDeck === "other" ? prev.customPokemon : undefined 
            }))}
            onCustomPokemonChange={(customPokemon) => setFormData(prev => ({ ...prev, customPokemon }))}
            error={errors.deck}
          />
        </VStack>

        <HStack justifyContent="flex-end" mt={6}>
          <Button 
            colorScheme="blue" 
            variant="solid"
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            color="white"
            bg="blue.500"
            _hover={{ bg: "blue.600" }}
          >
            {isSubmitting ? "Submitting..." : "Submit Record"}
          </Button>
        </HStack>
      </Box>
    </Box>
  );
}