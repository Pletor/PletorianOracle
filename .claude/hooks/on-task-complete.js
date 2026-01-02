/**
 * On Task Complete Hook
 * Triggered when an agent completes a task
 */

const TaskTracker = require('../tools/task-tracker');
const StatusStamper = require('../tools/status-stamper');

class OnTaskCompleteHook {
  constructor() {
    this.tracker = new TaskTracker();
    this.stamper = new StatusStamper();
  }

  /**
   * Handle task completion event
   */
  async onComplete(eventData) {
    const { agentId, taskId, completionData } = eventData;
    
    try {
      // Create completion stamp
      const stamp = this.stamper.createStamp(agentId, taskId, completionData);
      
      // Update task status
      const updatedTask = {
        ...eventData.task,
        status: 'done',
        completedAt: new Date().toISOString(),
        stamps: [...eventData.task.stamps, stamp]
      };
      
      // Check for next tasks
      const nextTasks = this.getTriggeredTasks(updatedTask);
      
      // Notify orchestrator
      const notification = this.stamper.notifyOrchestrator(stamp);
      
      return {
        success: true,
        updatedTask,
        nextTasks,
        notification,
        discoveries: stamp.discoveries
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        requiresEscalation: true
      };
    }
  }

  /**
   * Find tasks triggered by completion
   */
  getTriggeredTasks(completedTask) {
    const triggered = [];
    
    // Check dependency chains
    if (completedTask.type === 'FE' && completedTask.status === 'done') {
      triggered.push({
        type: 'INTEGRATION_TEST',
        priority: 'high',
        assignTo: 'orchestrator'
      });
    }
    
    return triggered;
  }
}

module.exports = OnTaskCompleteHook;