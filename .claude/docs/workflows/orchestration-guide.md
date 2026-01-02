# Orchestration Workflow Guide

Complete guide for using the orchestrator agent system for efficient project management.

## System Overview

The orchestrator system uses a delegation-based architecture where the main orchestrator agent coordinates specialized subagents, each with their own context windows and expertise areas.

### Agent Hierarchy

```
Orchestrator (Sonnet)
├── Thinking Agents (Sonnet)
│   ├── project-analyst - Complex analysis and planning
│   └── decision-maker - Strategic decisions and trade-offs
└── Coding Agents (Haiku + Skills)
    ├── frontend-dev - UI/UX implementation
    ├── backend-dev - API and server logic
    └── database-dev - Data modeling and optimization
```

## Orchestrator Usage

The orchestrator agent should be invoked for:
- Overall project planning and task breakdown
- Coordinating multiple agents for complex workflows
- Managing TODO lists and tracking progress
- Making high-level architectural decisions

### Example Invocation
```
Use the orchestrator agent to plan and implement a user authentication system
```

## Agent Delegation Rules

### Thinking Tasks → Sonnet Agents
- **project-analyst**: Requirements analysis, technical roadmapping, risk assessment
- **decision-maker**: Technology choices, architecture decisions, problem resolution

### Implementation Tasks → Haiku + Skills Agents
- **frontend-dev**: React components, UI styling, client-side logic
- **backend-dev**: APIs, server logic, authentication, business logic  
- **database-dev**: Schema design, query optimization, data migrations

## Workflow Process

### 1. Task Reception
Orchestrator receives user request and analyzes requirements

### 2. Planning Phase
- Break down request into manageable tasks
- Create TODO list with specific, actionable items
- Identify dependencies and sequence

### 3. Delegation Phase
- Route thinking tasks to appropriate Sonnet agents
- Assign implementation work to Haiku+Skills agents
- Provide clear instructions and context to each agent

### 4. Coordination Phase
- Monitor agent progress through status stamps
- Handle inter-agent dependencies
- Resolve blockers and provide assistance

### 5. Integration Phase
- Ensure agent outputs work together cohesively
- Perform final quality checks
- Update project status and mark tasks complete

## Status Tracking Protocol

### Agent Stamp System
Each agent must stamp their completion in the project status file:

```json
{
  "agentId": "frontend-dev",
  "taskId": "auth-ui-components", 
  "status": "frontend-complete",
  "timestamp": "2026-01-02T10:30:00Z",
  "details": "Login and register components implemented with validation",
  "discoveries": ["optimization-found: Form validation could be extracted to shared hook"]
}
```

### Tag Lifecycle
```
pending → in-progress → review → done
                   ↓
              error/blocked → retry-needed → in-progress
```

## Communication Patterns

### Agent-to-Orchestrator
- Complete tasks with proper status tags
- Report discoveries and optimization opportunities  
- Request help when blocked or encountering errors
- Provide detailed completion summaries

### Orchestrator-to-Agent
- Clear task definitions with acceptance criteria
- Relevant context and background information
- Dependencies and integration requirements
- Timeline and priority indicators

## Best Practices

### For Orchestrator
- Never implement code directly - always delegate
- Maintain clean main context by using subagents
- Create specific, actionable task descriptions
- Monitor progress and provide assistance when needed
- Ensure smooth handoffs between agents

### For Specialized Agents
- Focus on your expertise area only
- Use provided skills and patterns
- Tag work appropriately upon completion
- Report any discoveries or optimization opportunities
- Request help early when encountering blockers

### For Task Management
- Break large tasks into smaller, manageable pieces
- Create clear dependencies and sequence
- Update status consistently
- Document decisions and rationale
- Maintain project status file accuracy

## Example Workflows

### Simple Feature Implementation
1. User requests new feature
2. Orchestrator analyzes and creates plan
3. Delegates UI work to frontend-dev
4. Delegates API work to backend-dev  
5. Delegates schema changes to database-dev
6. Coordinates integration and testing
7. Reports completion to user

### Complex Architecture Decision
1. User presents technical challenge
2. Orchestrator delegates analysis to project-analyst
3. project-analyst provides options and recommendations
4. Orchestrator delegates final decision to decision-maker
5. decision-maker chooses approach with rationale
6. Orchestrator creates implementation plan
7. Delegates implementation to appropriate coding agents

## Error Handling

### Common Issues
- **Agent blocking**: Orchestrator provides additional context or assistance
- **Integration conflicts**: Orchestrator coordinates resolution between agents
- **Requirement changes**: Orchestrator updates all affected agent tasks
- **Technical debt discovery**: Orchestrator evaluates and prioritizes follow-up

### Resolution Process
1. Identify issue type and affected agents
2. Gather context and understand root cause
3. Coordinate between agents if needed
4. Provide additional resources or clarification
5. Update task status and continue workflow