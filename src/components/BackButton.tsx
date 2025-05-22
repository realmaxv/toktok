// src/components/BackButton.tsx
import { memo } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  fallbackPath?: string;
  ariaLabel?: string;
}

export const BackButton: FC<BackButtonProps> = memo(
  ({ fallbackPath = '/', ariaLabel = 'Zurück zur vorherigen Seite' }) => {
    const navigate = useNavigate();

    const handleBack = () => {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate(fallbackPath);
      }
    };

    return (
      <button onClick={handleBack} aria-label={ariaLabel} title={ariaLabel}>
        <ArrowLeft className="w-6 h-6 mr-1" />
      </button>
    );
  }
);
