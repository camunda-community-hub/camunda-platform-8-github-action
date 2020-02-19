import * as core from '@actions/core'
import {pipe} from 'fp-ts/lib/pipeable'
import * as TE from 'fp-ts/lib/TaskEither'
import * as T from 'fp-ts/lib/Task'
import * as E from 'fp-ts/lib/Either'
import {run, OperationFailure, OperationSuccess} from './run'
import {getConfigurationFromEnvironment} from './parameters/getEnvironment'
import {getCamundaCloudCredentials} from './parameters/getCamundaCloudCredentials'

const failure = (outcome: OperationFailure) => {
  const messages =
    typeof outcome.message === 'string' ? [outcome.message] : outcome.message
  for (const message in messages) {
    core.info(message)
  }
  core.setFailed('An error occurred. See the previous messages for details.')
  return T.never
}

const success = (outcome: OperationSuccess) => {
  const infos = typeof outcome.info === 'string' ? [outcome.info] : outcome.info
  for (const info in infos) {
    core.info(info)
  }
  core.setOutput('result', outcome.output)
  return T.never
}

const f = getCamundaCloudCredentials
const g = getConfigurationFromEnvironment
const h = run

pipe(f(), E.chain(g), TE.fromEither, TE.chain(h), TE.fold(failure, success))()
