import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { ScheduledTask, TaskExecution, TaskResult } from '../types/index.ts'
import { getSchedulerConfig, TASK_STATUS } from '../config/scheduler.ts'

export class TaskScheduler {
  private supabase
  private config
  private runningTasks: Map<string, Promise<void>>

  constructor() {
    this.config = getSchedulerConfig()
    this.supabase = createClient(this.config.supabase_url, this.config.supabase_key)
    this.runningTasks = new Map()
  }

  async getDueTasks(): Promise<ScheduledTask[]> {
    const now = new Date().toISOString()
    const { data: tasks, error } = await this.supabase
      .from('scheduled_tasks')
      .select('*')
      .eq('is_active', true)
      .lte('next_run', now)
      .order('next_run', { ascending: true })

    if (error) throw error
    return tasks
  }

  async createTaskExecution(task: ScheduledTask): Promise<TaskExecution> {
    const { data, error } = await this.supabase
      .from('task_executions')
      .insert({
        task_id: task.id,
        status: TASK_STATUS.PENDING,
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateTaskExecution(
    executionId: string,
    status: TaskExecution['status'],
    result?: TaskResult
  ): Promise<void> {
    const { error } = await this.supabase
      .from('task_executions')
      .update({
        status,
        completed_at: status === TASK_STATUS.COMPLETED || status === TASK_STATUS.FAILED
          ? new Date().toISOString()
          : null,
        result: result ? JSON.stringify(result) : null,
        error: result?.error ? JSON.stringify(result.error) : null
      })
      .eq('id', executionId)

    if (error) throw error
  }

  async updateTaskSchedule(taskId: string, nextRun: string): Promise<void> {
    const { error } = await this.supabase
      .from('scheduled_tasks')
      .update({
        last_run: new Date().toISOString(),
        next_run: nextRun,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)

    if (error) throw error
  }

  async executeTask(task: ScheduledTask): Promise<TaskResult> {
    const startTime = Date.now()
    const execution = await this.createTaskExecution(task)
    
    try {
      await this.updateTaskExecution(execution.id, TASK_STATUS.RUNNING)
      
      let result: any
      switch (task.task.type) {
        case 'database':
          result = await this.executeDatabaseTask(task)
          break
        case 'webhook':
          result = await this.executeWebhookTask(task)
          break
        case 'function':
          result = await this.executeFunctionTask(task)
          break
        default:
          throw new Error(`Unsupported task type: ${task.task.type}`)
      }

      const taskResult: TaskResult = {
        success: true,
        data: result,
        execution_time: Date.now() - startTime,
        started_at: execution.started_at,
        completed_at: new Date().toISOString()
      }

      await this.updateTaskExecution(execution.id, TASK_STATUS.COMPLETED, taskResult)
      return taskResult

    } catch (error) {
      const taskResult: TaskResult = {
        success: false,
        error: {
          message: error.message,
          code: 'TASK_EXECUTION_ERROR',
          details: error
        },
        execution_time: Date.now() - startTime,
        started_at: execution.started_at,
        completed_at: new Date().toISOString()
      }

      await this.updateTaskExecution(execution.id, TASK_STATUS.FAILED, taskResult)
      throw error
    }
  }

  private async executeDatabaseTask(task: ScheduledTask): Promise<any> {
    if (!task.task.config.query) {
      throw new Error('Query is required for database tasks')
    }

    const { data, error } = await this.supabase.rpc('execute_sql', {
      query: task.task.config.query
    })

    if (error) throw error
    return data
  }

  private async executeWebhookTask(task: ScheduledTask): Promise<any> {
    if (!task.task.config.url) {
      throw new Error('URL is required for webhook tasks')
    }

    const response = await fetch(task.task.config.url, {
      method: task.task.config.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...task.task.config.headers
      },
      body: JSON.stringify(task.task.config.body)
    })

    if (!response.ok) {
      throw new Error(`Webhook failed with status ${response.status}`)
    }

    return await response.json()
  }

  private async executeFunctionTask(task: ScheduledTask): Promise<any> {
    if (!task.task.config.function_name) {
      throw new Error('Function name is required for function tasks')
    }

    const { data, error } = await this.supabase.functions.invoke(
      task.task.config.function_name,
      {
        body: task.task.config.params
      }
    )

    if (error) throw error
    return data
  }
} 