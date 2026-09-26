# 🧠 DocMind AI

### AI-Powered RAG Document Chatbot

**DocMind AI** is a full-stack AI document assistant that allows users to upload PDF documents and interact with them using natural language.

Instead of manually searching through long documents, users can simply ask questions and receive **context-aware answers generated from their uploaded documents** using **Retrieval-Augmented Generation (RAG)**.

---

## 🚀 Live Demo

🌐 **Frontend:**
https://doc-mind-ai-zeta.vercel.app

🔗 **Backend API:**
https://docmind-ai-p1uo.onrender.com

📦 **GitHub Repository:**
https://github.com/sandeep8128/DocMind-AI

---

## ✨ Features

### 🔐 Authentication

* User registration and login
* JWT-based authentication
* Protected routes
* User-specific documents and chat history

### 📄 Document Management

* Upload PDF documents
* Extract text from PDFs
* Automatically process uploaded documents
* Split documents into smaller chunks
* Store document metadata in MongoDB

### 🤖 AI-Powered RAG

* Generate embeddings from document chunks
* Store embeddings in Chroma Cloud
* Perform semantic similarity search
* Retrieve the most relevant document chunks
* Generate contextual answers using Google Gemini

### 💬 AI Chat

* Ask natural-language questions about uploaded documents
* Context-aware responses
* Retrieved source chunks
* Chat history stored in MongoDB

### ☁️ Cloud Deployment

* Frontend deployed on Vercel
* Backend deployed on Render
* MongoDB Atlas for database persistence
* Chroma Cloud for vector storage
* Gemini API for AI responses

---

# 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │      User / Browser  │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   React + Vite       │
                    │   Vercel Frontend    │
                    └──────────┬───────────┘
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │   Node.js + Express  │
                    │   Render Backend     │
                    └───────┬───────┬──────┘
                            │       │
             ┌──────────────┘       └──────────────┐
             ▼                                     ▼
    ┌─────────────────┐                    ┌─────────────────┐
    │  MongoDB Atlas  │                    │   PDF Parser    │
    │                 │                    │                 │
    │ Users           │                    │ Extract Text    │
    │ Documents       │                    │ Create Chunks   │
    │ Chats           │                    └────────┬────────┘
    └─────────────────┘                             │
                                                    ▼
                                          ┌─────────────────┐
                                          │  Embeddings     │
                                          └────────┬────────┘
                                                   │
                                                   ▼
                                          ┌─────────────────┐
                                          │  Chroma Cloud   │
                                          │ Vector Database │
                                          └────────┬────────┘
                                                   │
                                             Semantic Search
                                                   │
                                                   ▼
                                          ┌─────────────────┐
                                          │ Google Gemini   │
                                          │      LLM        │
                                          └────────┬────────┘
                                                   │
                                                   ▼
                                          ┌─────────────────┐
                                          │ Context-Aware   │
                                          │ AI Response     │
                                          └─────────────────┘
```

---

# 🔄 How RAG Works

DocMind AI uses **Retrieval-Augmented Generation (RAG)** to answer questions from uploaded documents.

### Step 1 — Upload PDF

The user uploads a PDF through the React frontend.

```text
PDF → Backend API
```

### Step 2 — Extract Text

The backend uses `pdf-parse` to extract text from the uploaded PDF.

```text
PDF
 ↓
Text Extraction
 ↓
Raw Document Text
```

### Step 3 — Chunking

Large documents are divided into smaller chunks so that relevant information can be efficiently retrieved.

```text
Document
   ↓
Chunk 1
Chunk 2
Chunk 3
...
Chunk N
```

### Step 4 — Generate Embeddings

Each chunk is converted into a numerical vector representation.

```text
Text Chunk
    ↓
Embedding
    ↓
Vector
```

### Step 5 — Store in Chroma Cloud

The generated embeddings and document information are stored in **Chroma Cloud**.

```text
Document Chunks
      ↓
Embeddings
      ↓
Chroma Cloud
```

### Step 6 — User Asks a Question

Example:

> "What are the main advantages mentioned in this document?"

The question is converted into an embedding.

### Step 7 — Semantic Search

The question embedding is compared with stored document embeddings.

The most relevant chunks are retrieved from Chroma Cloud.

```text
User Question
      ↓
Question Embedding
      ↓
Semantic Search
      ↓
Relevant Chunks
```

### Step 8 — Gemini Generates the Answer

The retrieved document context is passed to Google Gemini.

```text
Question
   +
Retrieved Context
   ↓
Gemini
   ↓
Final Answer
```

This allows the AI to answer based on the user's uploaded document rather than relying only on general model knowledge.

---

# 🛠️ Tech Stack

## Frontend

* React.js
* Vite
* React Router
* Redux Toolkit
* Axios
* Tailwind CSS

## Backend

* Node.js
* Express.js
* JWT Authentication
* bcrypt
* Multer
* pdf-parse
* Nodemailer

## AI / RAG

* Google Gemini API
* Embeddings
* Retrieval-Augmented Generation
* Chroma Cloud

## Database

* MongoDB
* MongoDB Atlas
* Mongoose

## Deployment

* Vercel — Frontend
* Render — Backend
* Chroma Cloud — Vector Database
* MongoDB Atlas — Database

## Development Tools

* Git
* GitHub
* Docker
* MongoDB Compass
* Postman

---

# 📁 Project Structure

```text
DocMind-AI/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   └── App.jsx
│   │
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── config/
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── Dockerfile
│   ├── package.json
│   └── .env
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

# 🔑 Environment Variables

Create a `.env` file inside the `server` directory.

