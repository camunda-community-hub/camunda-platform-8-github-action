import * as TE from 'fp-ts/TaskEither'
import * as t from 'io-ts'
import * as Operations from './operations'
import {ConfigValidator} from './operation-config-validation'
import {pipe} from 'fp-ts/function'
import {left, mapLeft} from 'fp-ts/lib/Either'
import {Config as Configuration} from './parameters/getEnvironment'
import {PathReporter} from 'io-ts/lib/PathReporter'

export interface OperationSuccess {
  info: string[]
  output: string
}
export interface OperationFailure {
  message: string[] | string
}
export type OperationOutcome = TE.TaskEither<OperationFailure, OperationSuccess>

export type OperationName =
  | 'publishMessage'
  | 'createProcessInstance'
  | 'createProcessInstanceWithResult'
  | 'deployProcess'
  | 'deployResource'
  | 'startWorkers'

export const OperationNames: OperationName[] = [
  'createProcessInstance',
  'createProcessInstanceWithResult',
  'deployProcess',
  'deployResource',
  'publishMessage',
  'startWorkers'
]

export const bailWithMessage = (
  message: string[] | string
): TE.TaskEither<OperationFailure, never> =>
  TE.left({
    message
  })

export function run(
  config: Configuration
): TE.TaskEither<OperationFailure, OperationSuccess> {
  const operationName: OperationName = config.operation

  // lifts a validation using a specified error handler
  // https://github.com/gcanti/fp-ts/issues/526
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const liftWith =
    <L>(handler: (errors: t.Errors) => L) =>
    <A>(fa: t.Validation<A>): TE.TaskEither<L, A> =>
      TE.fromEither(mapLeft(handler)(fa))

  const lift = liftWith((errors: t.Errors): OperationFailure => {
    return {
      message: [
        `Missing required configuration keys for operation ${operationName}:`,
        JSON.stringify(PathReporter.report(left(errors)))
      ]
    }
  })

  switch (operationName) {
    case 'publishMessage': {
      return pipe(
        lift(ConfigValidator.PublishMessage.decode(config)),
        TE.chain(Operations.publishMessage)
      )
    }
    case 'deployProcess': {
      return pipe(
        lift(ConfigValidator.DeployProcess.decode(config)),
        TE.chain(Operations.deployProcess)
      )
    }
    case 'deployResource': {
      return pipe(
        lift(ConfigValidator.DeployResource.decode(config)),
        TE.chain(Operations.deployResource)
      )
    }
    case 'createProcessInstance': {
      return pipe(
        lift(ConfigValidator.CreateProcessInstance.decode(config)),
        TE.chain(Operations.createProcessInstance)
      )
    }
    case 'createProcessInstanceWithResult': {
      return pipe(
        lift(ConfigValidator.CreateProcessInstanceWithResult.decode(config)),
        TE.chain(Operations.createProcessInstanceWithResult)
      )
    }
    case 'startWorkers': {
      return pipe(
        lift(ConfigValidator.StartWorkers.decode(config)),
        TE.chain(Operations.startWorkers)
      )
    }
    default: {
      return bailWithMessage(
        `Unknown operation ${operationName}. Valid operations: ${OperationNames.join(
          ', '
        )}`
      )
    }
  }
}
