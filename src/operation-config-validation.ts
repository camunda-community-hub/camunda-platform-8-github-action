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
  variables: t.UnknownRecord,
  timeToLive: t.number
})

export const PublishMessage = t.intersection([
  PublishMessageRequired,
  PublishMessageOptional,
  GlobalOptional
])

export const CreateProcessInstanceRequired = t.type({
  bpmnProcessId: t.string,
  clusterId: t.string
})

export const CreateProcessInstanceOptional = t.partial({
  variables: t.UnknownRecord
})

export const CreateProcessInstance = t.intersection([
  CreateProcessInstanceRequired,
  CreateProcessInstanceOptional,
  GlobalOptional
])

export const CreateProcessInstanceWithResultRequired = t.type({
  bpmnProcessId: t.string,
  requestTimeoutSeconds: t.number
})

export const CreateProcessInstanceWithResult = t.intersection([
  CreateProcessInstanceWithResultRequired,
  CreateProcessInstanceOptional,
  GlobalOptional
])

export const DeployProcessFile = t.type({
  bpmnFilename: t.string
})

export const DeployProcessDir = t.type({
  bpmnDirectory: t.string
})

export const DeployProcess = t.intersection([
  GlobalOptional,
  t.union([DeployProcessFile, DeployProcessDir])
])

export const DeployResourceFile = t.type({
  resourceFilename: t.string
})

export const DeployResourceDir = t.type({
  resourceDirectory: t.string
})

export const DeployResource = t.intersection([
  GlobalOptional,
  t.union([DeployResourceFile, DeployResourceDir])
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
  CreateProcessInstance,
  CreateProcessInstanceWithResult,
  DeployProcess,
  DeployResource,
  StartWorkers
}
