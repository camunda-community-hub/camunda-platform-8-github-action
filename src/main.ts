import * as core from '@actions/core'
// import github from '@actions/github'
import {ZBClient} from 'zeebe-node'
import {setupEnv} from './setup-env'
// import * as Webhooks from '@octokit/webhooks'

type Operation =
  | 'publishMessage'
  | 'createWorkflowInstance'
  | 'createWorkflowInstanceWithResult'
  | 'deployWorkflow'

async function run(): Promise<void> {
  // if (github.context.eventName === 'repository_dispatch') {
  //   const pushPayload = github.context
  //     .payload as Webhooks.WebhookPayloadRepositoryDispatch
  //   core.debug(JSON.stringify(pushPayload.client_payload, null, 2))
  // }

  const missingConfigKeys = setupEnv()
  if (missingConfigKeys.length > 0) {
    return core.setFailed(
      `Required configuration not found ${JSON.stringify(missingConfigKeys)}`
    )
  }

  try {
    const operation: Operation = core.getInput('operation', {
      required: true
    }) as Operation

    switch (operation) {
      case 'publishMessage': {
        const name = core.getInput('message_name', {required: true})
        const variables = JSON.parse(core.getInput('variables') || '{}')
        const correlationKey = core.getInput('correlationKey')
        const timeToLive = parseInt(
          (val => (val === '' ? '0' : val))(core.getInput('ttl')),
          10
        )

        const zbc = new ZBClient()
        const messagePayload = {
          name,
          correlationKey,
          variables,
          timeToLive
        }
        await zbc.publishMessage(messagePayload)
        core.info(`Published message to Zeebe.`)
        core.info(JSON.stringify(messagePayload, null, 2))
        await zbc.close()
        break
      }
      case 'createWorkflowInstance': {
        const bpmnProcessId = core.getInput('bpmn_process_id', {required: true})
        const variables = JSON.parse(core.getInput('variables') || '{}')
        const zbc = new ZBClient()
        const res = JSON.stringify(
          await zbc.createWorkflowInstance(bpmnProcessId, variables),
          null,
          2
        )
        core.info(res)
        core.setOutput('result', res)
        await zbc.close()
        break
      }
      case 'createWorkflowInstanceWithResult': {
        const bpmnProcessId = core.getInput('bpmn_process_id', {required: true})
        const variables = JSON.parse(core.getInput('variables') || '{}')
        const requestTimeout = (val =>
          val === '' ? undefined : parseInt(val, 10))(
          core.getInput('requestTimeout')
        )
        const zbc = new ZBClient()
        const res = await zbc.createWorkflowInstanceWithResult({
          bpmnProcessId,
          variables,
          requestTimeout
        })
        core.info(JSON.stringify(res, null, 2))
        core.setOutput('result', JSON.stringify(res))
        await zbc.close()
        break
      }
      case 'deployWorkflow': {
        const filename = core.getInput('bpmn_filename', {required: true})
        const zbc = new ZBClient()
        const res = await zbc.deployWorkflow(`./${filename}`)
        core.info(JSON.stringify(res, null, 2))
        core.setOutput('result', JSON.stringify(res))
        await zbc.close()
        break
      }
      default: {
        core.setFailed(
          `Unknown operation ${operation}. Valid operations are: publishMessage, createWorkflowInstance, createWorkflowInstanceWithResult, deployWorkflow.`
        )
      }
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
