import * as core from '@actions/core'
import {OperationName, OperationFailure} from '../run'
import * as E from 'fp-ts/lib/Either'

export interface JSONDoc {
  [key: string]: string | number | boolean | JSONDoc | JSONDoc[]
}

export type Variables = JSONDoc | JSONDoc[]

export interface Config {
  operation: OperationName
  bpmnProcessId?: string
  requestTimeoutSeconds: number
  timeToLive: number
  correlationKey?: string
  variables?: JSONDoc | JSONDoc[]
  messageName?: string
  quiet: boolean
  verbose: boolean
  workerHandlerFile?: string
  bpmnFilename?: string
  bpmnDirectory?: string
  workerLifetimeMins: number
}

export function getConfigurationFromEnvironment(): E.Either<
  OperationFailure,
  Config
> {
  const operation: OperationName = core.getInput('operation', {
    required: true
  }) as OperationName

  const verbose = core.getInput('verbose') === 'true'
  const quiet = core.getInput('quiet') === 'true'
  const messageName = core.getInput('messageName')
  const {variables, variableParsingError} = parseVariables(
    core.getInput('variables')
  )
  if (variableParsingError) {
    return E.left({
      message: `Could not parse supplied variables to JSON: ${core.getInput(
        'variables'
      )}`
    })
  }
  const correlationKey = core.getInput('correlationKey')
  const timeToLive = parseInt(
    (val => (val === '' ? '0' : val))(core.getInput('timeToLive')),
    10
  )
  const bpmnProcessId = core.getInput('bpmnProcessId')
  const requestTimeoutSeconds = (val =>
    !val || val === '' ? 30 : parseInt(val, 10))(
    core.getInput('requestTimeoutSeconds')
  )
  const workerHandlerFile = core.getInput('workerHandlerFile')
  const bpmnFilename = core.getInput('bpmnFilename')
  const bpmnDirectory = core.getInput('bpmnDirectory')
  const workerLifetimeMins = parseInt(core.getInput('workerLifetimeMins'), 10)

  const config = {
    bpmnProcessId,
    requestTimeoutSeconds,
    timeToLive,
    correlationKey,
    variables,
    messageName,
    quiet,
    verbose,
    workerHandlerFile,
    bpmnFilename,
    bpmnDirectory,
    workerLifetimeMins,
    operation
  }
  if (verbose) {
    core.info(`Run with configuration:`)
    core.info(JSON.stringify(config))
  }
  return E.right(config)
}

export function parseVariables(
  vars: string
):
  | {
      variableParsingError: false
      variables: Variables
    }
  | {
      variableParsingError: true
      message: string
      variables: undefined
    } {
  let variables
  try {
    variables = JSON.parse(vars || '{}')
  } catch (e) {
    return {
      variableParsingError: true,
      message: `Could not parse supplied variables to JSON: ${vars}`,
      variables: undefined
    }
  }
  return {
    variableParsingError: false,
    variables
  }
}
