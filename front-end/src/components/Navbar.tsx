import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../pages/AuthContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="bg-white shadow-md py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          Analysis<span className="text-gray-800">Data</span>
        </Link>
        <div className="hidden md:flex space-x-8">
          <button
            onClick={() => scrollToSection('inicio')}
            className="text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
          >
            Início
          </button>
          <button
            onClick={() => scrollToSection('servicos')}
            className="text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
          >
            Serviços
          </button>
          <button
            onClick={() => scrollToSection('sobre')}
            className="text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
          >
            Sobre
          </button>
          <button
            onClick={() => scrollToSection('contato')}
            className="text-gray-700 hover:text-blue-600 transition-colors cursor-pointer"
          >
            Contato
          </button>
          {!isAuthenticated ? (
            <Link
              to="/login"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Área do Cliente
            </Link>
          ) : (
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-semibold border-r pr-4 border-gray-200">
                Olá, {user?.nome}
              </span>
              <button
                onClick={logout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all font-medium text-sm"
              >
                Sair
              </button>
            </div>
          )}
        </div>
        <button className="md:hidden text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </nav>
  );
};