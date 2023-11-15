import * as core from '@actions/core'
import * as E from 'fp-ts/lib/Either'
import {OperationFailure} from '../run'

interface ZeebeClientConfig {
  ZEEBE_ADDRESS: string | undefined
  ZEEBE_CLIENT_ID: string | undefined
  ZEEBE_AUTHORIZATION_SERVER_URL: string | undefined
  ZEEBE_CLIENT_SECRET: string | undefined
}

const noConfig = {
  ZEEBE_ADDRESS: undefined,
  ZEEBE_CLIENT_ID: undefined,
  ZEEBE_AUTHORIZATION_SERVER_URL: undefined,
  ZEEBE_CLIENT_SECRET: undefined
}

export function getCamundaCloudCredentials(): E.Either<OperationFailure, void> {
  const clientConfig = parseClientConfig(core.getInput('clientConfig'))
  const ZEEBE_ADDRESS =
    process.env.ZEEBE_ADDRESS ||
    clientConfig.ZEEBE_ADDRESS ||
    core.getInput('zeebeAddress')
  const ZEEBE_CLIENT_ID =
    process.env.ZEEBE_CLIENT_ID ||
    clientConfig.ZEEBE_CLIENT_ID ||
    core.getInput('zeebeClientId')
  const ZEEBE_AUTHORIZATION_SERVER_URL =
    process.env.ZEEBE_AUTHORIZATION_SERVER_URL ||
    clientConfig.ZEEBE_AUTHORIZATION_SERVER_URL ||
    core.getInput('zeebeAuthorizationServerUrl')
  const ZEEBE_CLIENT_SECRET =
    process.env.ZEEBE_CLIENT_SECRET ||
    clientConfig.ZEEBE_CLIENT_SECRET ||
    core.getInput('zeebeClientSecret')

  const missingConfigValues = []

  if (ZEEBE_ADDRESS === '') {
    missingConfigValues.push('ZEEBE_ADDRESS')
  }
  if (ZEEBE_AUTHORIZATION_SERVER_URL === '') {
    missingConfigValues.push('ZEEBE_AUTHORIZATION_SERVER_URL')
  }
  if (ZEEBE_CLIENT_ID === '') {
    missingConfigValues.push('ZEEBE_CLIENT_ID')
  }
  if (ZEEBE_CLIENT_SECRET === '') {
    missingConfigValues.push('ZEEBE_CLIENT_SECRET')
  }
  if (missingConfigValues.length > 0) {
    return E.left({
      message: `Required configuration not found ${JSON.stringify(
        missingConfigValues
      )}`
    })
  }

  core.exportVariable('ZEEBE_ADDRESS', ZEEBE_ADDRESS)
  core.exportVariable('ZEEBE_CLIENT_ID', ZEEBE_CLIENT_ID)
  core.exportVariable(
    'ZEEBE_AUTHORIZATION_SERVER_URL',
    ZEEBE_AUTHORIZATION_SERVER_URL
  )
  core.exportVariable('ZEEBE_CLIENT_SECRET', ZEEBE_CLIENT_SECRET)
  return E.right(void 0)
}

export function parseClientConfig(clientConfig: string): ZeebeClientConfig {
  if (!clientConfig) {
    return noConfig
  }
  try {
    // Let's see if it is the new JSON config from https://github.com/zeebe-io/zeebe/issues/3544
    // When it lands we will need to normalise it here
    return JSON.parse(clientConfig)
  } catch (e) {
    try {
      // Nope, let's parse it as the exported variable block from the console
      return JSON.parse(
        `{"${clientConfig
          .trim()
          .substring(7)
          .split("'")
          .join('')
          .split('export ')
          .join('')
          .split('\n')
          .map(s => s.trimLeft())
          .join('","')
          .split('=')
          .join('":"')}"}`
      )
    } catch (err) {
      // Couldn't parse it
      return noConfig
    }
  }
}