```env
MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

GEMINI_API_KEY=your_gemini_api_key

EMAIL_USER=your_email
EMAIL_PASS=your_email_password
SUPPORT_EMAIL=your_support_email

RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

CHROMA_API_KEY=your_chroma_api_key
CHROMA_TENANT=your_chroma_tenant
CHROMA_DATABASE=your_chroma_database
```

For the frontend:

```env
VITE_API_URL=http://localhost:8000/api
```

> ⚠️ Never commit `.env` files or API keys to GitHub.

---

# ⚙️ Local Installation

## 1. Clone Repository

```bash
git clone https://github.com/sandeep8128/DocMind-AI.git

cd DocMind-AI
```

---

## 2. Install Backend Dependencies

```bash
cd server
npm install
```

---

## 3. Configure Backend Environment

Create:

```text
server/.env
```

Add the required environment variables.

---

## 4. Start Backend

```bash
npm run dev
```

Backend will run on:

```text
http://localhost:8000
```

Health check:

```text
http://localhost:8000/api/health
```

---

## 5. Install Frontend Dependencies

Open another terminal:

```bash
cd client
npm install
```

---

## 6. Configure Frontend

Create:

```text
client/.env
```

```env
VITE_API_URL=http://localhost:8000/api
```

---

## 7. Start Frontend

```bash
npm run dev
```

Frontend will run on:

```text
http://localhost:5173
```

---

# 🐳 Running with Docker

The project also supports Docker Compose.

From the project root:

```bash
docker compose up --build
```

Services:

| Service  | URL                   |
| -------- | --------------------- |
| Frontend | http://localhost:3000 |
| Backend  | http://localhost:8000 |
| Chroma   | http://localhost:8001 |

To stop containers:

```bash
docker compose down
```

---

# 🔐 Authentication Flow

DocMind AI uses JWT-based authentication.

```text
Register
   ↓
MongoDB
   ↓
Login
   ↓
JWT Token
   ↓
Protected API Requests
```

Protected resources include:

* User documents
* PDF upload
* Chat
* Chat history
* Document access

---

# 💬 Chat Request Flow

```text
User asks question
        ↓
Frontend sends API request
        ↓
Backend validates JWT
        ↓
Question converted to embedding
        ↓
Chroma Cloud semantic search
        ↓
Top relevant chunks retrieved
        ↓
Context + Question
        ↓
Google Gemini
        ↓
AI Answer
        ↓
Chat saved to MongoDB
        ↓
Response returned to frontend
```

---

# 📌 API Overview

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

### Documents

```text
POST /api/documents/upload
GET  /api/documents
GET  /api/documents/:id
```

### Chat

```text
POST /api/chat
GET  /api/chat/:documentId
```

### Health

```text
GET /api/health
```

> API routes may evolve as the project continues to grow.

---

# ☁️ Deployment Architecture

The production deployment uses separate services:

```text
                  Production
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
     Vercel                    Render
    Frontend                   Backend
        │                         │
        │                         ├──── MongoDB Atlas
        │                         │
        │                         ├──── Chroma Cloud
        │                         │
        └─────────────────────────┤
                                  │
                                  └──── Gemini API
```

### Frontend

Deployed using **Vercel**.

### Backend

Deployed using **Render**.

### Database

MongoDB Atlas stores:

* Users
* Documents
* Chat history
* Application data

### Vector Database

Chroma Cloud stores document embeddings used for semantic retrieval.

### AI

Google Gemini generates answers using the retrieved document context.

---

# 🧪 Example Usage

### 1. Create an account

```text
Name: Sandeep
Email: user@example.com
Password: ********
```

### 2. Upload a PDF

```text
Example:
Java Interview Questions.pdf
```

### 3. Ask a question

```text
What is a constructor in Java?
```

### 4. RAG Pipeline

```text
Question
   ↓
Embedding
   ↓
Chroma Search
   ↓
Relevant PDF Chunks
   ↓
Gemini
   ↓
Answer
```

---

# 🛡️ Security

The project implements several security practices:

* JWT authentication
* Password hashing
* Protected API routes
* User-specific document access
* Environment variables for secrets
* CORS configuration
* API keys excluded from Git
* Server-side AI API communication

---

# 📈 Future Improvements

Planned improvements include:

* [ ] Multiple document chat
* [ ] DOCX support
* [ ] TXT support
* [ ] PDF page-level citations
* [ ] Streaming AI responses
* [ ] Advanced chat history
* [ ] Document preview
* [ ] Document deletion
* [ ] Better chunking strategies
* [ ] RAG evaluation
* [ ] Response caching
* [ ] Rate limiting
* [ ] Admin dashboard
* [ ] Subscription-based plans
* [ ] Improved document analytics

---

# 🎯 Why DocMind AI?

Traditional document reading requires users to manually search through pages of information.

DocMind AI provides a conversational interface:

```text
Traditional Approach

Open PDF
   ↓
Search manually
   ↓
Read multiple pages
   ↓
Find answer


DocMind AI

Upload PDF
   ↓
Ask Question
   ↓
AI retrieves relevant context
   ↓
Get Answer
```

The project demonstrates practical implementation of:

* Full-Stack Development
* REST APIs
* Authentication
* MongoDB
* Vector Databases
* Embeddings
* RAG
* Generative AI
* Cloud Deployment
* Docker

---

# 👨‍💻 Author

## Sandeep Prajapati

**B.Tech Computer Science Engineering**

Interested in:

* Full Stack Development
* MERN Stack
* Java & DSA
* Generative AI
* RAG Applications
* Backend Development

### Connect

* GitHub: https://github.com/sandeep8128
* Project: https://github.com/sandeep8128/DocMind-AI

---

# ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.

---

## 📜 License

This project is developed for learning, portfolio, and demonstration purposes.
