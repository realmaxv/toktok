// src/components/BackButton.tsx
import { memo } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  ariaLabel?: string;
  onClick?: () => void;
}

export const BackButton: FC<BackButtonProps> = memo(
  ({ ariaLabel = 'Zurück zur vorherigen Seite', onClick }) => {
    const navigate = useNavigate();

    return (
      <button
        onClick={onClick ?? (() => navigate(-1))}
        aria-label={ariaLabel}
        title={ariaLabel}
      >
        <ArrowLeft className="w-6 h-6 mr-1 cursor-pointer" />
      </button>
    );
  }
);
