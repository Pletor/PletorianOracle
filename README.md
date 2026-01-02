# AIHelmar - Orchestrator Agent System

Systém orchestrace pomocí Claude Agent SDK pro efektivní řízení vývoje pomocí specializovaných subagentů.

## 🎯 Přehled

AIHelmar implementuje orchestrační architekturu, kde hlavní orchestrátor řídí specializované subagenty s vlastními kontextovými okny a odbornostmi. Systém optimalizuje produktivitu delegací úkolů podle typu práce.

## 🏗 Architektura

```
Orchestrator (Sonnet) - Hlavní koordinátor
├── Thinking Agents (Sonnet) - Analýza a rozhodování
│   ├── project-analyst - Komplexní analýza projektů
│   └── decision-maker - Strategická rozhodnutí
└── Coding Agents (Haiku + Skills) - Implementace
    ├── frontend-dev - UI/UX vývoj
    ├── backend-dev - Server logika  
    └── database-dev - Databázové operace
```

## 📂 Struktura projektu

```
.claude/
├── agents/                    # Definice agentů
│   ├── orchestrator.md       # Hlavní orchestrátor
│   ├── project-analyst.md    # Analýza projektů
│   ├── decision-maker.md     # Strategická rozhodnutí
│   ├── frontend-dev.md       # Frontend vývoj
│   ├── backend-dev.md        # Backend vývoj
│   └── database-dev.md       # Databázové operace
├── commands/                  # Systém štítků a příkazů
│   ├── tags.md               # Definice anglických štítků
│   └── examples.md           # Příklady použití
├── skills/                    # Best practices a vzory
│   ├── frontend-patterns.md  # Frontend vzory a příklady
│   ├── backend-patterns.md   # Backend vzory a API design
│   └── database-patterns.md  # Databázové optimalizace
└── docs/
    ├── status/
    │   └── project-status.json # Sledování stavu projektu
    └── workflows/
        └── orchestration-guide.md # Průvodce orchestrací
```

## 🚀 Použití

### Základní použití orchestrátora
```
Use the orchestrator agent to plan and implement a user authentication system
```

### Specifické agenty
```
Use the frontend-dev agent to create responsive user profile components
Use the database-dev agent to optimize user query performance
Use the project-analyst agent to analyze technical debt in the codebase
```

## 🏷 Systém štítků

### Základní stavy
- `pending` - Úkol identifikován, nezahájen
- `in-progress` - Právě se pracuje
- `review` - Hotovo, čeká na review
- `done` - Úplně dokončeno

### Problémové stavy
- `error` - Chyba vykonání
- `blocked` - Nelze pokračovat
- `needs-help` - Agent potřebuje pomoc
- `optimization-found` - Objevena optimalizace

## 📋 Model strategie

| Agent Type | Model | Účel |
|------------|-------|------|
| **Orchestrator** | Sonnet | Koordinace a delegace |
| **Thinking Agents** | Sonnet | Komplexní analýza a rozhodování |
| **Coding Agents** | Haiku + Skills | Rychlá implementace s best practices |

## 🔄 Workflow proces

1. **Příjem úkolu** - Orchestrátor analyzuje požadavek
2. **Plánování** - Rozložení na dílčí úkoly a TODO list
3. **Delegace** - Přiřazení specializovaným agentům
4. **Koordinace** - Sledování postupu přes status systém
5. **Integrace** - Zajištění soudržnosti výstupů

## 📊 Sledování pokroku

Agenti označují dokončení v [project-status.json](.claude/docs/status/project-status.json):

```json
{
  "agentId": "frontend-dev",
  "status": "frontend-complete",
  "timestamp": "2026-01-02T10:30:00Z",
  "details": "Komponenty implementovány s validací",
  "discoveries": ["optimization-found: Formulářová validace"]
}
```

## 🛠 Skills systém

Agenti používají skills pro konsistentní implementaci:

- **frontend-patterns**: React komponenty, CSS vzory, accessibility
- **backend-patterns**: API design, middleware, error handling  
- **database-patterns**: Schema design, query optimization

## 📚 Dokumentace

- [Orchestration Guide](.claude/docs/workflows/orchestration-guide.md) - Kompletní průvodce
- [Tag Examples](.claude/commands/examples.md) - Příklady použití štítků
- [Skills Documentation](.claude/skills/) - Best practices a vzory

## 🎯 Přínosy

### ✨ Kontextová izolace
Každý subagent pracuje ve vlastním kontextu, hlavní konverzace zůstává čistá

### 🧠 Specializovaná expertiza  
Agenti jsou optimalizováni pro specifické domény s detailními instrukcemi

### 🔄 Znovupoužitelnost
Jednou vytvořené agenty lze použít napříč projekty

### 🛡 Flexibilní oprávnění
Různé úrovně přístupu k nástrojům pro různé typy agentů

---

**Vytvořeno:** 2. ledna 2026  
**Status:** Implementováno - Připraveno k použití