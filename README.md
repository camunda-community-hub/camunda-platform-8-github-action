# Integrate GitHub Actions with Zeebe on Camunda Cloud

This GitHub Action allows you to integrate GitHub Actions into workflows orchestrated by Zeebe on Camunda Cloud.

You can create a workflow instance from a GitHub Action, run an entire workflow and act on the outcome in a GitHub Action, or publish an outcome from a GitHub Action to a workflow instance running in Camunda Cloud via a message.

See this article for some ideas on orchestrating multi-repo build workflows using Camunda Cloud.

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

## Development

Run the `npm run rebuild` task before checking the code in.