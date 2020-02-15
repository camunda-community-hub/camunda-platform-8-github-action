import {ZBClient, ZBWorkerTaskHandler} from 'zeebe-node'
import * as core from '@actions/core'

export async function bootstrapWorkers(workerCode: string, lifetime: number) {
  return new Promise((resolve, reject) => {
    const __module: {
      exports?: {tasks?: {[key: string]: ZBWorkerTaskHandler}}
    } = {}
    eval(`(function(module){${workerCode}})(__module)`)
    const tasks = __module.exports?.tasks
    if (tasks) {
      const zbc = new ZBClient()
      Object.keys(tasks).forEach(tasktype => {
        core.info(`Starting worker for task type ${tasktype}...`)
        zbc.createWorker(null, tasktype, tasks[tasktype])
      })

      setTimeout(async () => {
        await zbc.close()
        resolve()
      }, lifetime * 60 * 1000)
    } else {
      reject(`No export 'zeebe' found in handler file`)
    }
  })
}
