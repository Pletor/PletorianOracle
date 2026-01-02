# Project Status Tags

Standardized English tags for task status tracking and inter-agent communication.

## Core Status Tags

### Basic Workflow
- `pending` - Task identified but not yet started
- `in-progress` - Currently being worked on by an agent
- `review` - Completed, awaiting review or testing
- `done` - Fully completed and verified

### Problem States
- `error` - Failed execution, needs immediate attention
- `blocked` - Cannot proceed, dependencies missing
- `needs-help` - Agent requires assistance or clarification
- `retry-needed` - Task failed but should be attempted again

### Discovery Tags
- `optimization-found` - Performance or code improvement opportunity discovered
- `tech-debt` - Technical debt identified during task execution
- `refactor-candidate` - Code that could benefit from refactoring
- `security-concern` - Potential security issue identified

## Agent-Specific Tags

### Frontend Development
- `frontend-complete` - Frontend task finished
- `ui-review` - UI requires design review
- `accessibility-check` - Needs accessibility verification
- `performance-issue` - Frontend performance concern identified

### Backend Development
- `backend-complete` - Backend task finished
- `api-documented` - API endpoints documented
- `security-reviewed` - Security measures implemented
- `load-test-needed` - Requires performance testing

### Database Operations
- `database-complete` - Database task finished
- `migration-ready` - Database migration prepared
- `index-optimized` - Database indexes optimized
- `backup-verified` - Backup procedures tested

### Analysis and Planning
- `analysis-complete` - Technical analysis finished
- `decision-pending` - Awaiting strategic decision
- `architecture-approved` - Technical architecture confirmed
- `requirements-clarified` - Requirements fully understood

## Usage Guidelines

### Tag Assignment
1. Each task should have exactly one core status tag
2. Multiple discovery and agent-specific tags can be applied
3. Tags should be updated as tasks progress
4. Include relevant context when applying problem state tags

### Communication Protocol
- Agents must tag their completed work
- Include brief explanation when using problem state tags
- Discovery tags should include details for follow-up
- Status changes should be logged in project status file