import React from 'react';

export function PrismIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 2L2 22H22L12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 2L12 22"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="2 2"
      />
      <path
        d="M12 9L18 22"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.8"
      />
      <path
        d="M12 9L6 22"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.8"
      />
    </svg>
  );
}
