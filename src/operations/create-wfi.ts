import {CreateWorkflowInstance} from '../operation-config-validation'
import * as t from 'io-ts'
import * as TE from 'fp-ts/lib/TaskEither'
import {OperationOutcome} from '../run'
import {getZBC} from './zbc'

export function createWorkflowInstance(
  config: t.TypeOf<typeof CreateWorkflowInstance>
): OperationOutcome {
  return TE.tryCatch(
    async () => {
      const zbc = getZBC(config)

      const res = await zbc.createWorkflowInstance(
        config.bpmnProcessId,
        config.variables
      )
      await zbc.close()
      return {
        info: [JSON.stringify(res, null, 2)],
        output: JSON.stringify(res)
      }
    },
    (failure: unknown) => ({message: (failure as Error).message})
  )
}
