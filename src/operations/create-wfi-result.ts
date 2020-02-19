import {ZBClient} from 'zeebe-node'
import {OperationOutcome} from '../main'
import {CreateWorkflowInstanceWithResult} from '../operation-config-validation'
import * as t from 'io-ts'

export async function createWorkflowInstanceWithResult(
  config: t.TypeOf<typeof CreateWorkflowInstanceWithResult>
): Promise<OperationOutcome> {
  try {
    const zbc = new ZBClient()
    const res = await zbc.createWorkflowInstanceWithResult({
      bpmnProcessId: config.bpmnProcessId,
      variables: config.variables,
      requestTimeout: config.requestTimeout * 1000
    })
    const result = JSON.stringify(res, null, 2)
    const output = JSON.stringify(res)
    await zbc.close()
    return {
      error: false,
      info: [result],
      output
    }
  } catch (e) {
    return {
      error: true,
      message: e.message
    }
  }
}
