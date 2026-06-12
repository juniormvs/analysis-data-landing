// src/pages/LandingPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { servicoApi } from '../api/api';
import Footer from '../components/Footer';
import ContactForm from '../components/ContactForm';

// Interface para o serviço
interface Servico {
  id: number;
  nome: string;
  descricao: string;
  preco: string;
  ativo: boolean;
}

const LandingPage: React.FC = () => {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServicos = async () => {
      try {
        setLoading(true);
        const data = await servicoApi.listServicos();
        setServicos(data);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Erro ao buscar serviços. Tente novamente mais tarde.";
        setError(errorMessage);
        console.error("Erro ao buscar serviços:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchServicos();
  }, []);

  return (
    <div>
      {/* Seção Hero (apresentação) */}
      <section style={{
        padding: '60px 20px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #1a2332 0%, #2a3441 100%)',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Analysis Data</h1>
        <p style={{
          fontSize: '1.2rem',
          marginBottom: '30px',
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          Soluções em análise de dados e automação para alavancar o seu negócio.
        </p>
        <div style={{
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Link
            to="/servicos"
            style={{
              padding: '12px 24px',
              background: '#fff',
              color: '#1a2332',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Ver Todos os Serviços
          </Link>
          <a
            href="https://wa.me/5511999999999?text=Olá! Gostaria de saber mais sobre os serviços da Analysis Data."
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '12px 24px',
              background: '#25D366',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'transform 0.2s, box-shadow 0.2s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-9-9 9 9 0 0 1 9-9c2.5 0 4.8.9 6.7 2.6L21 12z" />
            </svg>
            Fale Conosco pelo WhatsApp
          </a>
        </div>
      </section>

 {/* Seção Sobre (nova) */}
      <section style={{
        padding: '60px 20px',
        backgroundColor: 'white'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '40px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <h2 style={{ color: '#1a2332', marginBottom: '20px', fontSize: '2rem' }}>Sobre Nós</h2>
            <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '20px' }}>
              Somos uma empresa especializada em <strong>análise de dados</strong> e <strong>automação de processos</strong>.
              Nossa missão é ajudar empresas a <strong>tomar decisões mais inteligentes</strong> por meio de insights precisos e soluções tecnológicas inovadoras.
            </p>
            <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '20px' }}>
              Com uma equipe de especialistas em ciência de dados, desenvolvimento de software e inteligência artificial,
              oferecemos serviços personalizados para <strong>otimizar sua operação</strong> e <strong>maximizar seus resultados</strong>.
            </p>
            <Link
              to="/servicos"
              style={{
                display: 'inline-block',
                padding: '10px 20px',
                backgroundColor: '#4CAF50',
                color: 'white',
                borderRadius: '4px',
                textDecoration: 'none',
                fontWeight: 'bold',
                transition: 'background-color 0.3s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
            >
              Conheça Nossos Serviços
            </Link>
          </div>
          <div style={{ flex: 1, minWidth: '300px', textAlign: 'center' }}>
            <div style={{
              backgroundColor: '#f0f8ff',
              padding: '40px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="1.5" style={{ margin: '0 auto 20px' }}>
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              <h3 style={{ color: '#1a2332', marginBottom: '10px' }}>Inovação e Tecnologia</h3>
              <p style={{ color: '#666' }}>Soluções personalizadas para o seu negócio.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Seção de Serviços (dinâmica) */}
      <section style={{
        padding: '40px 20px',
        backgroundColor: '#f9f9f9'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#1a2332' }}>Nossos Serviços</h2>
          {loading ? (
            <div style={{ textAlign: 'center' }}>Carregando serviços...</div>
          ) : error ? (
            <div style={{ textAlign: 'center', color: 'red' }}>{error}</div>
          ) : servicos.length === 0 ? (
            <div style={{ textAlign: 'center' }}>Nenhum serviço disponível no momento.</div>
          ) : (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '20px',
              justifyContent: 'center'
            }}>
              {servicos.map((servico) => (
                <div
                  key={servico.id}
                  style={{
                    border: '1px solid #ddd',
                    padding: '20px',
                    borderRadius: '8px',
                    width: '300px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    backgroundColor: 'white',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                  }}
                >
                  <h3 style={{ color: '#1a2332', marginBottom: '10px' }}>{servico.nome}</h3>
                  <p style={{ color: '#666', marginBottom: '15px' }}>{servico.descricao}</p>
                  <p style={{
                    fontWeight: 'bold',
                    color: '#4CAF50',
                    marginBottom: '15px',
                    fontSize: '1.2rem'
                  }}>
                    R$ {servico.preco}
                  </p>
                  <Link
                    to="/servicos"
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      padding: '10px',
                      borderRadius: '4px',
                      textDecoration: 'none',
                      fontWeight: 'bold',
                      transition: 'background-color 0.3s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
                  >
                    Saiba Mais
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Seção de Contato */}
      <section style={{
        padding: '40px 20px',
        backgroundColor: 'white'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#1a2332' }}>Fale Conosco</h2>
          <ContactForm />
        </div>
      </section>

      {/* Rodapé */}
      <Footer />
    </div>
  );
};

export default LandingPage;