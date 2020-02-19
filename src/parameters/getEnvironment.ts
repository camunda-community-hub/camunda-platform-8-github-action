import * as core from '@actions/core'

export interface JSONDoc {
  [key: string]: string | number | boolean | JSONDoc | JSONDoc[]
}

export type Variables = JSONDoc | JSONDoc[]

export interface Config {
  bpmnProcessId?: string
  requestTimeout: number
  timeToLive: number
  correlationKey?: string
  variables?: JSONDoc | JSONDoc[]
  variableParsingError: boolean
  messageName?: string
  quiet: boolean
  verbose: boolean
  workerHandlerFile?: string
  bpmnFilename?: string
  bpmnDir?: string
  workerLifetime: number
}

export function getConfigurationFromEnvironment(): Config {
  const verbose = core.getInput('verbose') === 'true'
  const quiet = core.getInput('quiet') === 'true'
  const messageName = core.getInput('message_name', {required: true})
  const {variables, variableParsingError} = parseVariables(
    core.getInput('variables')
  )
  const correlationKey = core.getInput('correlationKey')
  const timeToLive = parseInt(
    (val => (val === '' ? '0' : val))(core.getInput('ttl')),
    10
  )
  const bpmnProcessId = core.getInput('bpmn_process_id', {required: true})
  const requestTimeout = (val => (!val || val === '' ? 30 : parseInt(val, 10)))(
    core.getInput('requestTimeout')
  )
  const workerHandlerFile = core.getInput('worker_handler_file')
  const bpmnFilename = core.getInput('bpmn_filename')
  const bpmnDir = core.getInput('bpmn_directory')
  const workerLifetime = parseInt(core.getInput('worker_lifetime_mins'), 10)
  return {
    bpmnProcessId,
    requestTimeout,
    timeToLive,
    correlationKey,
    variables,
    variableParsingError,
    messageName,
    quiet,
    verbose,
    workerHandlerFile,
    bpmnFilename,
    bpmnDir,
    workerLifetime
  }
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
