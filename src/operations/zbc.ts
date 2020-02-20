import {githubLogger} from '../log/logger'
import {ZBClient} from 'zeebe-node'

export const getZBC = (config: {quiet?: boolean}): ZBClient => {
  const logger = githubLogger(config?.quiet ?? false)
  return new ZBClient({
    stdout: logger
  })
}
