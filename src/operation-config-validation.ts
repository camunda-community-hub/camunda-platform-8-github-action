import * as t from 'io-ts'

const GlobalOptional = t.partial({
  quiet: t.boolean,
  verbose: t.boolean
})

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
  PublishMessageOptional,
  GlobalOptional
])

export const CreateWorkflowInstanceRequired = t.type({
  bpmnProcessId: t.string,
  clusterId: t.string
})

export const CreateWorkflowInstanceOptional = t.partial({
  variables: t.object
})

export const CreateWorkflowInstance = t.intersection([
  CreateWorkflowInstanceRequired,
  CreateWorkflowInstanceOptional,
  GlobalOptional
])

export const CreateWorkflowInstanceWithResultRequired = t.type({
  bpmnProcessId: t.string,
  requestTimeoutSeconds: t.number
})

export const CreateWorkflowInstanceWithResult = t.intersection([
  CreateWorkflowInstanceWithResultRequired,
  CreateWorkflowInstanceOptional,
  GlobalOptional
])

export const DeployWorkflowFile = t.type({
  bpmnFilename: t.string
})

export const DeployWorkflowDir = t.type({
  bpmnDirectory: t.string
})

export const DeployWorkflow = t.intersection([
  GlobalOptional,
  t.union([DeployWorkflowFile, DeployWorkflowDir])
])

export const StartWorkersRequired = t.type({
  workerHandlerFile: t.string,
  workerLifetimeMins: t.number
})

export const StartWorkers = t.intersection([
  StartWorkersRequired,
  GlobalOptional
])

export const ConfigValidator = {
  PublishMessage,
  CreateWorkflowInstance,
  CreateWorkflowInstanceWithResult,
  DeployWorkflow,
  StartWorkers
}
