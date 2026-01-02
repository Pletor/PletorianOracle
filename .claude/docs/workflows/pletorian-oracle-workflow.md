# Pletorian Oracle Project Workflow

Orchestrační workflow pro implementaci Pletorian Oracle projektu s task-specific agenty a stamp systémem.

## 🎯 Přehled projektu

**Pletorian Oracle** je mystická webová aplikace s interaktivními animacemi a systémem věšteb.

### Klíčové funkce:
- **Frontend**: Single page s animovanými tvary a centrálním tlačítkem
- **Animace**: Pulsování → vodní kruhy → transformace na žlutou hvězdu  
- **Backend**: Node.js API s 64 ID věšteb
- **Databáze**: JSON struktura s věštbami

## 🤖 Specializovaní agenti

### **agent-task-pletorian-fe**
- **Model**: Haiku + Skills
- **Specializace**: React komponenty, Framer Motion animace
- **Úkoly**: Setup → Komponenty → Animace → Polish
- **Stamp**: `frontend-complete`

### **Připraveno pro vytvoření**:
- **agent-task-pletorian-be**: Node.js API, věštby endpoint
- **agent-task-pletorian-db**: JSON struktura, 64 věšteb

## 📋 Task systém s razítky

### **Aktuální FE úkoly**:

```json
{
  "task-pletorian-fe-setup": {
    "status": "pending",
    "priority": "high", 
    "agent": "agent-task-pletorian-fe",
    "acceptance": ["Vite project", "Framer Motion", "Structure"]
  },
  "task-pletorian-fe-components": {
    "status": "pending",
    "dependencies": ["task-pletorian-fe-setup"],
    "acceptance": ["MainPage", "AnimatedBackground", "CentralButton", "RippleEffect"]
  },
  "task-pletorian-fe-animations": {
    "status": "pending", 
    "dependencies": ["task-pletorian-fe-components"],
    "acceptance": ["60fps", "Pulsing", "Ripples", "Star transform"]
  },
  "task-pletorian-fe-polish": {
    "status": "pending",
    "dependencies": ["task-pletorian-fe-animations"], 
    "acceptance": ["Responsive", "A11y", "Cross-browser"]
  }
}
```

## 🔄 Workflow proces

### **Fáze 1: Frontend (Aktuální)**

1. **Agent vyvolání**:
   ```
   Use the agent-task-pletorian-fe agent to start with project setup
   ```

2. **Task progression**:
   - Setup projekt → **Stamp**: `setup-complete`
   - Implementovat komponenty → **Stamp**: `components-complete`  
   - Animace sequence → **Stamp**: `animations-complete`
   - Polish & optimization → **Stamp**: `frontend-complete`

3. **Orchestrator monitoring**:
   - Sleduje razítka v [todo-tasks.json](.claude/docs/status/todo-tasks.json)
   - Automaticky spouští další úkoly při dokončení dependencies
   - Eskaluje blocked úkoly

### **Fáze 2: Backend (Plánováno)**

Po `frontend-complete` stamp:
1. Vytvoření `agent-task-pletorian-be`
2. Implementace Node.js API
3. Endpoint pro věštby s 64 ID
4. Stamp: `backend-complete`

### **Fáze 3: Integration (Plánováno)**

Po `backend-complete` stamp:
1. Propojení FE s BE API
2. Testing kompletního workflow
3. Deployment preparation
4. Stamp: `integration-complete`

## 🏷 Stamp systém

### **FE Agent razítka**:
- `setup-complete` - Projekt inicializován
- `components-complete` - Hlavní komponenty hotové  
- `animations-complete` - Animace implementovány
- `frontend-complete` - FE dokončen

### **Stamp struktura**:
```json
{
  "agentId": "agent-task-pletorian-fe",
  "taskId": "task-pletorian-fe-setup",
  "timestamp": "2026-01-03T10:30:00Z", 
  "status": "setup-complete",
  "workCompleted": "Vite projekt s React 18 a Framer Motion",
  "discoveries": {
    "optimizations": ["Vite pre-bundling pro rychlejší dev"],
    "improvements": ["TypeScript strict mode aktivován"]
  },
  "handoff": {
    "nextAgent": "agent-task-pletorian-fe",
    "requirements": "Pokračovat s komponentami",
    "files": ["package.json", "vite.config.ts", "src/"]
  }
}
```

## 📊 Sledování pokroku

### **Tools využití**:
- **task-tracker.js**: Automatické sledování dependencies
- **status-stamper.js**: Validace a vytváření razítek
- **on-task-complete.js**: Hook pro eskalaci a notifikace

### **Status monitoring**:
- [project-status.json](.claude/docs/status/project-status.json) - Celkový přehled
- [todo-tasks.json](.claude/docs/status/todo-tasks.json) - Detailní úkoly

## 🚀 Spuštění projektu

### **Aktuální krok**:
```bash
# Spuštění FE agenta
Use the agent-task-pletorian-fe agent to initialize the Pletorian Oracle React project with Vite and Framer Motion
```

### **Expected output**:
- Vite projekt s React 18
- Framer Motion konfigurace  
- Základní struktura komponent
- Stamp: `setup-complete`

---

**Status**: Připraveno k spuštění  
**Další agent**: agent-task-pletorian-fe  
**Očekávaný čas**: 2 hodiny na setup