from fastapi import FastAPI, APIRouter, HTTPException, Depends
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Text, text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel, EmailStr, field_validator
import re
import os
from dotenv import load_dotenv
from typing import Optional
from datetime import datetime, timezone
import time
from sqlalchemy.exc import OperationalError

# Carrega variáveis de ambiente
load_dotenv()

# Configuração do banco de dados (PostgreSQL)
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")
DB_HOST = os.getenv("DB_HOST", "db")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "analysisdata")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Cria engine com retry para evitar erro de inicialização
for i in range(10):
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        break
    except OperationalError:
        print("Banco ainda não está pronto, tentando novamente...")
        time.sleep(5)
else:
    raise RuntimeError("Não foi possível conectar ao banco após várias tentativas")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Modelo de contato
class Contato(Base):
    __tablename__ = "app_contato"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    telefone = Column(String(20), nullable=True)
    mensagem = Column(Text, nullable=False)
    criado_em = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    status = Column(String(20), default="Pendente")

# Dependência para sessão
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic models
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

# Router com prefixo /api
router = APIRouter(prefix="/api")

# Ciclo de vida para criar tabelas
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

# App principal
app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoints
@router.get("/test-db/")
async def test_db():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"message": "Conexão com o PostgreSQL funcionando!"}
    except Exception:
        raise HTTPException(status_code=500, detail="Erro ao conectar ao banco")

@router.get("/")
async def root():
    return {"message": "FastAPI funcionando!"}

@router.post("/contato/")
async def criar_contato(contato: ContatoCreate, db: Session = Depends(get_db)):
    try:
        db_contato = Contato(
            nome=contato.nome,
            email=contato.email,
            telefone=contato.telefone,
            mensagem=contato.mensagem,
            criado_em=datetime.now(timezone.utc)
        )
        db.add(db_contato)
        db.commit()
        db.refresh(db_contato)
        return {"message": "Mensagem recebida com sucesso!", "id": db_contato.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao processar: {str(e)}")

@router.get("/contatos/")
async def listar_contatos(db: Session = Depends(get_db)):
    contatos = db.query(Contato).order_by(Contato.criado_em.desc()).all()
    return {"contatos": [
        {
            "id": c.id,
            "nome": c.nome,
            "email": c.email,
            "telefone": c.telefone,
            "mensagem": c.mensagem,
            "status": c.status,
            "criado_em": c.criado_em.isoformat()
        } for c in contatos
    ]}

@router.get("/contatos/{contato_id}/")
async def buscar_contato(contato_id: int, db: Session = Depends(get_db)):
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

@router.patch("/contatos/{contato_id}/")
async def atualizar_contato(contato_id: int, contato_update: ContatoUpdate, db: Session = Depends(get_db)):
    db_contato = db.query(Contato).filter(Contato.id == contato_id).first()
    if not db_contato:
        raise HTTPException(status_code=404, detail="Contato não encontrado")

    for campo, valor in contato_update.dict(exclude_unset=True).items():
        setattr(db_contato, campo, valor)

    db.commit()
    db.refresh(db_contato)
    return {"message": "Contato atualizado com sucesso!", "contato": {
        "id": db_contato.id,
        "nome": db_contato.nome,
        "email": db_contato.email,
        "telefone": db_contato.telefone,
        "mensagem": db_contato.mensagem,
        "status": db_contato.status,
        "criado_em": db_contato.criado_em.isoformat()
    }}

@router.delete("/contatos/{contato_id}/")
async def deletar_contato(contato_id: int, db: Session = Depends(get_db)):
    contato = db.query(Contato).filter(Contato.id == contato_id).first()
    if not contato:
        raise HTTPException(status_code=404, detail="Contato não encontrado")
    db.delete(contato)
    db.commit()
    return {"message": "Contato deletado com sucesso!"}

app.include_router(router)
