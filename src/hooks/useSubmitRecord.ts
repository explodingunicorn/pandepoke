"use client";

import { useState } from "react";
import type { SubmissionFormData, DatabaseInsertResult } from "@/types/submission";

export function useSubmitRecord() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitRecord = async (formData: SubmissionFormData): Promise<DatabaseInsertResult> => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/tournament-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Failed to submit tournament record',
          player_id: "",
          result_id: 0
        };
      }

      const result = await response.json();
      return {
        success: true,
        player_id: result.player_id,
        result_id: result.result_id
      };

    } catch {
      return {
        success: false,
        error: "An unexpected error occurred. Please try again.",
        player_id: "",
        result_id: 0
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitRecord,
    isSubmitting
  };
}