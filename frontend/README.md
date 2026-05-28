# DD Computer Frontend

Next.js frontend for DD Computer Chat Commerce Platform.

## Installation

```bash
cd frontend
npm install
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Build

```bash
npm run build
npm start
```

## Features

- **Authentication**: Login/Register with JWT
- **Products**: Browse, search, and view product details
- **Cart**: Add items, update quantities, calculate total
- **Chat**: Real-time chat with store using Socket.io
- **State Management**: Zustand for global state

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Axios
- Zustand
- Socket.io Client
- Lucide React
