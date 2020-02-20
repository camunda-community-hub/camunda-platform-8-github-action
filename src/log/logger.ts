import * as core from '@actions/core'
import dayjs from 'dayjs'

export type ZBLogLevel = 'INFO' | 'DEBUG' | 'NONE' | 'ERROR'

type LogFn = (logMessage: string) => void

/**
 * Custom logger for ZBClient
 */
const logger = (loglevel: ZBLogLevel, quiet: boolean): LogFn => (
  logMessage: string
): void => {
  if (loglevel === 'INFO' && quiet) {
    return
  }
  let message: string
  try {
    const parsedMessage = JSON.parse(logMessage)
    const gRPC = parsedMessage.id === 'gRPC Channel' ? ' [gRPC Channel]:' : ''
    const taskType = parsedMessage.taskType
      ? ` [${parsedMessage.taskType}]`
      : ''
    message = `${gRPC}${taskType} ${parsedMessage.message}`
  } catch (e) {
    message = logMessage
  }
  const time = dayjs().format('HH:mm:ss.SSS')
  core.info(`${time} [zbc] ${message}`)
}

export const githubLogger = (quiet: boolean): {error: LogFn; info: LogFn} => ({
  error: logger('ERROR', quiet),
  info: logger('INFO', quiet)
})
