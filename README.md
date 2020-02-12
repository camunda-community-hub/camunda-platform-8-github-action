# Integrate GitHub Actions with Zeebe on Camunda Cloud

This GitHub Action allows you to integrate GitHub Actions into workflows orchestrated by Zeebe on Camunda Cloud.

You can create a workflow instance from a GitHub Action, run an entire workflow and act on the outcome in a GitHub Action, or publish an outcome from a GitHub Action to a workflow instance running in Camunda Cloud via a message.

Note that at the moment it only works in the Ubuntu runner.

See this article for some ideas on orchestrating multi-repo build workflows using Camunda Cloud.

## Configure secrets

In a repository where you have a GitHub workflow that uses this action, you need to configure your Camunda Cloud client credentials.

1. Grab your client connection info from the Camunda Cloud console.
2. Set the various values as secrets in your repo (Repo Settings > Secrets) - i.e: ZEEBE_ADDRESS, etc...

## Start a Workflow

Here is an example of starting a workflow from within a GitHub Action:

```
name: Report Outcome

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
      - run: echo github.event.action: ${{ github.event.action }}
      - name: Create Zeebe Workflow
        uses: jwulf/zeebe-action@master
        with:
          zeebe_address: ${{ secrets.ZEEBE_ADDRESS }}
          zeebe_client_id: ${{ secrets.ZEEBE_CLIENT_ID }}
          zeebe_authorization_server_url: ${{ secrets.ZEEBE_AUTHORIZATION_SERVER_URL }}
          zeebe_client_secret: ${{ secrets.ZEEBE_CLIENT_SECRET }}
          operation: createWorkflowInstance
          bpmn_process_id: throw-test
          variables: '{"event": "${{ github.event.action }}" }'
```

## Publish a message

Here is an example of publishing a message back to Camunda Cloud, to be correlated with a running workflow. In this example, the action has been started with a `repository_dispatch` event from the CAMUNDA-HTTP worker. The `client_payload` on the event contains the correlationKey value for the message:

```
triggerDependentFlow:
  runs-on: ubuntu-latest
  steps:
    - name: Tell Camunda Cloud What's up!
      uses: jwulf/zeebe-action@master
      with:
        zeebe_address: ${{ secrets.ZEEBE_ADDRESS }}
        zeebe_client_id: ${{ secrets.ZEEBE_CLIENT_ID }}
        zeebe_authorization_server_url: ${{ secrets.ZEEBE_AUTHORIZATION_SERVER_URL }}
        zeebe_client_secret: ${{ secrets.ZEEBE_CLIENT_SECRET }}
        operation: publishMessage
        message_name: BASE_IMAGE_REBUILT
        correlationKey: ${{ github.event.client_payload.buildid }}
```

## Development

Run the `npm run rebuild` task before checking the code in.

The action is rebuilt on GitHub by the build.yaml workflow, to ensure that it has the correct binaries for gRPC in the GitHub runner environment.