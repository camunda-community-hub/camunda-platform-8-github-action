import * as t from 'io-ts'

const PublishMessageRequired = t.type({
  message_name: t.string,
  variables: t.object,
  timeToLive: t.number
})

const PublishMessageOptional = t.partial({
  correlationKey: t.string
})

export const PublishMessage = t.intersection([
  PublishMessageRequired,
  PublishMessageOptional
])

export const CreateWorkflowInstance = t.type({
  bpmnProcessId: t.string,
  variables: t.object
})

export const CreateWorkflowInstanceWithResult = t.type({
  bpmnProcessId: t.string,
  variables: t.object,
  requestTimeout: t.number
})

export const DeployWorkflowFile = t.type({
  bpmnFilename: t.string
})

export const DeployWorkflowDir = t.type({
  bpmnDir: t.string
})

export const DeployWorkflow = t.union([DeployWorkflowFile, DeployWorkflowDir])

export const StartWorkers = t.type({
  workerHandlerFile: t.string,
  workerLifetime: t.number
})

export const Config = {
  PublishMessage,
  CreateWorkflowInstance,
  CreateWorkflowInstanceWithResult,
  DeployWorkflow,
  StartWorkers
}
