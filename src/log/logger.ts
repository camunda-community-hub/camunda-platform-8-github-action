import * as core from '@actions/core'
import dayjs from 'dayjs'

type ZBLogLevel = 'INFO' | 'DEBUG' | 'NONE' | 'ERROR'
export interface Logger {
  error: LogFn
  info: LogFn
  debug: LogFn
}
type LogFn = (logMessage: string) => void

/**
 * Custom logger for ZBClient
 */
const logger =
  (loglevel: ZBLogLevel, actor: string, quiet: boolean): LogFn =>
  (logMessage: string): void => {
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
    const logMethod = loglevel === 'INFO' ? core.info : core.error
    logMethod(`${time} [${actor}] ${message}`)
  }

export const ZBLogger = (quiet: boolean): Logger => ({
  error: logger('ERROR', 'zbc', quiet),
  info: logger('INFO', 'zbc', quiet),
  debug: logger('DEBUG', 'zbc', quiet)
})

export const getActionLogger = (namespace: string, quiet = false): Logger => {
  const logInfo = logger('INFO', 'ZBA', quiet)
  const logError = logger('ERROR', 'ZBA', quiet)
  const transform = (msg: string): string =>
    JSON.stringify({message: `[${namespace}]: ${msg}`})
  return {
    info: (message: string) => logInfo(transform(message)),
    error: (message: string) => logError(transform(message)),
    debug: (message: string) => logError(transform(message))
  }
}
