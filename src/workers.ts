import {ZBClient, ZBWorkerTaskHandler} from 'zeebe-node'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {getActionLogger, Logger} from './log/logger'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import github from '@actions/github'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as core from '@actions/core'

export async function bootstrapWorkers(
  workerCode: string,
  lifetime: number,
  zbc: ZBClient,
  logger: Logger
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const __module: {
      exports?: {tasks?: {[key: string]: ZBWorkerTaskHandler}}
    } = {}
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const githubToken = core.getInput('githubToken')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const log = getActionLogger('WorkerHandler', false)
    try {
      eval(
        `(function(module){
            const octokit = githubToken === '' ? 
              undefined : github.getOctokit(githubToken)
            const { createRequire } = require("module");
            const __workerNodeModules = process.cwd() + "/.github/workflows/node_modules";
            require = createRequire(__workerNodeModules);
            ${workerCode}
          })(__module)`
      )
    } catch (e) {
      reject(new Error(`Error in handler file: ${(e as Error).message}`))
    }
    const tasks = __module.exports?.tasks
    if (tasks) {
      for (const tasktype of Object.keys(tasks)) {
        logger.info(`Starting worker for task type ${tasktype}...`)
        zbc.createWorker(null, tasktype, tasks[tasktype])
      }

      setTimeout(async () => {
        logger.info('Shutting down workers...')
        await zbc.close()
        resolve()
      }, lifetime * 60 * 1000)
    } else {
      await zbc.close()
      reject(new Error(`No export 'tasks' found in handler file`))
    }
  })
}
