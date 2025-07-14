"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    customPokemon: [],
    password: '',
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
    if (formData.wins < 0) newErrors.wins = "Wins cannot be negative";
    if (formData.losses < 0) newErrors.losses = "Losses cannot be negative";
    if (formData.ties < 0) newErrors.ties = "Ties cannot be negative";
    const totalGames = formData.wins + formData.losses + formData.ties;
    if (totalGames === 0) newErrors.general = "You must have played at least one game";
    if ((!formData.customPokemon || formData.customPokemon.length === 0)) {
      newErrors.deck = "Please select at least one Pokemon that defines your custom deck";
    }
    if (!formData.password || formData.password.trim().length === 0) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setSubmitError("");
    setSubmitSuccess("");
    if (!validateForm()) return;
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
          customPokemon: [],
          password: "",
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
    } catch {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="max-w-md w-full max-h-[90vh] overflow-y-auto p-6 relative">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-black">Submit Tournament Record</h2>
          <Button variant="ghost" size="icon" onClick={handleClose} className="text-xl font-bold text-black">
            ✕
          </Button>
        </div>
        <CardContent className="p-0">
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-2">
              <span className="text-red-700 text-sm">{submitError}</span>
            </div>
          )}
          {submitSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-2">
              <span className="text-green-700 text-sm">{submitSuccess}</span>
            </div>
          )}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-2">
              <span className="text-red-700 text-sm">{errors.general}</span>
            </div>
          )}
          <div className="mb-4">
            <Label htmlFor="playerName" className={errors.playerName ? "text-red-500" : "text-black"}>
              Player Name *
            </Label>
            <Input
              id="playerName"
              value={formData.playerName}
              onChange={(e) => setFormData(prev => ({ ...prev, playerName: e.target.value }))}
              placeholder="Enter your name"
              maxLength={50}
              className={`mt-1 ${errors.playerName ? "border-red-500" : "border-gray-200"}`}
            />
            {errors.playerName && (
              <span className="text-red-500 text-xs mt-1 block">{errors.playerName}</span>
            )}
          </div>
          <div className="mb-4">
            <Label htmlFor="date" className={errors.date ? "text-red-500" : "text-black"}>
              Tournament Date *
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              max={new Date().toISOString().split('T')[0]}
              className={`mt-1 ${errors.date ? "border-red-500" : "border-gray-200"}`}
            />
            {errors.date && (
              <span className="text-red-500 text-xs mt-1 block">{errors.date}</span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div>
              <Label htmlFor="wins" className={errors.wins ? "text-red-500" : "text-black"}>Wins</Label>
              <Input
                id="wins"
                type="number"
                value={displayWins}
                onChange={(e) => {
                  const value = e.target.value;
                  setDisplayWins(value);
                  setFormData(prev => ({ ...prev, wins: Math.max(0, parseInt(value) || 0) }));
                }}
                onFocus={(e) => { if (e.target.value === "0") setDisplayWins(""); }}
                onBlur={(e) => { if (e.target.value === "") { setDisplayWins("0"); setFormData(prev => ({ ...prev, wins: 0 })); }}}
                placeholder="0"
                min={0}
                max={99}
                className={`mt-1 ${errors.wins ? "border-red-500" : "border-gray-200"}`}
              />
              {errors.wins && (
                <span className="text-red-500 text-xs mt-1 block">{errors.wins}</span>
              )}
            </div>
            <div>
              <Label htmlFor="losses" className={errors.losses ? "text-red-500" : "text-black"}>Losses</Label>
              <Input
                id="losses"
                type="number"
                value={displayLosses}
                onChange={(e) => {
                  const value = e.target.value;
                  setDisplayLosses(value);
                  setFormData(prev => ({ ...prev, losses: Math.max(0, parseInt(value) || 0) }));
                }}
                onFocus={(e) => { if (e.target.value === "0") setDisplayLosses(""); }}
                onBlur={(e) => { if (e.target.value === "") { setDisplayLosses("0"); setFormData(prev => ({ ...prev, losses: 0 })); }}}
                placeholder="0"
                min={0}
                max={99}
                className={`mt-1 ${errors.losses ? "border-red-500" : "border-gray-200"}`}
              />
              {errors.losses && (
                <span className="text-red-500 text-xs mt-1 block">{errors.losses}</span>
              )}
            </div>
            <div>
              <Label htmlFor="ties" className={errors.ties ? "text-red-500" : "text-black"}>Ties</Label>
              <Input
                id="ties"
                type="number"
                value={displayTies}
                onChange={(e) => {
                  const value = e.target.value;
                  setDisplayTies(value);
                  setFormData(prev => ({ ...prev, ties: Math.max(0, parseInt(value) || 0) }));
                }}
                onFocus={(e) => { if (e.target.value === "0") setDisplayTies(""); }}
                onBlur={(e) => { if (e.target.value === "") { setDisplayTies("0"); setFormData(prev => ({ ...prev, ties: 0 })); }}}
                placeholder="0"
                min={0}
                max={99}
                className={`mt-1 ${errors.ties ? "border-red-500" : "border-gray-200"}`}
              />
              {errors.ties && (
                <span className="text-red-500 text-xs mt-1 block">{errors.ties}</span>
              )}
            </div>
          </div>
          <div className="mb-4">
            <UnifiedDeckSelector
              customPokemon={formData.customPokemon}
              onCustomPokemonChange={(customPokemon) => setFormData(prev => ({ ...prev, customPokemon }))}
              error={errors.deck}
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="password" className={errors.password ? "text-red-500" : "text-black"}>
              Password *
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Enter password"
              autoComplete="current-password"
              className={`mt-1 ${errors.password ? "border-red-500" : "border-gray-200"}`}
            />
            {errors.password && (
              <span className="text-red-500 text-xs mt-1 block">{errors.password}</span>
            )}
          </div>
          <div className="flex justify-end mt-6">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {isSubmitting ? "Submitting..." : "Submit Record"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}