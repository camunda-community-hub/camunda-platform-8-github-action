import {ZBClient} from 'zeebe-node'
import {OperationOutcome} from '../main'
import {CreateWorkflowInstance} from '../operation-config-validation'
import * as t from 'io-ts'
import * as TE from 'fp-ts/lib/TaskEither'

export function createWorkflowInstance(
  config: t.TypeOf<typeof CreateWorkflowInstance>
): OperationOutcome {
  return TE.tryCatch(
    async () => {
      const zbc = new ZBClient()
      const res = JSON.stringify(
        await zbc.createWorkflowInstance(
          config.bpmnProcessId,
          config.variables
        ),
        null,
        2
      )

      await zbc.close()
      return {
        error: false,
        info: [res],
        output: res
      }
    },
    (failure: unknown) => ({message: (failure as Error).message})
  )
}
