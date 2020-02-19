import {ZBClient} from 'zeebe-node'
import {OperationOutcome} from '../main'
import {CreateWorkflowInstanceWithResult} from '../operation-config-validation'
import * as t from 'io-ts'
import * as TE from 'fp-ts/lib/TaskEither'

export function createWorkflowInstanceWithResult(
  config: t.TypeOf<typeof CreateWorkflowInstanceWithResult>
): OperationOutcome {
  return TE.tryCatch(
    async () => {
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
        info: [result],
        output
      }
    },
    (failure: unknown) => ({message: (failure as Error).message})
  )
}
