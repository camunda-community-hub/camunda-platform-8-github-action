import {OperationOutcome} from '../main'
import {StartWorkers} from '../operation-config-validation'
import * as t from 'io-ts'
import {existsSync, readFileSync} from 'fs'
import {resolve} from 'path'
import {bootstrapWorkers} from '../workers'
import * as core from '@actions/core'
import {JSONDoc} from '../parameters/getEnvironment'

export async function startWorkers(
  config: t.TypeOf<typeof StartWorkers>
): Promise<OperationOutcome> {
  try {
    const {workerHandlerFile, workerLifetime} = config
    if (!existsSync(`./${workerHandlerFile}`)) {
      return {
        error: true,
        message: [
          `Could not find worker handler file ${resolve(
            './',
            workerHandlerFile
          )}`
        ]
      }
    }
    const workerCode = readFileSync(`${__dirname}/${workerHandlerFile}`, 'utf8')
    core.info(
      `Loading workers with config from ${resolve('./', workerHandlerFile)}`
    )
    const output: JSONDoc[] = []

    await bootstrapWorkers(workerCode, workerLifetime)

    return {
      error: false,
      info: [JSON.stringify(output, null, 2)],
      output: JSON.stringify(output)
    }
  } catch (e) {
    return {
      error: true,
      message: e.message
    }
  }
}
