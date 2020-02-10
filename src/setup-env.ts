import * as core from '@actions/core'

export function setupEnv(): string[] {
  const ZEEBE_ADDRESS =
    process.env.ZEEBE_ADDRESS || core.getInput('zeebe_address')
  const ZEEBE_CLIENT_ID =
    process.env.ZEEBE_CLIENT_ID || core.getInput('zeebe_client_id')
  const ZEEBE_AUTHORIZATION_SERVER_URL =
    process.env.ZEEBE_AUTHORIZATION_SERVER_URL ||
    core.getInput('zeebe_authorization_server_url')
  const ZEEBE_CLIENT_SECRET =
    process.env.ZEEBE_CLIENT_SECRET || core.getInput('zeebe_client_secret')

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
    return missingConfigValues
  }

  core.exportVariable('ZEEBE_ADDRESS', ZEEBE_ADDRESS)
  core.exportVariable('ZEEBE_CLIENT_ID', ZEEBE_CLIENT_ID)
  core.exportVariable(
    'ZEEBE_AUTHORIZATION_SERVER_URL',
    ZEEBE_AUTHORIZATION_SERVER_URL
  )
  core.exportVariable('ZEEBE_CLIENT_SECRET', ZEEBE_CLIENT_SECRET)
  return []
}
