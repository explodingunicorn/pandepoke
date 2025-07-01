"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@chakra-ui/react";
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
      <header style={{ 
        width: '100%', 
        background: '#fff', 
        boxShadow: '0 2px 8px #f0f1f2', 
        padding: '1rem 0', 
        marginBottom: '2rem' 
      }}>
        <div style={{ 
          maxWidth: '640px', 
          margin: '0 auto', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '0 1rem'
        }}>
          <Link 
            href="/" 
            style={{ 
              fontSize: '1.25rem', 
              fontWeight: 700, 
              color: '#222',
              textDecoration: 'none'
            }}
          >
            PandePoke Rankings
          </Link>
          
          <Button
            onClick={handleOpenModal}
            variant="ghost"
            fontWeight={700}
            fontSize="1.25rem"
            color="#222"
            _hover={{
              background: "transparent",
              transform: "none",
              boxShadow: "none"
            }}
            _active={{
              background: "transparent",
              transform: "none",
              boxShadow: "none"
            }}
            _focus={{
              background: "transparent",
              boxShadow: "none"
            }}
            padding={0}
            height="auto"
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