# API Local para Sistema de Ranking - Arquitetura e Implementação

## 🎯 Visão Geral da Solução

A ideia consiste em criar uma **API REST local** que roda em um computador dedicado da casa, servindo como servidor central para o sistema de ranking de jogos. Isso permite que múltiplos dispositivos na rede local acessem e sincronizem dados, mantendo a escalabilidade sem depender de serviços externos.

### Principais Benefícios
- ✅ **Privacidade Total**: Dados ficam 100% locais
- ✅ **Sem Custos de Hosting**: Nenhuma mensalidade ou taxa
- ✅ **Performance**: Baixa latência na rede local
- ✅ **Controle Total**: Você administra tudo
- ✅ **Escalável**: Arquitetura permite crescimento futuro
- ✅ **Offline-First**: Funciona mesmo sem internet

---

## 🏗️ Arquitetura do Sistema

```mermaid
graph TB
    subgraph "Rede Local da Casa"
        subgraph "Dispositivos Clientes"
            D1[📱 iPhone/iPad]
            D2[💻 MacBook]
            D3[🖥️ Desktop]
            D4[📱 Android]
        end
        
        subgraph "Servidor Local (Seu Computador Dedicado)"
            API[🚀 API REST Local<br/>Node.js + Fastify]
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

## 🔄 Migração dos Dados Atuais

### Estado Atual vs Futuro

```mermaid
graph LR
    subgraph "ANTES - Electron App"
        EA[Electron App]
        JF[📄 JSON Files<br/>Local Storage]
        
        EA --> JF
    end
    
    subgraph "DEPOIS - API + Client"
        subgraph "Servidor Local"
            API[🚀 API REST]
            SQL[🗃️ SQLite DB]
        end
        
        subgraph "Cliente"
            APP[📱 App Cliente<br/>React/Electron]
            CACHE[💾 Cache Local<br/>Offline Support]
        end
        
        APP <--> API
        API <--> SQL
        APP --> CACHE
    end
    
    JF -.->|Migração<br/>Uma vez| SQL
    
    style JF fill:#ffebee
    style SQL fill:#e8f5e8
```

---

## 🗄️ Estrutura do Banco SQLite

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

## 🛠️ Stack Tecnológica

### Backend (API Local)
```mermaid
graph TD
    subgraph "API Local Stack"
        F[⚡ Fastify<br/>Framework Web]
        P[🔍 Prisma<br/>ORM + Migrations]
        S[🗃️ SQLite<br/>Database]
        Z[✅ Zod<br/>Validação]
        J[🔐 JWT<br/>Autenticação]
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

### Frontend (Clientes)
- **Electron App** (Desktop) - Mantém compatibilidade atual
- **PWA/Web App** (Mobile/Tablet) - Acesso via navegador
- **React + TypeScript** - Base comum para ambos

---

## 🌐 Endpoints da API

### Estrutura de Rotas

```mermaid
graph TB
    API[API Local :3001]
    
    subgraph "Rotas Principais"
        P[/api/players - Jogadores/]
        G[/api/games - Jogos/]
        M[/api/matches - Partidas/]
        R[/api/rankings - Rankings/]
        B[/api/backups - Backups/]
        S[/api/stats - Estatísticas/]
    end
    
    API --> P
    API --> G  
    API --> M
    API --> R
    API --> B
    API --> S
```

### Exemplos de Endpoints

```typescript
// GET /api/players - Listar jogadores
// POST /api/players - Criar jogador
// PUT /api/players/:id - Atualizar jogador
// DELETE /api/players/:id - Remover jogador

// GET /api/matches - Listar partidas
// POST /api/matches - Registrar nova partida
// GET /api/matches/:id - Detalhes da partida

// GET /api/rankings/:gameId - Ranking por jogo
// GET /api/stats/summary - Estatísticas gerais
```

---

## 🔄 Fluxo de Funcionamento

### Cenário: Registrar Nova Partida

```mermaid
sequenceDiagram
    participant C as 📱 Cliente
    participant A as 🚀 API Local
    participant D as 🗃️ SQLite DB
    
    C->>A: POST /api/matches
    Note over C,A: { gameId, players, results }
    
    A->>A: Validar dados (Zod)
    A->>D: Criar partida
    A->>D: Registrar resultados
    A->>D: Atualizar rankings
    A->>D: Calcular estatísticas
    
    D-->>A: Dados atualizados
    A-->>C: Resposta com nova partida
    
    Note over A,D: Tudo em transação<br/>para consistência
```

### Sincronização Multi-Dispositivo

```mermaid
graph TD
    subgraph "Dispositivos"
        D1[📱 iPhone]
        D2[💻 MacBook] 
        D3[🖥️ Desktop]
    end
    
    subgraph "Servidor Local"
        API[🚀 API]
        DB[(🗃️ SQLite)]
    end
    
    D1 <-->|WebSocket<br/>ou Polling| API
    D2 <-->|HTTP REST| API
    D3 <-->|HTTP REST| API
    
    API <--> DB
    
    Note1[📝 Qualquer dispositivo<br/>pode atualizar dados]
    Note2[🔄 Todos recebem<br/>atualizações em tempo real]
```

