FROM python:3.11-slim

WORKDIR /app

# Copia o requirements.txt primeiro para aproveitar o cache do Docker
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia o resto do projeto
COPY . .

# Expõe a porta 8000
EXPOSE 8000

# Comando para iniciar o Django:
# 1. Aguarda o PostgreSQL estar pronto
# 2. Executa as migrações
# 3. Coleta os arquivos estáticos
# 4. Inicia o Gunicorn
CMD ["sh", "-c", "python manage.py wait_for_db && python manage.py migrate && python manage.py collectstatic --noinput && gunicorn --bind 0.0.0.0:8000 --workers 2 config.wsgi:application"]