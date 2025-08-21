# Local API for Ranking System - Architecture and Implementation

[![Português](https://img.shields.io/badge/lang-pt--br-green.svg)](README.md)
[![English](https://img.shields.io/badge/lang-en-red.svg)](README.en.md)

## 🎯 Solution Overview

The idea consists of creating a **local REST API** that runs on a dedicated home computer, serving as a central server for the game ranking system. This allows multiple devices on the local network to access and synchronize data, maintaining scalability without depending on external services.

### Main Benefits
- ✅ **Total Privacy**: Data stays 100% local
- ✅ **No Hosting Costs**: No monthly fees or charges
- ✅ **Performance**: Low latency on local network
- ✅ **Total Control**: You manage everything
- ✅ **Scalable**: Architecture allows future growth
- ✅ **Offline-First**: Works even without internet

---

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph "Home Local Network"
        subgraph "Client Devices"
            D1[📱 iPhone/iPad]
            D2[💻 MacBook]
            D3[🖥️ Desktop]
            D4[📱 Android]
        end
        
        subgraph "Local Server (Your Dedicated Computer)"
            API[🚀 Local REST API<br/>Node.js + Fastify]
            DB[🗃️ SQLite Database<br/>ranking_game.db]
            FS[📁 File System<br/>Backups & Assets]
        end
    end
    
    D1 -.->|HTTP Requests| API
    D2 -.->|HTTP Requests| API
    D3 -.->|HTTP Requests| API
    D4 -.->|HTTP Requests| API
    
    API --> DB
    API --> FS
    
    style API fill:#e1f5fe
    style DB fill:#f3e5f5
    style FS fill:#e8f5e8
```

---

## 🔄 Current Data Migration

### Current State vs Future

```mermaid
graph LR
    subgraph "BEFORE - Electron App"
        EA[Electron App]
        JF[📄 JSON Files<br/>Local Storage]
        
        EA --> JF
    end
    
    subgraph "AFTER - API + Client"
        subgraph "Local Server"
            API[🚀 REST API]
            SQL[🗃️ SQLite DB]
        end
        
        subgraph "Client"
            APP[📱 Client App<br/>React/Electron]
            CACHE[💾 Local Cache<br/>Offline Support]
        end
        
        APP <--> API
        API <--> SQL
        APP --> CACHE
    end
    
    JF -.->|Migration<br/>One Time| SQL
    
    style JF fill:#ffebee
    style SQL fill:#e8f5e8
```

---

## 🗄️ SQLite Database Structure

```mermaid
erDiagram
    PLAYERS {
        int id
        string name
        string avatar
        datetime created_at
        datetime updated_at
        boolean active
    }
    
    GAMES {
        int id
        string name
        string description
        int min_players
        int max_players
        datetime created_at
        datetime updated_at
        boolean active
    }
    
    MATCHES {
        int id
        int game_id
        datetime date
        string location
        string notes
        datetime created_at
        datetime updated_at
        string status
    }
    
    MATCH_RESULTS {
        int id
        int match_id
        int player_id
        int position
        int score
        int points_earned
        datetime created_at
    }
    
    RANKINGS {
        int id
        int game_id
        int player_id
        int total_points
        int matches_played
        int wins
        float avg_position
        datetime last_match_date
        datetime updated_at
    }
    
    BACKUPS {
        int id
        string filename
        string filepath
        int size
        datetime created_at
        string description
    }
    
    PLAYERS ||--o{ MATCH_RESULTS : participates
    GAMES ||--o{ MATCHES : has
    MATCHES ||--o{ MATCH_RESULTS : contains
    GAMES ||--o{ RANKINGS : tracks
    PLAYERS ||--o{ RANKINGS : ranked_in
```

---

## 🛠️ Technology Stack

### Backend (Local API)
```mermaid
graph TD
    subgraph "Local API Stack"
        F[⚡ Fastify<br/>Web Framework]
        P[🔍 Prisma<br/>ORM + Migrations]
        S[🗃️ SQLite<br/>Database]
        Z[✅ Zod<br/>Validation]
        J[🔐 JWT<br/>Authentication]
        C[📋 CORS<br/>Cross-Origin]
    end
    
    F --> P
    P --> S
    F --> Z
    F --> J
    F --> C
    
    style F fill:#e1f5fe
    style P fill:#f3e5f5
    style S fill:#e8f5e8
```

### Frontend (Clients)
- **Electron App** (Desktop) - Maintains current compatibility
- **PWA/Web App** (Mobile/Tablet) - Browser access
- **React + TypeScript** - Common base for both

---

## 🌐 API Endpoints

### Route Structure

```mermaid
graph TB
    API[Local API :3001]
    
    subgraph "Main Routes"
        P[/api/players - Players/]
        G[/api/games - Games/]
        M[/api/matches - Matches/]
        R[/api/rankings - Rankings/]
        B[/api/backups - Backups/]
        S[/api/stats - Statistics/]
    end
    
    API --> P
    API --> G  
    API --> M
    API --> R
    API --> B
    API --> S
```

### Endpoint Examples

```typescript
// GET /api/players - List players
// POST /api/players - Create player
// PUT /api/players/:id - Update player
// DELETE /api/players/:id - Remove player

// GET /api/matches - List matches
// POST /api/matches - Register new match
// GET /api/matches/:id - Match details

// GET /api/rankings/:gameId - Ranking by game
// GET /api/stats/summary - General statistics
```

---

## 🔄 Operation Flow

### Scenario: Register New Match

```mermaid
sequenceDiagram
    participant C as 📱 Client
    participant A as 🚀 Local API
    participant D as 🗃️ SQLite DB
    
    C->>A: POST /api/matches
    Note over C,A: { gameId, players, results }
    
    A->>A: Validate data (Zod)
    A->>D: Create match
    A->>D: Register results
    A->>D: Update rankings
    A->>D: Calculate statistics
    
    D-->>A: Updated data
    A-->>C: Response with new match
    
    Note over A,D: Everything in transaction<br/>for consistency
```

### Multi-Device Synchronization

```mermaid
graph TD
    subgraph "Devices"
        D1[📱 iPhone]
        D2[💻 MacBook] 
        D3[🖥️ Desktop]
    end
    
    subgraph "Local Server"
        API[🚀 API]
        DB[(🗃️ SQLite)]
    end
    
    D1 <-->|WebSocket<br/>or Polling| API
    D2 <-->|HTTP REST| API
    D3 <-->|HTTP REST| API
    
    API <--> DB
    
    Note1[📝 Any device<br/>can update data]
    Note2[🔄 All receive<br/>real-time updates]
```

---

## 💻 Practical Implementation

### 1. API Project Structure

```
ranking-api/
├── src/
│   ├── controllers/       # HTTP Controllers
│   ├── services/         # Business Logic
│   ├── repositories/     # Data Access
│   ├── models/           # TypeScript Types
│   ├── utils/            # Utilities
│   └── migrations/       # Migration Scripts
├── prisma/
│   └── schema.prisma     # Database Schema
├── backups/              # Automatic Backups
└── package.json
```

### 2. JSON Data Migration Script

```typescript
// Script to migrate data from JSON to SQLite
interface MigrationScript {
  migratePlayersFromJSON(): Promise<void>
  migrateMatchesFromJSON(): Promise<void> 
  calculateInitialRankings(): Promise<void>
  createInitialBackup(): Promise<void>
}
```

### 3. Local Deployment Configuration

```yaml
# docker-compose.yml (optional)
version: '3.8'
services:
  ranking-api:
    build: .
    ports:
      - "3001:3001"
    volumes:
      - ./data:/app/data
      - ./backups:/app/backups
    environment:
      - NODE_ENV=production
      - DATABASE_URL=file:./data/ranking.db
```

---

## 🚀 Implementation Plan

### Phase 1: Preparation (1-2 weeks)
```mermaid
graph LR
    A[📋 API Project Setup] --> B[🗃️ Create SQLite Schema]
    B --> C[⚡ Configure Fastify]
    C --> D[🔄 Migration Script]
```

### Phase 2: Core API (2-3 weeks)  
```mermaid
graph LR
    A[👥 Players Endpoints] --> B[🎮 Games Endpoints]
    B --> C[⚔️ Matches Endpoints]
    C --> D[🏆 Rankings System]
```

### Phase 3: Updated Client (2-3 weeks)
```mermaid
graph LR
    A[🔌 API Integration] --> B[📱 Mobile-First Interface]
    B --> C[💾 Offline Cache]
    C --> D[🔄 Real-time Sync]
```

### Phase 4: Deploy and Testing (1 week)
```mermaid
graph LR
    A[🖥️ Local Server Setup] --> B[🧪 Integration Tests]
    B --> C[👥 Multi-Device Tests]
    C --> D[🎉 Launch]
```

---

## 🔒 Security and Access

### Local Network Access Control

```mermaid
graph TB
    subgraph "Home Router"
        R[🌐 WiFi Router<br/>192.168.1.1/24]
        
        subgraph "Authorized Devices"
            S[🖥️ API Server<br/>192.168.1.100:3001]
            C1[📱 iPhone<br/>192.168.1.101]
            C2[💻 MacBook<br/>192.168.1.102]
        end
        
        subgraph "Guests"
            V[📱 Guest Phone<br/>192.168.1.200]
        end
    end
    
    C1 <-->|✅ Authorized| S
    C2 <-->|✅ Authorized| S
    V -.->|❌ Blocked<br/>or Guest| S
    
    style S fill:#e8f5e8
    style V fill:#ffebee
```

### Authentication Options
1. **IP Whitelist**: Only known devices
2. **JWT Tokens**: User authentication
3. **Guest Mode**: Limited access for visitors

---

## 📈 New Architecture Benefits

### Comparison: Before vs After

| Aspect | JSON Files (Before) | API + SQLite (After) |
|---------|-------------------|--------------------------|
| **Multi-device Access** | ❌ No | ✅ Yes |
| **Synchronization** | ❌ Manual | ✅ Automatic |
| **Performance** | ⚠️ Slow with lots of data | ✅ Fast and optimized |
| **Backup** | ⚠️ Manual | ✅ Automatic |
| **Complex Queries** | ❌ Limited | ✅ Full SQL |
| **Scalability** | ❌ Low | ✅ High |
| **Data Integrity** | ⚠️ Fragile | ✅ ACID Transactions |

---

## 🎯 Next Steps

1. **Validate Concept**: Create a simple prototype
2. **Define Schema**: Model tables in Prisma
3. **Gradual Migration**: Maintain compatibility during transition
4. **Local Testing**: Validate operation on your network
5. **Final Deploy**: Configure dedicated server

---

## 💡 Final Considerations

This architecture combines the **best of both worlds**:
- **Simplicity** of a local solution
- **Scalability** of a professional architecture

The result is a robust, private system totally under your control, prepared to grow as your needs evolve.

---

*📝 Document created to guide the implementation of the local API for the game ranking system*
