import {ZBClient} from 'zeebe-node'
import {OperationOutcome} from '../main'
import {
  DeployWorkflow,
  DeployWorkflowFile
} from '../operation-config-validation'
import * as t from 'io-ts'
import {readdirSync} from 'fs'

type DeployFile = t.TypeOf<typeof DeployWorkflowFile>

function isDeployFile(
  config: t.TypeOf<typeof DeployWorkflow>
): config is DeployFile {
  return !!(config as DeployFile).bpmnFilename
}

export async function deployWorkflow(
  config: t.TypeOf<typeof DeployWorkflow>
): Promise<OperationOutcome> {
  try {
    const zbc = new ZBClient()
    const toDeploy = isDeployFile(config)
      ? `./${config.bpmnFilename}`
      : readdirSync(config.bpmnDir)
          .filter(f => f.endsWith('.bpmn'))
          .map(f => `${config.bpmnDir}/${f}`)
    const res = await zbc.deployWorkflow(toDeploy)
    await zbc.close()
    return {
      error: false,
      info: [JSON.stringify(res, null, 2)],
      output: JSON.stringify(res)
    }
  } catch (e) {
    return {
      error: true,
      message: e.message
    }
  }
}
