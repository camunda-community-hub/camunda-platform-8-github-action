import * as core from '@actions/core'
import * as TE from 'fp-ts/lib/TaskEither'
import * as t from 'io-ts'
import * as Operations from './operations'
import {setupEnv} from './parameters/setup-env'
import {Config} from './operation-config-validation'
import {pipe} from 'fp-ts/lib/pipeable'
import {left, mapLeft} from 'fp-ts/lib/Either'
import {Config as Configuration} from './parameters/getEnvironment'
import {PathReporter} from 'io-ts/lib/PathReporter'
import {
  OperationFailure,
  OperationSuccess,
  OperationName,
  OperationNames
} from './main'

export function run(
  config: Configuration
): TE.TaskEither<OperationFailure, OperationSuccess> {
  if (config.verbose) {
    core.info(`Run with configuration:`)
    core.info(JSON.stringify(config))
  }
  const bailWithMessage = (
    message: string[]
  ): TE.TaskEither<OperationFailure, never> =>
    TE.left({
      message,
      config
    })
  const missingCamundaCloudCredentialsConfig = setupEnv()
  if (missingCamundaCloudCredentialsConfig.length > 0) {
    return bailWithMessage([
      `Required configuration not found ${JSON.stringify(
        missingCamundaCloudCredentialsConfig
      )}`
    ])
  }
  const operationName: OperationName = core.getInput('operation', {
    required: true
  }) as OperationName
  if (config.variableParsingError) {
    return bailWithMessage([
      `Could not parse supplied variables to JSON: ${core.getInput(
        'variables'
      )}`
    ])
  }
  // lifts a validation using a specified error handler
  // https://github.com/gcanti/fp-ts/issues/526
  const liftWith = <L>(handler: (errors: t.Errors) => L) => <A>(
    fa: t.Validation<A>
  ): TE.TaskEither<L, A> => {
    return TE.fromEither(mapLeft(handler)(fa))
  }
  const lift = liftWith(
    (errors: t.Errors): OperationFailure => ({
      message: [
        `Missing required configuration keys for operation ${operationName}:`,
        JSON.stringify(PathReporter.report(left(errors)))
      ]
    })
  )
  switch (operationName) {
    case 'publishMessage': {
      return pipe(
        lift(Config.PublishMessage.decode(config)),
        TE.chain(Operations.publishMessage)
      )
    }
    case 'deployWorkflow': {
      return pipe(
        lift(Config.DeployWorkflow.decode(config)),
        TE.chain(Operations.deployWorkflow)
      )
    }
    case 'createWorkflowInstance': {
      return pipe(
        lift(Config.CreateWorkflowInstance.decode(config)),
        TE.chain(Operations.createWorkflowInstance)
      )
    }
    case 'createWorkflowInstanceWithResult': {
      return pipe(
        lift(Config.CreateWorkflowInstanceWithResult.decode(config)),
        TE.chain(Operations.createWorkflowInstanceWithResult)
      )
    }
    case 'startWorkers': {
      return pipe(
        lift(Config.StartWorkers.decode(config)),
        TE.chain(Operations.startWorkers)
      )
    }
    default: {
      return bailWithMessage([
        `Unknown operation ${operationName}. Valid operations: ${OperationNames.join(
          ','
        )}`
      ])
    }
  }
}
