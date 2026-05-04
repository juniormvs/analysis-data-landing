from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Text, text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel, EmailStr, field_validator
import re
import os
from dotenv import load_dotenv
from typing import Optional
from datetime import datetime as dt

# Carrega as variáveis de ambiente
load_dotenv()

# Configuração do CORS (para o front-end React)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuração do banco de dados (PostgreSQL)
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")
DB_HOST = os.getenv("DB_HOST", "db")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "analysisdata")

# URL de conexão com o PostgreSQL
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Cria o engine do SQLAlchemy
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para os modelos
Base = declarative_base()

# Modelo para o formulário de contato (APENAS UMA DEFINIÇÃO!)
class Contato(Base):
    __tablename__ = "app_contato"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    telefone = Column(String(20), nullable=True)
    mensagem = Column(Text, nullable=False)
    criado_em = Column(DateTime, default=dt.utcnow, index=True)
    status = Column(String(20), default="Pendente")  # Campo adicionado aqui

# Cria as tabelas automaticamente
@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)

# Dependência para obter a sessão do banco
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic model para validação dos dados do formulário
class ContatoCreate(BaseModel):
    nome: str
    email: EmailStr
    telefone: Optional[str] = None
    mensagem: str

    @field_validator('telefone')
    def validar_telefone(cls, v):
        if v and not re.match(r'^\(\d{2}\) \d{5}-\d{4}$|^\d{10,11}$', v):
            raise ValueError('Telefone deve estar no formato (XX) XXXXX-XXXX ou XXXXXXXXXXX')
        return v

    @field_validator('mensagem')
    def validar_mensagem(cls, v):
        if len(v) < 10:
            raise ValueError('A mensagem deve ter pelo menos 10 caracteres')
        return v

# Pydantic model para atualização de contato
class ContatoUpdate(BaseModel):
    nome: Optional[str] = None
    email: Optional[EmailStr] = None
    telefone: Optional[str] = None
    mensagem: Optional[str] = None
    status: Optional[str] = None

    @field_validator('telefone')
    def validar_telefone(cls, v):
        if v and not re.match(r'^\(\d{2}\) \d{5}-\d{4}$|^\d{10,11}$', v):
            raise ValueError('Telefone deve estar no formato (XX) XXXXX-XXXX ou XXXXXXXXXXX')
        return v

    @field_validator('status')
    def validar_status(cls, v):
        if v and v not in ["Pendente", "Respondido", "Arquivado", "Em Andamento"]:
            raise ValueError('Status deve ser: Pendente, Respondido, Arquivado ou Em Andamento')
        return v

# Endpoint de teste para verificar a conexão com o banco
@app.get("/test-db/")
async def test_db():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            conn.close()
        return {"message": "Conexão com o PostgreSQL funcionando!"}
    except Exception:
        raise HTTPException(status_code=500, detail="Erro ao conectar ao banco")

# Endpoint padrão
@app.get("/")
async def root():
    return {"message": "FastAPI funcionando!"}

# Endpoint para receber dados do formulário de contato
@app.post("/api/contato/")
async def criar_contato(contato: ContatoCreate, db: Session = Depends(get_db)):
    try:
        db_contato = Contato(
            nome=contato.nome,
            email=contato.email,
            telefone=contato.telefone,
            mensagem=contato.mensagem,
            criado_em=dt.utcnow()
        )
        db.add(db_contato)
        db.commit()
        db.refresh(db_contato)
        return {"message": "Mensagem recebida com sucesso! Entraremos em contato em breve.", "id": db_contato.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.{str(e)}"
        )

# Endpoint para listar contatos
@app.get("/api/contatos/")
async def listar_contatos(db: Session = Depends(get_db)):
    try:
        contatos = db.query(Contato).order_by(Contato.criado_em.desc()).all()
        return {
            "contatos": [
                {
                    "id": contato.id,
                    "nome": contato.nome,
                    "email": contato.email,
                    "telefone": contato.telefone,
                    "mensagem": contato.mensagem,
                    "status": contato.status,
                    "criado_em": contato.criado_em.isoformat()
                } for contato in contatos
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Ocorreu um erro ao listar os contatos.{str(e)}"
        )

# Endpoint para buscar um contato específico
@app.get("/api/contatos/{contato_id}/")
async def buscar_contato(contato_id: int, db: Session = Depends(get_db)):
    try:
        contato = db.query(Contato).filter(Contato.id == contato_id).first()
        if not contato:
            raise HTTPException(status_code=404, detail="Contato não encontrado")
        return {
            "id": contato.id,
            "nome": contato.nome,
            "email": contato.email,
            "telefone": contato.telefone,
            "mensagem": contato.mensagem,
            "status": contato.status,
            "criado_em": contato.criado_em.isoformat()
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Ocorreu um erro ao buscar o contato. {str(e)}"
        )

# Endpoint para atualizar um contato (PATCH)
@app.patch("/api/contatos/{contato_id}/")
async def atualizar_contato(
    contato_id: int,
    contato_update: ContatoUpdate,
    db: Session = Depends(get_db)
):
    try:
        db_contato = db.query(Contato).filter(Contato.id == contato_id).first()
        if not db_contato:
            raise HTTPException(status_code=404, detail="Contato não encontrado")

        if contato_update.nome is not None:
            db_contato.nome = contato_update.nome
        if contato_update.email is not None:
            db_contato.email = contato_update.email
        if contato_update.telefone is not None:
            db_contato.telefone = contato_update.telefone
        if contato_update.mensagem is not None:
            db_contato.mensagem = contato_update.mensagem
        if contato_update.status is not None:
            db_contato.status = contato_update.status

        db.commit()
        db.refresh(db_contato)

        return {
            "message": "Contato atualizado com sucesso!",
            "contato": {
                "id": db_contato.id,
                "nome": db_contato.nome,
                "email": db_contato.email,
                "telefone": db_contato.telefone,
                "mensagem": db_contato.mensagem,
                "status": db_contato.status,
                "criado_em": db_contato.criado_em.isoformat()
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Ocorreu um erro ao atualizar o contato. {str(e)}"
        )

# Endpoint para deletar um contato
@app.delete("/api/contatos/{contato_id}/")
async def deletar_contato(contato_id: int, db: Session = Depends(get_db)):
    try:
        contato = db.query(Contato).filter(Contato.id == contato_id).first()
        if not contato:
            raise HTTPException(status_code=404, detail="Contato não encontrado")
        db.delete(contato)
        db.commit()
        return {"message": "Contato deletado com sucesso!"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Ocorreu um erro ao deletar o contato: {str(e)}"
        )