---

## 💻 Implementação Prática

### 1. Estrutura do Projeto API

```
ranking-api/
├── src/
│   ├── controllers/       # Controladores HTTP
│   ├── services/         # Lógica de negócio
│   ├── repositories/     # Acesso aos dados
│   ├── models/           # Tipos TypeScript
│   ├── utils/            # Utilitários
│   └── migrations/       # Scripts de migração
├── prisma/
│   └── schema.prisma     # Schema do banco
├── backups/              # Backups automáticos
└── package.json
```

### 2. Script de Migração dos Dados JSON

```typescript
// Script para migrar dados do JSON para SQLite
interface MigrationScript {
  migratePlayersFromJSON(): Promise<void>
  migrateMatchesFromJSON(): Promise<void> 
  calculateInitialRankings(): Promise<void>
  createInitialBackup(): Promise<void>
}
```

### 3. Configuração de Deploy Local

```yaml
# docker-compose.yml (opcional)
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

## 🚀 Plano de Implementação

### Fase 1: Preparação (1-2 semanas)
```mermaid
graph LR
    A[📋 Setup Projeto API] --> B[🗃️ Criar Schema SQLite]
    B --> C[⚡ Configurar Fastify]
    C --> D[🔄 Script de Migração]
```

### Fase 2: API Core (2-3 semanas)  
```mermaid
graph LR
    A[👥 Endpoints Players] --> B[🎮 Endpoints Games]
    B --> C[⚔️ Endpoints Matches]
    C --> D[🏆 Sistema Rankings]
```

### Fase 3: Cliente Atualizado (2-3 semanas)
```mermaid
graph LR
    A[🔌 Integração API] --> B[📱 Interface Mobile-First]
    B --> C[💾 Cache Offline]
    C --> D[🔄 Sync em Tempo Real]
```

### Fase 4: Deploy e Testes (1 semana)
```mermaid
graph LR
    A[🖥️ Setup Servidor Local] --> B[🧪 Testes de Integração]
    B --> C[👥 Testes Multi-Dispositivo]
    C --> D[🎉 Lançamento]
```

---

## 🔒 Segurança e Acesso

### Controle de Acesso na Rede Local

```mermaid
graph TB
    subgraph "Router da Casa"
        R[🌐 Router WiFi<br/>192.168.1.1/24]
        
        subgraph "Dispositivos Autorizados"
            S[🖥️ Servidor API<br/>192.168.1.100:3001]
            C1[📱 iPhone<br/>192.168.1.101]
            C2[💻 MacBook<br/>192.168.1.102]
        end
        
        subgraph "Visitantes"
            V[📱 Celular Visita<br/>192.168.1.200]
        end
    end
    
    C1 <-->|✅ Autorizado| S
    C2 <-->|✅ Autorizado| S
    V -.->|❌ Bloqueado<br/>ou Convidado| S
    
    style S fill:#e8f5e8
    style V fill:#ffebee
```

### Opções de Autenticação
1. **IP Whitelist**: Só dispositivos conhecidos
2. **JWT Tokens**: Autenticação por usuário
3. **Guest Mode**: Acesso limitado para visitantes

---

## 📈 Benefícios da Nova Arquitetura

### Comparação: Antes vs Depois

| Aspecto | JSON Files (Antes) | API + SQLite (Depois) |
|---------|-------------------|------------------------|
| **Acesso Multi-dispositivo** | ❌ Não | ✅ Sim |
| **Sincronização** | ❌ Manual | ✅ Automática |
| **Performance** | ⚠️ Lenta com muitos dados | ✅ Rápida e otimizada |
| **Backup** | ⚠️ Manual | ✅ Automático |
| **Consultas Complexas** | ❌ Limitada | ✅ SQL completo |
| **Escalabilidade** | ❌ Baixa | ✅ Alta |
| **Integridade dos Dados** | ⚠️ Frágil | ✅ Transações ACID |

---

## 🎯 Próximos Passos

1. **Validar o Conceito**: Criar um protótipo simples
2. **Definir o Schema**: Modelar as tabelas no Prisma
3. **Migração Gradual**: Manter compatibilidade durante transição
4. **Testes Locais**: Validar funcionamento na sua rede
5. **Deploy Final**: Configurar o servidor dedicado

---

## 💡 Considerações Finais

Esta arquitetura combina o **melhor de dois mundos**:
- **Simplicidade** de uma solução local
- **Escalabilidade** de uma arquitetura profissional

O resultado é um sistema robusto, privado e totalmente sob seu controle, preparado para crescer conforme suas necessidades evoluem.

---

*📝 Documento criado para guiar a implementação da API local do sistema de ranking de jogos*
