import {
  DeployResource,
  DeployResourceFile
} from '../operation-config-validation'
import * as t from 'io-ts'
import * as TE from 'fp-ts/lib/TaskEither'

import {readdirSync} from 'fs'
import {OperationOutcome} from '../run'
import {getZBC} from './zbc'
import {
  DeployProcessResponse,
  DeployResourceResponse,
  Deployment
} from 'zeebe-node'

type DeployFile = t.TypeOf<typeof DeployResourceFile>

function isDeployFile(
  config: t.TypeOf<typeof DeployResource>
): config is DeployFile {
  return !!(config as DeployFile).resourceFilename
}

export function deployResource(
  config: t.TypeOf<typeof DeployResource>
): OperationOutcome {
  return TE.tryCatch(
    async () => {
      const zbc = getZBC(config)
      const toDeploy = isDeployFile(config)
        ? [`./${config.resourceFilename}`]
        : readdirSync(config.resourceDirectory)
            .filter(
              f =>
                f.endsWith('.bpmn') || f.endsWith('.dmn') || f.endsWith('.form')
            )
            .map(f => `${config.resourceDirectory}/${f}`)
      let res: (DeployResourceResponse<Deployment> | DeployProcessResponse)[] =
        []
      for (const deployable of toDeploy) {
        if (deployable.endsWith('.bpmn')) {
          res = [...res, await zbc.deployProcess(deployable)]
        }
        if (deployable.endsWith('.dmn')) {
          res = [
            ...res,
            await zbc.deployResource({decisionFilename: deployable})
          ]
        }
        if (deployable.endsWith('.form')) {
          res = [...res, await zbc.deployResource({formFilename: deployable})]
        }
      }
      await zbc.close()
      return {
        info: [JSON.stringify(res, null, 2)],
        output: JSON.stringify(res)
      }
    },
    (failure: unknown) => ({message: (failure as Error).message})
  )
}
