# Command Tag Usage Examples

Practical examples of how agents should use project status tags.

## Status Progression Examples

### Typical Task Flow
```
Task: "Implement user authentication"
pending → in-progress → review → done
```

### Task with Issues
```
Task: "Optimize database queries"
pending → in-progress → error (connection timeout) → retry-needed → in-progress → done + optimization-found
```

### Complex Task with Discovery
```
Task: "Refactor user service"
pending → in-progress → review + tech-debt (legacy code patterns) → done + refactor-candidate (related services)
```

## Agent Communication Examples

### Frontend Agent Report
```
Task: "Create user profile page"
Status: frontend-complete + ui-review
Note: "Component implemented with responsive design. Requires UX review for mobile layout."
Optimization: "Consider lazy loading for avatar images"
```

### Backend Agent Report
```
Task: "Implement user API endpoints"
Status: backend-complete + security-reviewed + api-documented
Note: "All endpoints secured with JWT authentication. Rate limiting implemented."
Discovery: "Found performance bottleneck in user lookup - index-optimized tag added"
```

### Database Agent Report
```
Task: "Design user preferences schema"
Status: database-complete + migration-ready
Note: "Schema optimized for read-heavy workload. Migration script tested."
Recommendation: "Consider partitioning for large datasets"
```

## Problem Resolution Examples

### Blocked Task Resolution
```
Original: blocked (missing API specification)
Update: in-progress (API spec received from backend team)
Final: done
```

### Error Handling
```
Original: error (deployment failed - missing environment variables)
Action: needs-help (orchestrator assistance required)
Resolution: in-progress (environment configured)
Final: done
```

## Discovery Tag Usage

### Performance Optimization
```
While completing: "Add user search feature"
Discovered: optimization-found
Details: "Database query can be improved with compound index on (name, email)"
Recommendation: "Create separate task for index optimization"
```

### Security Concern
```
While working on: "User data export"
Discovered: security-concern
Details: "Sensitive data exposed in API response"
Action: "Added data filtering before export"
```

### Refactoring Opportunity
```
While implementing: "Payment processing"
Discovered: refactor-candidate + tech-debt
Details: "Multiple services duplicate payment validation logic"
Suggestion: "Extract shared validation service"
```