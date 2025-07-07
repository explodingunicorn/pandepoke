"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SubmissionModal } from "./forms/SubmissionModal";

export function SubmissionHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <header className="w-full bg-white shadow p-4 mb-8">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4">
          <Link 
            href="/" 
            className="text-xl font-bold text-gray-900 no-underline"
          >
            PandePoke Rankings
          </Link>
          <Button
            variant="ghost"
            className="text-xl font-bold text-gray-900 px-0 h-auto"
            onClick={handleOpenModal}
          >
            Submit Record
          </Button>
        </div>
      </header>
      <SubmissionModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
      />
    </>
  );
}