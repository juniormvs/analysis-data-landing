FROM node:18-alpine

# Define o diretório de trabalho
WORKDIR /app

# Copia apenas os arquivos de dependência primeiro
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código
COPY . .

# Expõe a porta padrão do React
EXPOSE 3000

# Define o usuário 'node' para evitar problemas de permissão
USER node

# Comando padrão para iniciar a aplicação
CMD ["npm", "start"]
