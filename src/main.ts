import * as core from '@actions/core'
import {setupEnv} from './parameters/setup-env'
import {Config} from './operation-config-validation'
import * as t from 'io-ts'
import {pipe} from 'fp-ts/lib/pipeable'
import {fold, left} from 'fp-ts/lib/Either'
import * as Operations from './operations'
import {getConfigurationFromEnvironment} from './parameters/getEnvironment'
import {PathReporter} from 'io-ts/lib/PathReporter'

export type OperationSuccess = {error: false; info: string[]; output: string}
export type OperationFailure = {error: true; message: string[]}
export type OperationOutcome = OperationFailure | OperationSuccess

type OperationName =
  | 'publishMessage'
  | 'createWorkflowInstance'
  | 'createWorkflowInstanceWithResult'
  | 'deployWorkflow'
  | 'startWorkers'

async function run(): Promise<void> {
  const missingCamundaCloudCredentialsConfig = setupEnv()
  if (missingCamundaCloudCredentialsConfig.length > 0) {
    return core.setFailed(
      `Required configuration not found ${JSON.stringify(
        missingCamundaCloudCredentialsConfig
      )}`
    )
  }

  const operationName: OperationName = core.getInput('operation', {
    required: true
  }) as OperationName

  const config = getConfigurationFromEnvironment()

  if (config.variableParsingError) {
    return core.setFailed(
      `Could not parse supplied variables to JSON: ${core.getInput(
        'variables'
      )}`
    )
  }

  const onLeft = async (errors: t.Errors): Promise<OperationOutcome> => ({
    error: true,
    message: [
      `Missing required configuration keys for operation ${operationName}:`,
      JSON.stringify(PathReporter.report(left(errors)))
    ]
  })

  const operationExecution: {
    [key in OperationName]: () => Promise<OperationOutcome>
  } = {
    publishMessage: () =>
      pipe(
        Config.PublishMessage.decode(config),
        fold(onLeft, Operations.publishMessage)
      ),
    createWorkflowInstance: () =>
      pipe(
        Config.CreateWorkflowInstance.decode(config),
        fold(onLeft, Operations.createWorkflowInstance)
      ),
    createWorkflowInstanceWithResult: () =>
      pipe(
        Config.CreateWorkflowInstanceWithResult.decode(config),
        fold(onLeft, Operations.createWorkflowInstanceWithResult)
      ),
    deployWorkflow: () =>
      pipe(
        Config.DeployWorkflow.decode(config),
        fold(onLeft, Operations.deployWorkflow)
      ),
    startWorkers: () =>
      pipe(
        Config.StartWorkers.decode(config),
        fold(onLeft, Operations.startWorkers)
      )
  }

  if (!operationExecution[operationName]) {
    return core.setFailed(
      `Unknown operation ${operationName}. Valid operations are: ${Object.keys(
        operationExecution
      ).join(',')}.`
    )
  }

  const outcome = await operationExecution[operationName]()
  if (outcome.error) {
    for (const message in outcome.message) {
      core.info(message)
    }
    core.info('Run with configuration:')
    core.info(JSON.stringify(config))
    return core.setFailed(
      'An error occurred. See the previous messages for details.'
    )
  }
  for (const info in outcome.info) {
    core.info(info)
  }
  core.setOutput('result', outcome.output)
}

run()
