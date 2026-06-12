import React from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export const Download: React.FC = () => {
  const downloads = [
    {
      titulo: 'Guia de Início Rápido',
      descricao: 'PDF com instruções para configuração inicial do sistema.',
      icone: '📄',
      link: '/downloads/guia-inicio-rapido.pdf', // Substitua pelo link real
    },
    {
      titulo: 'API Documentation',
      descricao: 'Documentação completa da API para desenvolvedores.',
      icone: '📋',
      link: '/downloads/api-docs.pdf',
    },
    {
      titulo: 'Template de Integração',
      descricao: 'Template para integrar nossos serviços ao seu sistema.',
      icone: '🔗',
      link: '/downloads/template-integracao.zip',
    },
  ];

  const handleDownload = (link: string) => {
    // Aqui você pode implementar a lógica para baixar o arquivo
    // Por enquanto, apenas simula o download
    alert(`Baixando arquivo: ${link}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-12 text-blue-600">Downloads</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {downloads.map((download, index) => (
            <Card
              key={index}
              title={download.titulo}
              description={download.descricao}
              icon={download.icone}
            >
              <Button
                onClick={() => handleDownload(download.link)}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Baixar
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Download;