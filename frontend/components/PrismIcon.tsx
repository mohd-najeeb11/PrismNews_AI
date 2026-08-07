import React from 'react';

export function PrismIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <img
      src="/logo.png"
      alt="PrismNews AI"
      className={`${className} object-contain rounded-lg`}
    />
  );
}
