import {CreateProcessInstanceWithResult} from '../operation-config-validation'
import * as t from 'io-ts'
import * as TE from 'fp-ts/lib/TaskEither'
import {OperationOutcome} from '../run'
import {getZBC} from './zbc'

export function createProcessInstanceWithResult(
  config: t.TypeOf<typeof CreateProcessInstanceWithResult>
): OperationOutcome {
  return TE.tryCatch(
    async () => {
      const zbc = getZBC(config)
      const res = await zbc.createProcessInstanceWithResult({
        bpmnProcessId: config.bpmnProcessId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        variables: config.variables as any,
        requestTimeout: config.requestTimeoutSeconds * 1000
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
