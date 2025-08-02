# Face ID - Sistema de Reconhecimento Facial

Um sistema completo de reconhecimento facial em tempo real utilizando tecnologias modernas de machine learning e interface web responsiva.

## Tecnologias Utilizadas

![JavaScript](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

---

## Visão Geral

O Face ID é um sistema de reconhecimento facial que permite:

- Cadastro de usuários através de captura facial
- Reconhecimento facial em tempo real
- Gerenciamento de usuários cadastrados
- Histórico completo de reconhecimentos
- Interface moderna e responsiva
- Suporte a tema claro e escuro

---

## Arquitetura do Sistema

### Frontend

- **face-api.js**: Biblioteca de machine learning para detecção e reconhecimento facial
- **HTML5 Canvas**: Para renderização de overlays de detecção
- **WebRTC**: Acesso à câmera do dispositivo
- **CSS3**: Interface moderna com gradientes e animações
- **Vanilla JavaScript**: Lógica de frontend sem dependências pesadas

### Backend

- **Node.js**: Runtime JavaScript server-side
- **Express.js**: Framework web minimalista
- **MongoDB**: Banco de dados NoSQL para armazenamento
- **Mongoose**: ODM para MongoDB

### Modelos de IA

O sistema utiliza modelos pré-treinados do face-api.js:

- `TinyFaceDetector`: Detecção rápida de rostos
- `FaceLandmark68Net`: Detecção de pontos faciais
- `FaceRecognitionNet`: Extração de características faciais
- `FaceExpressionNet`: Análise de expressões (opcional)

---

## Estrutura do Projeto

### Funcionalidades Principais

#### 1. Dashboard

- Visão geral do sistema
- Acesso rápido às principais funcionalidades
- Estatísticas básicas de uso

#### 2. Cadastro de Usuários

- Captura facial em tempo real
- Validação de qualidade da imagem
- Extração automática de características faciais
- Armazenamento seguro no banco de dados

#### 3. Reconhecimento Facial

- Detecção em tempo real via webcam
- Comparação com base de dados existente
- Feedback visual com bounding boxes
- Atualização automática de contadores

#### 4. Gerenciamento de Usuários

- Lista completa de usuários cadastrados
- Estatísticas de reconhecimento
- Funcionalidade de exclusão
- Dados de último acesso

#### 5. Histórico

- Registro completo de reconhecimentos
- Timestamps detalhados
- Contadores de acesso por usuário

---

## Pré-requisitos

- Node.js (versão 14 ou superior)
- MongoDB Atlas (conta gratuita)
- Navegador moderno com suporte a WebRTC
- Webcam funcional

---

## Instalação e Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/face-id.git
cd face-id-api
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o banco de dados

Crie um arquivo `.env` na raiz do projeto com:

```env
MONGO_URI=mongodb+srv://usuario:<sua-senha>@cluster.mongodb.net/face_recognition_db?retryWrites=true&w=majority
```

### 4. Download dos modelos (opcional)

Os modelos do face-api.js já estão incluídos no projeto. Caso precise atualizá-los:

```bash
cd models && ./download-models.sh
```

### 5. Inicie o servidor

```bash
npm start
```

ou para desenvolvimento:

```bash
npm run dev
```

### 6. Acesse a aplicação

Abra seu navegador e acesse: `http://localhost:3000`

---

## Configuração do MongoDB Atlas

### 1. Criar conta

- Acesse [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Crie uma conta gratuita

### 2. Criar cluster

- Crie um novo cluster (tier gratuito)
- Aguarde a criação (pode levar alguns minutos)

### 3. Configurar acesso

- Configure o IP whitelist (`0.0.0.0/0` para desenvolvimento)
- Crie um usuário de banco de dados
- Copie a string de conexão

### 4. Estrutura do banco

O sistema criará automaticamente:

- **Database**: `face_recognition_db`
- **Collection**: `faces`

---

## Uso da Aplicação

### Primeiro Acesso

- Acesse a aplicação via navegador
- Permita o acesso à câmera quando solicitado
- Navegue pelo menu lateral para explorar as funcionalidades

### Cadastrando Usuários

1. Clique em "Cadastrar" no menu
2. Digite o nome da pessoa
3. Clique em "Iniciar Câmera"
4. Posicione o rosto no enquadramento
5. Clique em "Capturar e Cadastrar"

### Reconhecendo Faces

1. Clique em "Reconhecer" no menu
2. Clique em "Iniciar Reconhecimento"
3. O sistema identificará automaticamente faces conhecidas
4. Boxes coloridos aparecerão sobre faces detectadas

### Gerenciando Usuários

- Acesse "Usuários" no menu
- Visualize todos os cadastrados
- Use "Excluir" para remover usuários
- Clique em "Atualizar Lista" para refresh

---

## API Endpoints

```http
POST   /api/register        # Cadastra um novo usuário
GET    /api/faces           # Retorna todos os usuários cadastrados
GET    /api/descriptors     # Retorna descritores faciais para reconhecimento
POST   /api/recognize/:name # Atualiza contador de reconhecimento
DELETE /api/faces/:name     # Remove um usuário do sistema
GET    /api/history         # Retorna histórico de reconhecimentos
```

---

## Personalização

### Temas

- O sistema suporta tema claro e escuro
- Use o botão na sidebar para alternar
- As preferências são mantidas na sessão

### Responsividade

- Interface otimizada para desktop, tablet e mobile
- Sidebar colapsível em telas pequenas
- Botões e formulários adaptáveis

### Configurações de Reconhecimento

No arquivo `scripts/script.js`, você pode ajustar:

- Parâmetros de detecção
- Threshold de distância
- Qualidade mínima de imagem

---

## Solução de Problemas

### Câmera não funciona

- Verifique as permissões do navegador
- Teste em HTTPS (necessário para WebRTC)
- Reinicie o navegador

### Modelos não carregam

- Verifique a conexão com internet
- Confirme se os arquivos estão na pasta `models/`
- Analise o console do navegador para erros

### Erro de conexão com MongoDB

- Verifique a string de conexão no `.env`
- Confirme se o IP está na whitelist
- Teste a conectividade com MongoDB Atlas

### Performance baixa

- Use navegadores baseados em Chromium para melhor performance
- Feche outras abas que usam câmera
- Ajuste a resolução do vídeo se necessário

---

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature:

```bash
git checkout -b feature/NovaFuncionalidade
```

3. Commit suas mudanças:

```bash
git commit -m "feat: Adiciona nova funcionalidade"
```

4. Push para a branch:

```bash
git push origin feature/NovaFuncionalidade
```

5. Abra um Pull Request

---

## Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

## Suporte

- Abra uma issue no repositório
- Consulte a [documentação do face-api.js](https://justadudewhohacks.github.io/face-api.js/docs/)
- Verifique a [documentação do MongoDB Atlas](https://www.mongodb.com/docs/atlas/)
