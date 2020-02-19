import * as TE from 'fp-ts/lib/TaskEither'
import * as t from 'io-ts'
import * as Operations from './operations'
import {ConfigValidator} from './operation-config-validation'
import {pipe} from 'fp-ts/lib/pipeable'
import {left, mapLeft} from 'fp-ts/lib/Either'
import {Config as Configuration} from './parameters/getEnvironment'
import {PathReporter} from 'io-ts/lib/PathReporter'

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

export const bailWithMessage = (
  message: string[] | string
): TE.TaskEither<OperationFailure, never> =>
  TE.left({
    message
  })

export function run(
  config: Configuration
): TE.TaskEither<OperationFailure, OperationSuccess> {
  const operationName: OperationName = config.operation as OperationName

  // lifts a validation using a specified error handler
  // https://github.com/gcanti/fp-ts/issues/526
  const liftWith = <L>(handler: (errors: t.Errors) => L) => <A>(
    fa: t.Validation<A>
  ): TE.TaskEither<L, A> => {
    return TE.fromEither(mapLeft(handler)(fa))
  }

  const lift = liftWith(
    (errors: t.Errors): OperationFailure => {
      return {
        message: [
          `Missing required configuration keys for operation ${operationName}:`,
          JSON.stringify(PathReporter.report(left(errors)))
        ]
      }
    }
  )

  switch (operationName) {
    case 'publishMessage': {
      return pipe(
        lift(ConfigValidator.PublishMessage.decode(config)),
        TE.chain(Operations.publishMessage)
      )
    }
    case 'deployWorkflow': {
      return pipe(
        lift(ConfigValidator.DeployWorkflow.decode(config)),
        TE.chain(Operations.deployWorkflow)
      )
    }
    case 'createWorkflowInstance': {
      return pipe(
        lift(ConfigValidator.CreateWorkflowInstance.decode(config)),
        TE.chain(Operations.createWorkflowInstance)
      )
    }
    case 'createWorkflowInstanceWithResult': {
      return pipe(
        lift(ConfigValidator.CreateWorkflowInstanceWithResult.decode(config)),
        TE.chain(Operations.createWorkflowInstanceWithResult)
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
