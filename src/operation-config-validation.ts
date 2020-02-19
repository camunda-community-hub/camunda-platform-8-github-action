import * as t from 'io-ts'

const PublishMessageRequired = t.type({
  messageName: t.string
})

const PublishMessageOptional = t.partial({
  correlationKey: t.string,
  variables: t.object,
  timeToLive: t.number
})

export const PublishMessage = t.intersection([
  PublishMessageRequired,
  PublishMessageOptional
])

export const CreateWorkflowInstanceRequired = t.type({
  bpmnProcessId: t.string
})

export const CreateWorkflowInstanceOptional = t.partial({
  variables: t.object
})

export const CreateWorkflowInstance = t.intersection([
  CreateWorkflowInstanceRequired,
  CreateWorkflowInstanceOptional
])

export const CreateWorkflowInstanceWithResultRequired = t.type({
  bpmnProcessId: t.string,
  requestTimeoutSeconds: t.number
})

export const CreateWorkflowInstanceWithResult = t.intersection([
  CreateWorkflowInstanceWithResultRequired,
  CreateWorkflowInstanceOptional
])

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

export const ConfigValidator = {
  PublishMessage,
  CreateWorkflowInstance,
  CreateWorkflowInstanceWithResult,
  DeployWorkflow,
  StartWorkers
}
