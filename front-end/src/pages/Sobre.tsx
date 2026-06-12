import React from 'react';
import { Navbar } from '../components/Navbar';

export const Sobre: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
        
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8 text-blue-600">Sobre a Analysis Data</h1>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <p className="text-gray-700 mb-4">
            A <strong>Analysis Data</strong> é uma empresa especializada em soluções de análise de dados e automação de processos.
          </p>
          <p className="text-gray-700 mb-4">
            Nossa missão é ajudar empresas a transformar dados em insights valiosos e automatizar tarefas repetitivas,
            permitindo que suas equipes foquem no que realmente importa: o crescimento do negócio.
          </p>
          <p className="text-gray-700">
            Com uma equipe de especialistas em tecnologia e análise de dados, oferecemos soluções personalizadas
            para atender às necessidades únicas de cada cliente.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sobre;