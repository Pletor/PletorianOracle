/**
 * Task Tracker Tool for Claude Agent SDK
 * Manages TODO tasks with stamps and status tracking
 */

class TaskTracker {
  constructor() {
    this.statusFile = '.claude/docs/status/project-status.json';
    this.todoFile = '.claude/docs/status/todo-tasks.json';
  }

  /**
   * Create new task with specific agent assignment
   */
  createTask(taskData) {
    return {
      id: `task-${Date.now()}`,
      title: taskData.title,
      description: taskData.description,
      assignedAgent: taskData.assignedAgent,
      type: taskData.type, // 'FE', 'BE', 'DB'
      status: 'pending',
      created: new Date().toISOString(),
      dependencies: taskData.dependencies || [],
      tags: taskData.tags || [],
      stamps: []
    };
  }

  /**
   * Add completion stamp from agent
   */
  addStamp(taskId, agentId, stampData) {
    const stamp = {
      agentId,
      timestamp: new Date().toISOString(),
      status: stampData.status,
      details: stampData.details,
      discoveries: stampData.discoveries || [],
      nextActions: stampData.nextActions || []
    };
    
    return stamp;
  }

  /**
   * Check if task dependencies are met
   */
  canStartTask(taskId, allTasks) {
    const task = allTasks.find(t => t.id === taskId);
    if (!task || !task.dependencies.length) return true;
    
    return task.dependencies.every(depId => {
      const dep = allTasks.find(t => t.id === depId);
      return dep && dep.status === 'done';
    });
  }

  /**
   * Get next available tasks for agent type
   */
  getNextTasks(agentType, allTasks) {
    return allTasks.filter(task => 
      task.type === agentType && 
      task.status === 'pending' &&
      this.canStartTask(task.id, allTasks)
    );
  }
}

module.exports = TaskTracker;