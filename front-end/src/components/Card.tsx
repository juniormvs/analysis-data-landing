// src/components/Card.tsx
import React, { ReactNode } from 'react';

interface CardProps {
  title: string;
  description: string;
  icon?: ReactNode;  // Aceita qualquer componente React (ex: <Package />)
  children?: ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, description, icon, children }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="text-4xl mb-4 text-blue-600">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-blue-600">{title}</h3>
      <p className="text-gray-600">{description}</p>
      {children}
    </div>
  );
};