import * as core from '@actions/core'
import {pipe} from 'fp-ts/lib/pipeable'
import * as TE from 'fp-ts/lib/TaskEither'
import {run} from './run'
import {getConfigurationFromEnvironment} from './parameters/getEnvironment'

export type OperationSuccess = {info: string[]; output: string}
export type OperationFailure = {
  message: string[] | string
}
export type OperationOutcome = TE.TaskEither<OperationFailure, OperationSuccess>

export type OperationName =
  | 'publishMessage'
  | 'createWorkflowInstance'
  | 'createWorkflowInstanceWithResult'
  | 'deployWorkflow'
  | 'startWorkers'

export const OperationNames: OperationName[] = [
  'createWorkflowInstance',
  'createWorkflowInstanceWithResult',
  'deployWorkflow',
  'publishMessage',
  'startWorkers'
]

const failureHandler = (outcome: OperationFailure) => {
  const messages =
    typeof outcome.message === 'string' ? [outcome.message] : outcome.message
  for (const message in messages) {
    core.info(message)
  }
  core.setFailed('An error occurred. See the previous messages for details.')
  return outcome
}

const successHandler = (outcome: OperationSuccess) => {
  const infos = typeof outcome.info === 'string' ? [outcome.info] : outcome.info
  for (const info in infos) {
    core.info(info)
  }
  core.setOutput('result', outcome.output)
  return outcome
}

const config = getConfigurationFromEnvironment()

pipe(run(config), TE.mapLeft(failureHandler), TE.map(successHandler))
