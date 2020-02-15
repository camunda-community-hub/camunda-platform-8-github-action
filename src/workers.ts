import {ZBClient, ZBWorkerTaskHandler} from 'zeebe-node'
import * as core from '@actions/core'

export async function bootstrapWorkers(
  workerCode: string,
  lifetime: number
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const __module: {
      exports?: {tasks?: {[key: string]: ZBWorkerTaskHandler}}
    } = {}
    const zbc = new ZBClient()
    eval(`(function(module){${workerCode}})(__module)`)
    const tasks = __module.exports?.tasks
    if (tasks) {
      for (const tasktype of Object.keys(tasks)) {
        core.info(`Starting worker for task type ${tasktype}...`)
        zbc.createWorker(null, tasktype, tasks[tasktype])
      }

      setTimeout(async () => {
        core.info('Shutting down workers...')
        await zbc.close()
        resolve()
      }, lifetime * 60 * 1000)
    } else {
      await zbc.close()
      reject(new Error(`No export 'tasks' found in handler file`))
    }
  })
}
