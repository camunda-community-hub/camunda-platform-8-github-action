import {ZBClient} from 'zeebe-node'
import {
  DeployWorkflow,
  DeployWorkflowFile
} from '../operation-config-validation'
import * as t from 'io-ts'
import * as TE from 'fp-ts/lib/TaskEither'

import {readdirSync} from 'fs'
import {OperationOutcome} from '../run'

type DeployFile = t.TypeOf<typeof DeployWorkflowFile>

function isDeployFile(
  config: t.TypeOf<typeof DeployWorkflow>
): config is DeployFile {
  return !!(config as DeployFile).bpmnFilename
}

export function deployWorkflow(
  config: t.TypeOf<typeof DeployWorkflow>
): OperationOutcome {
  return TE.tryCatch(
    async () => {
      const zbc = new ZBClient()
      const toDeploy = isDeployFile(config)
        ? `./${config.bpmnFilename}`
        : readdirSync(config.bpmnDir)
            .filter(f => f.endsWith('.bpmn'))
            .map(f => `${config.bpmnDir}/${f}`)
      const res = await zbc.deployWorkflow(toDeploy)
      await zbc.close()
      return {
        info: [JSON.stringify(res, null, 2)],
        output: JSON.stringify(res)
      }
    },
    (failure: unknown) => ({message: (failure as Error).message})
  )
}
