import * as core from '@actions/core'
import {ZBClient} from 'zeebe-node'
import {setupEnv} from './setup-env'
import {readdirSync, existsSync, readFileSync} from 'fs'
import {resolve} from 'path'
import {bootstrapWorkers} from './workers'

type Operation =
  | 'publishMessage'
  | 'createWorkflowInstance'
  | 'createWorkflowInstanceWithResult'
  | 'deployWorkflow'
  | 'startWorkers'

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
        let variables
        try {
          variables = JSON.parse(core.getInput('variables') || '{}')
        } catch (e) {
          return core.setFailed(
            `Could not parse supplied variables to JSON: ${core.getInput(
              'variables'
            )}`
          )
        }
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
        const filename = core.getInput('bpmn_filename')
        const dir = core.getInput('bpmn_directory')
        if ((!filename && !dir) || (filename && dir)) {
          return core.setFailed(
            'deployWorkflow requires exactly one of bpmn_filename or bpmn_directory'
          )
        }

        const zbc = new ZBClient()
        const toDeploy = filename
          ? `./${filename}`
          : readdirSync(dir)
              .filter(f => f.endsWith('.bpmn'))
              .map(f => `${dir}/${f}`)
        const res = await zbc.deployWorkflow(toDeploy)
        core.info(JSON.stringify(res, null, 2))
        core.setOutput('result', JSON.stringify(res))
        await zbc.close()
        break
      }
      case 'startWorkers': {
        const configFile = core.getInput('worker_handler_file')
        if (!configFile) {
          return core.setFailed('Missing worker_handler_file parameter')
        }
        const lifetime = parseInt(core.getInput('worker_lifetime_mins'), 10)
        if (!existsSync(`./${configFile}`)) {
          return core.setFailed(
            `Could not find worker handler file ${resolve('./', configFile)}`
          )
        }
        const workerCode = readFileSync(`./${configFile}`, 'utf8')
        core.info(
          `Loading workers with config from ${resolve('./', configFile)}`
        )
        await bootstrapWorkers(workerCode, lifetime)
        break
      }
      default: {
        core.setFailed(
          `Unknown operation ${operation}. Valid operations are: publishMessage, createWorkflowInstance, createWorkflowInstanceWithResult, deployWorkflow, startWorkers.`
        )
      }
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
