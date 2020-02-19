import {ZBClient} from 'zeebe-node'
import {OperationOutcome} from '../main'
import {PublishMessage} from '../operation-config-validation'
import * as t from 'io-ts'

export async function publishMessage(
  config: t.TypeOf<typeof PublishMessage>
): Promise<OperationOutcome> {
  const result = []
  const zbc = new ZBClient()
  const messagePayload = {
    name: config.message_name,
    variables: config.variables,
    timeToLive: config.timeToLive,
    correlationKey: config.correlationKey || ((undefined as unknown) as string)
  }
  try {
    await zbc.publishMessage(messagePayload)
    result.push(`Published message to Zeebe.`)
    result.push(JSON.stringify(messagePayload, null, 2))
    const output = JSON.stringify(messagePayload, null, 2)
    await zbc.close()
    return {error: false, info: result, output}
  } catch (e) {
    return {error: true, message: e.message}
  }
}
