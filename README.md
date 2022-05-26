# Integrate GitHub Actions with Camunda 8 SaaS

![Community Extension](https://img.shields.io/badge/Community%20Extension-An%20open%20source%20community%20maintained%20project-FF4700)

![Lifecycle](https://img.shields.io/badge/Lifecycle-Stable-brightgreen)

![Compatible with: Camunda Platform 8](https://img.shields.io/badge/Compatible%20with-Camunda%20Platform%208-0072Ce)

This GitHub Action allows you to integrate GitHub Actions into workflows orchestrated by [Zeebe](https://zeebe.io) on [Camunda Platform 8 SaaS](https://camunda.io).

You can deploy a process definition to Camunda 8 SaaS, create a process instance from a GitHub Action, start and run an entire process on Camunda 8 SaaS and act on the outcome in a GitHub Action, or publish a message from a GitHub Action to a process instance running in Camunda 8 SaaS.

See this article: "[Complex multi-repo builds with GitHub Actions and Camunda Cloud](https://zeebe.io/blog/2020/02/camunda-cloud-github-actions/)" for some ideas on orchestrating multi-repo build workflows using Camunda SaaS.

## Node version compatibility

This GitHub Action uses a version of the Zeebe Node client that requires Node versions 12.22.5+, 14.17.5+, or 16.6.1+.

## Operations

| Operation | Required Parameters | Optional Parameters |
| --- | --- | --- |
| `deployProcess` | **One of**: `bpmnFilename` _or_ `bpmnDir` | `verbose`, `quiet` |
| `createProcessInstance` | `bpmnProcessId` |  `variables`, `verbose`, `quiet` |
|`createProcessInstanceWithResult` | `bpmnProcessId`, `requestTimeoutSeconds` | `variables`, `verbose`, `quiet` |
| `publishMessage` | `messageName` | `timetoLive`, `variables`, `correlationKey`, `verbose`, `quiet` |
| `startWorkers` | `workerHandlerFile`, `workerLifetimeMins` | `githubToken`, `verbose`, `quiet` |

## Configure Camunda SaaS credentials

In a repository where you have a GitHub workflow that uses this action, you need to configure your Camunda SaaS client credentials.

* In the [Camunda SaaS console](https://console.cloud.camunda.io/), click the button to copy your client connection info.

![](img/client-creds.png)

* Set a secret in your repo (Repo Settings > Secrets) `ZEEBE_CLIENT_CONFIG`, and paste in the entire block from Camunda SaaS.

![](img/secret.png)

See the note at the end of this document if you get errors about missing required configuration keys.

## Deploy a Process Definition

Here is an example of deploying a process definition from GitHub. This will deploy the process in the file `bpmn/demo-get-time.bpmn` in the repo:

```
name: Run Get Time Demo

on: [repository_dispatch]

jobs:
  demo-get-time:
    if: github.event.action == 'get_time'
    runs-on: ubuntu-latest

steps:
  - uses: actions/checkout@v2
  - name: Deploy Demo Process "Get Time"
    uses: jwulf/zeebe-action@master
    with:
      clientConfig: ${{ secrets.ZEEBE_CLIENT_CONFIG }}
      operation: deployProcess
      bpmnFilename: bpmn/demo-get-time.bpmn
```

## Automate Deployment of BPMN Models on Push to master

Here is a workflow that redeploys changed models in the `bpmn` directory of your repo on a push to the master branch:

```
name: Deploy Processes

on:
  push:
    branches:
      - master
    paths:
      - 'bpmn/*'

jobs:
  deploy-processes:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2
      - name: Deploy Updated Processes
        uses: jwulf/zeebe-action@master
        with:
          clientConfig: ${{ secrets.ZEEBE_CLIENT_CONFIG }}
          operation: deployProcess
          bpmnDirectory: bpmn
```

## Start a Process Instance

Here is an example of starting a process instance from within a GitHub Workflow:

```
name: Report Outcome

on: repository_dispatch

jobs:
  report:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v2
      - name: Use Node.js 16.x
        uses: actions/setup-node@v1
        with:
          node-version: 16.x
      - run: echo github.event.action: ${{ github.event.action }}
      - name: Create Process
        uses: jwulf/camunda-action@master
        with:
          clientConfig: ${{ secrets.ZEEBE_CLIENT_CONFIG }}
          operation: createProcessInstance
          bpmnProcessId: throw-test
          variables: '{"event": "${{ github.event.action }}" }'
```

## Awaiting the outcome of a Process Instance

You can create a process instance and retrieve the outcome of the process instance for use in further steps:

```
name: Run Get Time Demo

on: [repository_dispatch]

jobs:
  demo-get-time:
    if: github.event.action == 'get_time'
    runs-on: ubuntu-latest

steps:
  - uses: actions/checkout@v2
  - name: Deploy Demo Process "Get Time"
    uses: jwulf/zeebe-action@master
    with:
      clientConfig: ${{ secrets.ZEEBE_CLIENT_CONFIG }}
      operation: deployProcess
      bpmnFilename: bpmn/demo-get-time.bpmn
  - name: Execute Demo Process "Get Time"
    uses: jwulf/zeebe-action@master
    id: get-time
    with:
      operation: createProcessInstanceWithResult
      bpmnProcessId: demo-get-time
      requestTimeout: 30 # seconds
  - name: Print Process Outcome
    run: echo The outcome is ${{ toJSON(steps.get-time.outputs.result }}
  - name: Print time
    run: echo The time is ${{ steps.get-time.outputs.result.body.time }}
```

When awaiting a process outcome, if no `request_timeout` is provided, it defaults to the Gateway timeout of the cluster (15 seconds). For processes that take longer than this to complete, you should specify a `request_timeout`.

Note that once the connection configuration is provided, it is available to any further Zeebe Action operations in the GitHub workflow.

## Publish a message

Here is an example of publishing a message back to Camunda SaaS, to be correlated with a running process instance. In this example, the action has been started with a `repository_dispatch` event from the CAMUNDA-HTTP worker. The `client_payload` on the event contains the correlationKey value for the message:

```
triggerDependentFlow:
  runs-on: ubuntu-latest
  steps:
    - name: Tell Camunda SaaS What's up!
      uses: jwulf/zeebe-action@master
      with:
        clientConfig: ${{ secrets.ZEEBE_CLIENT_CONFIG }}
        operation: publishMessage
        messageName: BASE_IMAGE_REBUILT
        correlationKey: ${{ github.event.client_payload.buildid }}
```

Variables can be provided in a `publishMessage` operation. They should be stringified JSON, just like the `createProcessInstance` operation.

## Create Workers 

You can start Zeebe task workers in a GitHub Workflow, using handler code loaded from your repo.

Dependencies in a `package.json` file in the `.github/workflows` folder are installed when workers are started.

For example, to start workers based on a `workers.js` file in the root of your repo, and shut them down after 10 minutes:

```
name: Start Workers

on: repository_dispatch

jobs:
  report:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v2
      - name: Use Node.js 12.x
        uses: actions/setup-node@v1
        with:
          node-version: 12.x
      - name: Start Zeebe Workers
        uses: jwulf/zeebe-action@master
        with:
          clientConfig: ${{ secrets.ZEEBE_CLIENT_CONFIG }}
          # If you want to access the GitHub API in your worker:
          githubToken: ${{ secrets.GITHUB_TOKEN }} 
          operation: startWorkers
          workerHandlerFile: workers.js
          workerLifetimeMins: 10
```

The `workers.js` file should look like this: 

```javascript
module.exports = {
  let stockLevel = 100
  tasks: {
    'get-stock-level: (job, complete) => {
      // you have @actions/core in scope
      core.info(JSON.stringify(job, null, 2))
      complete.success({
        stockLevel
      })
    },
    'decrement-stock': (job, complete) => {
      stock --
      complete.success({
        stockLevel
      })
    }
  }
}
```

If you want to make GitHub API calls in your worker, then set the `gitHubToken` parameter as `githubToken: ${{ secrets.GITHUB_TOKEN }}`.

Then your worker code will have a hydrated [Octokit](https://github.com/actions/toolkit/tree/master/packages/github) reference in scope as `octokit`. 

## Development

Run the `npm run rebuild` task before checking the code in.

For this, you need Docker running.

The action is rebuilt on GitHub by the build.yaml workflow, to ensure that it has the correct binaries for gRPC in the GitHub runner environment.

To create a new release, tag the master branch, then use the GitHub "Create a Release" feature.

## A note on configuration

Previously, you had to create individual secrets for each of the client credential fields: `ZEEBE_ADDRESS`, `ZEEBE_CLIENT_ID`, etc...

However, this is clunky. Ain't nobody got time fo' that!

We are waiting on the [single JSON-parseable connection string](https://github.com/zeebe-io/zeebe/issues/3544) to land. In the meantime, the Zeebe Action parses the text of the credentials block from the Cloud console to extract the credential values. Text parsing is brittle, and a change in the formatting of that block could break it.

As a backup, the previous method still works. To use it that way, create a secret for each one, and paste in the _unquoted_ value of the variable.

Then in your workflows, you need to do:

```
jobs:
  startWorkflow:
    runs-on: ubuntu-latest
    steps:
      - name: Get current time
        uses: gerred/actions/current-time@master
        id: current-time
      - name: Create Zeebe Process Instance
        uses: jwulf/zeebe-action@master
        with:
          zeebeAddress: ${{ secrets.ZEEBE_ADDRESS }}
          zeebeClientId: ${{ secrets.ZEEBE_CLIENT_ID }}
          zeebeAuthorizationServerUrl: ${{ secrets.ZEEBE_AUTHORIZATION_SERVER_URL }}
          zeebeClientSecret: ${{ secrets.ZEEBE_CLIENT_SECRET }}
          operation: createProcessInstance
          bpmnProcessId: magikcraft-github-build
          variables: '{"buildid": "${{ github.sha }}-${{ steps.current-time.outputs.time }}"}'
```

