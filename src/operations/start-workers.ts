import {StartWorkers} from '../operation-config-validation'
import * as t from 'io-ts'
import {existsSync, readFileSync} from 'fs'
import {resolve} from 'path'
import {bootstrapWorkers} from '../workers'
import {JSONDoc} from '../parameters/getEnvironment'
import * as TE from 'fp-ts/lib/TaskEither'
import {OperationOutcome} from '../run'
import {getZBC} from './zbc'
import {getActionLogger} from '../log/logger'
import {execSync} from 'child_process'

export function startWorkers(
  config: t.TypeOf<typeof StartWorkers>
): OperationOutcome {
  return TE.tryCatch(
    async () => {
      const {workerHandlerFile, workerLifetimeMins} = config
      if (!existsSync(`./${workerHandlerFile}`)) {
        return Promise.reject(
          new Error(
            `Could not find worker handler file ${resolve(
              './',
              workerHandlerFile
            )}`
          )
        )
      }

      const log = getActionLogger('StartWorkers', config.quiet ?? false)
      const packageFile = resolve('./', 'package.json')
      if (existsSync(packageFile)) {
        const cwd = process.env.GITHUB_WORKSPACE ?? '.'
        execSync('npm i', {
          cwd: `${cwd}/.github/workflows`
        })
      }
      log.info(
        `Loading workers with config from ${resolve('./', workerHandlerFile)}`
      )
      const workerCode = readFileSync(`./${workerHandlerFile}`, 'utf8')

      const output: JSONDoc[] = []

      const zbc = getZBC(config)
      await bootstrapWorkers(workerCode, workerLifetimeMins, zbc, log)

      return {
        info: [JSON.stringify(output, null, 2)],
        output: JSON.stringify(output)
      }
    },
    (failure: unknown) => ({message: (failure as Error).message})
  )
}
