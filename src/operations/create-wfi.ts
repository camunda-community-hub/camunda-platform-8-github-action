import {ZBClient} from 'zeebe-node'
import {OperationOutcome} from '../main'
import {CreateWorkflowInstance} from '../operation-config-validation'
import * as t from 'io-ts'

export async function createWorkflowInstance(
  config: t.TypeOf<typeof CreateWorkflowInstance>
): Promise<OperationOutcome> {
  const zbc = new ZBClient()
  try {
    const res = JSON.stringify(
      await zbc.createWorkflowInstance(config.bpmnProcessId, config.variables),
      null,
      2
    )

    await zbc.close()
    return {
      error: false,
      info: [res],
      output: res
    }
  } catch (e) {
    return {
      error: true,
      message: e.message
    }
  }
}
