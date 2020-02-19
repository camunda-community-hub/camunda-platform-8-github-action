import * as core from '@actions/core'
import {pipe} from 'fp-ts/lib/pipeable'
import * as TE from 'fp-ts/lib/TaskEither'
import * as E from 'fp-ts/lib/Either'
import * as T from 'fp-ts/lib/Task'
import {run, OperationFailure, OperationSuccess} from './run'
import {getConfigurationFromEnvironment} from './parameters/getEnvironment'

const failure = (outcome: OperationFailure) => {
  const messages =
    typeof outcome.message === 'string' ? [outcome.message] : outcome.message
  for (const message of messages) {
    core.info(message)
  }
  core.setFailed('An error occurred. See the previous messages for details.')

  return T.never
}

const success = (outcome: OperationSuccess) => {
  const infos = typeof outcome.info === 'string' ? [outcome.info] : outcome.info
  for (const info of infos) {
    core.info(info)
  }
  core.setOutput('result', outcome.output)
  return T.never
}

const g = getConfigurationFromEnvironment
const h = run

function program<E, Config, A, R>(
  g: () => E.Either<E, Config>,
  h: (c: Config) => TE.TaskEither<E, A>,
  failure: (e: E) => T.Task<R>,
  success: (a: A) => T.Task<R>
): T.Task<R> {
  return pipe(g(), TE.fromEither, TE.chain(h), TE.fold(failure, success))
}

program(g, h, failure, success)()
