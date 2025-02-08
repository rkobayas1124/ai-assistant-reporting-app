# AI-Powered SQL Query Generator and Database Assistant

This project is a full-stack web application that leverages AI to generate SQL queries and provide database assistance through a chat-like interface.

The application combines a React-based frontend with a Node.js backend to create an interactive environment where users can ask questions about their database, generate SQL queries, and execute them. It utilizes OpenAI's GPT model to interpret user queries and generate appropriate SQL statements.

## Repository Structure

```
.
├── backend
│   ├── aiAssistant.js
│   ├── dbAccess.js
│   ├── package.json
│   └── server.js
└── frontend
    ├── app
    │   ├── entry.client.tsx
    │   ├── entry.server.tsx
    │   ├── root.tsx
    │   ├── routes
    │   │   ├── _index.tsx
    │   │   ├── chatassistant.tsx
    │   │   └── test.tsx
    │   └── tailwind.css
    ├── package.json
    ├── postcss.config.js
    ├── README.md
    ├── tailwind.config.ts
    ├── tsconfig.json
    └── vite.config.ts
```

### Key Files:

- `backend/server.js`: Main entry point for the Express.js server
- `backend/aiAssistant.js`: Handles interactions with the OpenAI API
- `backend/dbAccess.js`: Manages database connections and operations
- `frontend/app/routes/chatassistant.tsx`: Main chat interface component
- `frontend/vite.config.ts`: Vite configuration for the frontend build
- `frontend/app/entry.server.tsx`: Server-side entry point for the Remix application
- `frontend/app/entry.client.tsx`: Client-side entry point for the Remix application

## Usage Instructions

### Installation

Prerequisites:
- Node.js (version 20.0.0 or higher)
- MySQL database

Steps:
1. Clone the repository
2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```
3. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```
4. Set up environment variables:
   Create a `.env` file in the `backend` directory with the following variables:
   ```
   OPENAI_ORGANIZATION=your_openai_org
   OPENAI_PROJECT=your_openai_project
   OPENAI_API_KEY=your_openai_api_key
   OPENAI_ASSISTANTID=your_openai_assistant_id
   ```
5. Configure database connection:
   Update the `config.json` file in the `backend` directory with your MySQL database details.

### Starting the Application

1. Start the backend server:
   ```
   cd backend
   node server.js
   ```
2. Start the frontend development server:
   ```
   cd frontend
   npm run dev
   ```
3. Open your browser and navigate to `http://localhost:3000` (or the port specified by Vite)

### Using the Chat Interface

1. Enter your database resource name on the initial page and click "Connect"
2. In the chat interface, type your question or request for SQL generation
3. Click "Convert SQL" to generate an SQL query based on your input
4. Click "Run SQL" to execute the generated query and view the results
5. For general questions about the database, use the "Normal Question" button

### Troubleshooting

- If you encounter CORS issues, ensure that the backend server is running and that the frontend is configured to connect to the correct backend URL (default is `http://localhost:4000`)
- For database connection issues, verify the credentials in the `config.json` file and ensure your MySQL server is running
- If the AI assistant is not responding, check your OpenAI API key and ensure you have sufficient credits

## Data Flow

The application follows this general data flow:

1. User inputs a question or request in the frontend chat interface
2. The frontend sends the request to the backend server
3. The backend server processes the request:
   - For SQL generation, it sends the request to the OpenAI API
   - For query execution, it runs the SQL against the connected MySQL database
4. The backend sends the response back to the frontend
5. The frontend updates the chat interface with the response

```
[User] -> [Frontend] -> [Backend Server] -> [OpenAI API / MySQL Database]
          ^                   |
          |                   v
         [Response]  <-  [Processed Data]
```

## Infrastructure

The application is structured as a client-server architecture:

- Frontend: React application built with Remix and Vite
- Backend: Express.js server
- External Services:
  - OpenAI API for natural language processing and SQL generation
  - MySQL database for storing and querying data

Key infrastructure components:

- Express.js server: Handles API requests and manages communication between the frontend, database, and OpenAI API
- OpenAI client: Interacts with the OpenAI API to generate SQL queries and process natural language requests
- MySQL connection pool: Manages database connections for efficient query execution

Note: This project does not include specific cloud infrastructure definitions. For production deployment, consider using appropriate cloud services and infrastructure-as-code tools to define and manage your resources.