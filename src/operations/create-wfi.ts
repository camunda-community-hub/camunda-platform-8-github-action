import {CreateProcessInstance} from '../operation-config-validation'
import * as t from 'io-ts'
import * as TE from 'fp-ts/lib/TaskEither'
import {OperationOutcome} from '../run'
import {getZBC} from './zbc'
import {getActionLogger} from '../log/logger'

export function createProcessInstance(
  config: t.TypeOf<typeof CreateProcessInstance>
): OperationOutcome {
  return TE.tryCatch(
    async () => {
      const zbc = getZBC(config)

      const res = await zbc.createProcessInstance({
        bpmnProcessId: config.bpmnProcessId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        variables: (config.variables as any) ?? {}
      })
      const log = getActionLogger('CreateProcessInstance', config.quiet)
      log.info(`View this process instance in Operate:`)
      log.info(
        `https://${config.clusterId}.operate.camunda.io/#/instances/${res.processInstanceKey}`
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
