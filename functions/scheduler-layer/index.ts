import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { ScheduledTask, TaskResult } from './src/types/index.ts'
import { TaskScheduler } from './src/services/taskScheduler.ts'
import { CronParser } from './src/services/cronParser.ts'
import { getSchedulerConfig } from './src/config/scheduler.ts'

const taskScheduler = new TaskScheduler()
const config = getSchedulerConfig()

async function handleRequest(req: Request): Promise<Response> {
  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const event = await req.json()
    const startTime = Date.now()

    // Handle different event types
    switch (event.type) {
      case 'check_schedule':
        await handleCheckSchedule()
        break
      case 'execute_task':
        if (!event.task_id) {
          throw new Error('Task ID is required')
        }
        await handleExecuteTask(event.task_id)
        break
      case 'create_task':
        if (!event.task) {
          throw new Error('Task configuration is required')
        }
        await handleCreateTask(event.task)
        break
      case 'update_task':
        if (!event.task_id || !event.task) {
          throw new Error('Task ID and configuration are required')
        }
        await handleUpdateTask(event.task_id, event.task)
        break
      case 'delete_task':
        if (!event.task_id) {
          throw new Error('Task ID is required')
        }
        await handleDeleteTask(event.task_id)
        break
      default:
        throw new Error('Invalid event type')
    }

    return new Response(
      JSON.stringify({
        success: true,
        execution_time: Date.now() - startTime
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in scheduler layer:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: error.message,
          code: 'INTERNAL_ERROR',
          details: error
        }
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

async function handleCheckSchedule() {
  const dueTasks = await taskScheduler.getDueTasks()
  
  for (const task of dueTasks) {
    if (taskScheduler.runningTasks.size >= config.max_concurrent_tasks) {
      break
    }

    const execution = taskScheduler.executeTask(task)
    taskScheduler.runningTasks.set(task.id, execution)

    execution.finally(() => {
      taskScheduler.runningTasks.delete(task.id)
    })
  }
}

async function handleExecuteTask(taskId: string) {
  const { data: task, error } = await taskScheduler.supabase
    .from('scheduled_tasks')
    .select('*')
    .eq('id', taskId)
    .single()

  if (error) throw error
  if (!task) throw new Error('Task not found')

  await taskScheduler.executeTask(task)
}

async function handleCreateTask(task: ScheduledTask) {
  if (!CronParser.validate(task.schedule.cron)) {
    throw new Error('Invalid cron expression')
  }

  const nextRun = CronParser.getNextRun(task.schedule.cron, task.schedule.timezone)
  
  const { error } = await taskScheduler.supabase
    .from('scheduled_tasks')
    .insert({
      ...task,
      next_run: nextRun.toISOString()
    })

  if (error) throw error
}

async function handleUpdateTask(taskId: string, task: ScheduledTask) {
  if (task.schedule?.cron && !CronParser.validate(task.schedule.cron)) {
    throw new Error('Invalid cron expression')
  }

  const nextRun = task.schedule?.cron
    ? CronParser.getNextRun(task.schedule.cron, task.schedule.timezone)
    : undefined

  const { error } = await taskScheduler.supabase
    .from('scheduled_tasks')
    .update({
      ...task,
      next_run: nextRun?.toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', taskId)

  if (error) throw error
}

async function handleDeleteTask(taskId: string) {
  const { error } = await taskScheduler.supabase
    .from('scheduled_tasks')
    .delete()
    .eq('id', taskId)

  if (error) throw error
}

serve(handleRequest) 