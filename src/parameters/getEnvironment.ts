import * as core from '@actions/core'
import {OperationName, OperationFailure} from '../run'
import * as E from 'fp-ts/lib/Either'
import {getCamundaCloudCredentials} from './getCamundaCloudCredentials'

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

const getOrElse = (key: string): string | undefined => {
  const value = core.getInput(key)
  return value === '' ? undefined : value
}

export function getConfigurationFromEnvironment(): E.Either<
  OperationFailure,
  Config
> {
  const operation: OperationName = core.getInput('operation', {
    required: true
  }) as OperationName

  const camundaCreds = getCamundaCloudCredentials()
  if (E.isLeft(camundaCreds)) {
    return camundaCreds
  }

  const verbose = getOrElse('verbose') === 'true'
  const quiet = getOrElse('quiet') === 'true'
  const messageName = getOrElse('messageName')
  const {variables, variableParsingError} = parseVariables(
    getOrElse('variables') || '{}'
  )
  if (variableParsingError) {
    return E.left({
      message: `Could not parse supplied variables to JSON: ${getOrElse(
        'variables'
      )}`
    })
  }
  const correlationKey = getOrElse('correlationKey')
  const timeToLive = parseInt(getOrElse('timeToLive') || '0', 10)
  const bpmnProcessId = getOrElse('bpmnProcessId')
  const requestTimeoutSeconds = (val =>
    !val || val === '' ? 30 : parseInt(val, 10))(
    getOrElse('requestTimeoutSeconds')
  )
  const workerHandlerFile = getOrElse('workerHandlerFile')
  const bpmnFilename = getOrElse('bpmnFilename')
  const bpmnDirectory = getOrElse('bpmnDirectory')
  const workerLifetimeMins = parseInt(
    getOrElse('workerLifetimeMins') || '2',
    10
  )
  const clusterId = process.env.ZEEBE_ADDRESS || ''.split('.')?.[0]

  const config = {
    bpmnProcessId,
    clusterId,
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
