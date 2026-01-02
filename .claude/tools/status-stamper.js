/**
 * Status Stamper Tool
 * Handles agent completion stamps and orchestrator notifications
 */

class StatusStamper {
  constructor() {
    this.stampTypes = {
      FE: ['frontend-complete', 'ui-review', 'animation-complete', 'responsive-done'],
      BE: ['backend-complete', 'api-ready', 'logic-implemented', 'tested'],
      DB: ['database-complete', 'schema-ready', 'migration-complete', 'optimized']
    };
  }

  /**
   * Create completion stamp
   */
  createStamp(agentId, taskId, completionData) {
    return {
      id: `stamp-${Date.now()}`,
      agentId,
      taskId,
      timestamp: new Date().toISOString(),
      status: completionData.status,
      workCompleted: completionData.workCompleted,
      timeSpent: completionData.timeSpent,
      discoveries: {
        optimizations: completionData.optimizations || [],
        techDebt: completionData.techDebt || [],
        securityIssues: completionData.securityIssues || [],
        improvements: completionData.improvements || []
      },
      handoff: {
        nextAgent: completionData.nextAgent,
        requirements: completionData.requirements,
        files: completionData.files || [],
        notes: completionData.notes
      },
      validation: {
        tested: completionData.tested || false,
        reviewed: completionData.reviewed || false,
        approved: completionData.approved || false
      }
    };
  }

  /**
   * Validate stamp for agent type
   */
  validateStamp(agentType, status) {
    return this.stampTypes[agentType]?.includes(status) || false;
  }

  /**
   * Notify orchestrator of completion
   */
  notifyOrchestrator(stamp) {
    return {
      type: 'TASK_COMPLETED',
      agentId: stamp.agentId,
      taskId: stamp.taskId,
      status: stamp.status,
      requiresAction: stamp.handoff.nextAgent ? true : false,
      message: `${stamp.agentId} completed ${stamp.taskId} with status: ${stamp.status}`
    };
  }
}

module.exports = StatusStamper;