import {ZBLogger} from '../log/logger'
import {ZBClient} from 'zeebe-node'

export const getZBC = (config: {quiet?: boolean}): ZBClient => {
  const logger = ZBLogger(config?.quiet ?? false)

  return new ZBClient({
    stdout: logger
  })
}
