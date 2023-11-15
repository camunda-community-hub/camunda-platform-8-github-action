import {parseClientConfig} from '../src/parameters/get-camunda-cloud-credentials'

test('correctly parses config', async () => {
  const clientConfig = `export ZEEBE_ADDRESS='2fbb7f8f-1f4c-4f6d-bb7c-3bec17819f0a.zeebe.camunda.io:443'
    export ZEEBE_CLIENT_ID='2JnRz7o6Lbj9fkrTXfrvoAUL0IegoWFP'
    export ZEEBE_CLIENT_SECRET='OadXPMvfQVZOPwsm2L95C1sgtopPwIr_JbQ4KF8ITZRVl3UMF25AiPW0QoJmPkfI'
    export ZEEBE_AUTHORIZATION_SERVER_URL='https://login.cloud.camunda.io/oauth/token'`
  const p = parseClientConfig(clientConfig)
  expect(p.ZEEBE_ADDRESS).toBe(
    '2fbb7f8f-1f4c-4f6d-bb7c-3bec17819f0a.zeebe.camunda.io:443'
  )
  expect(p.ZEEBE_CLIENT_ID).toBe('2JnRz7o6Lbj9fkrTXfrvoAUL0IegoWFP')
  expect(p.ZEEBE_AUTHORIZATION_SERVER_URL).toBe(
    'https://login.cloud.camunda.io/oauth/token'
  )
  expect(p.ZEEBE_CLIENT_SECRET).toBe(
    'OadXPMvfQVZOPwsm2L95C1sgtopPwIr_JbQ4KF8ITZRVl3UMF25AiPW0QoJmPkfI'
  )
})

test('It returns a JSON-parsable object directly', () =>
  expect(parseClientConfig('{"ZEEBE_ADDRESS": 4}').ZEEBE_ADDRESS).toBe(4))

test('It returns an object for a non-parseable string', () =>
  expect(parseClientConfig('{a: 4}').ZEEBE_ADDRESS).toBe(undefined))

test('handles leading spaces', async () => {
  const clientConfig = `    export ZEEBE_ADDRESS='2fbb7f8f-1f4c-4f6d-bb7c-3bec17819f0a.zeebe.camunda.io:443'
      export ZEEBE_CLIENT_ID='2JnRz7o6Lbj9fkrTXfrvoAUL0IegoWFP'
      export ZEEBE_CLIENT_SECRET='OadXPMvfQVZOPwsm2L95C1sgtopPwIr_JbQ4KF8ITZRVl3UMF25AiPW0QoJmPkfI'
      export ZEEBE_AUTHORIZATION_SERVER_URL='https://login.cloud.camunda.io/oauth/token'`
  const p = parseClientConfig(clientConfig)
  expect(p.ZEEBE_ADDRESS).toBe(
    '2fbb7f8f-1f4c-4f6d-bb7c-3bec17819f0a.zeebe.camunda.io:443'
  )
  expect(p.ZEEBE_CLIENT_ID).toBe('2JnRz7o6Lbj9fkrTXfrvoAUL0IegoWFP')
  expect(p.ZEEBE_AUTHORIZATION_SERVER_URL).toBe(
    'https://login.cloud.camunda.io/oauth/token'
  )
  expect(p.ZEEBE_CLIENT_SECRET).toBe(
    'OadXPMvfQVZOPwsm2L95C1sgtopPwIr_JbQ4KF8ITZRVl3UMF25AiPW0QoJmPkfI'
  )
})
