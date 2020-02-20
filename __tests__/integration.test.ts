import {run} from '../src/run'
import {pipe} from 'fp-ts/lib/pipeable'
import {Config} from '../src/parameters/getEnvironment'
import * as TE from 'fp-ts/lib/TaskEither'
import {parseClientConfig} from '../src/parameters/getCamundaCloudCredentials'

jest.setTimeout(60000)
const quiet = false // Set to true to suppress log messages

// The GitHub secrets for the repo have a ZEEBE_CLIENT_CONFIG in them
// For local testing, you can either comment out these tests,
// or copy a client connection block from Camunda Cloud and put that in
// the env where you run the tests
if (process.env.ZEEBE_CLIENT_CONFIG) {
  const creds = parseClientConfig(process.env.ZEEBE_CLIENT_CONFIG)
  process.env.ZEEBE_ADDRESS = creds.ZEEBE_ADDRESS
  process.env.ZEEBE_AUTHORIZATION_SERVER_URL =
    creds.ZEEBE_AUTHORIZATION_SERVER_URL
  process.env.ZEEBE_CLIENT_ID = creds.ZEEBE_CLIENT_ID
  process.env.ZEEBE_CLIENT_SECRET = creds.ZEEBE_CLIENT_SECRET
  console.log(creds)
}

test('Deploy Workflow using Filename', done => {
  let called = false
  pipe(
    run(({
      bpmnFilename: '__tests__/demo-get-time.bpmn',
      operation: 'deployWorkflow',
      quiet
    } as unknown) as Config),
    TE.mapLeft(failure => {
      called = true
    }),
    TE.map(success => {
      expect(called).toBe(false)
      expect(JSON.parse(success.info[0]).workflows.length).toBe(1)
      done()
    })
  )()
})

test('Deploy Workflow using directory', done => {
  let called = false
  pipe(
    run(({
      bpmnDirectory: '__tests__',
      operation: 'deployWorkflow',
      quiet
    } as unknown) as Config),
    TE.mapLeft(failure => {
      called = true
    }),
    TE.map(success => {
      expect(called).toBe(false)
      expect(JSON.parse(success.info[0]).workflows.length).toBe(1)
      done()
    })
  )()
})

test('Create Workflow Instance', done => {
  let called = false
  pipe(
    run(({
      bpmnProcessId: 'demo-get-time-int-test',
      operation: 'createWorkflowInstance',
      quiet
    } as unknown) as Config),
    TE.mapLeft(failure => {
      called = true
      console.log(failure)
    }),
    TE.map(success => {
      try {
        expect(called).toBe(false)
        expect(JSON.parse(success.output).bpmnProcessId).toBe(
          'demo-get-time-int-test'
        )
      } catch (e) {
        console.log(e)
      } finally {
        done()
      }
    })
  )()
})

test('Create Workflow Instance with variables', done => {
  let called = false
  pipe(
    run(({
      bpmnProcessId: 'demo-get-time-int-test',
      operation: 'createWorkflowInstance',
      variables: {name: 'Noddy'}, // these get parsed from a string in hydration
      quiet
    } as unknown) as Config),
    TE.mapLeft(failure => {
      console.log(failure)
      called = true
    }),
    TE.map(success => {
      try {
        expect(called).toBe(false)
        expect(JSON.parse(success.output).bpmnProcessId).toBe(
          'demo-get-time-int-test'
        )
      } catch (e) {
        console.log(e)
      } finally {
        done()
      }
    })
  )()
})

test('Create Workflow Instance and Await with variables', done => {
  let called = false
  pipe(
    run(({
      bpmnProcessId: 'demo-get-time-int-test',
      operation: 'createWorkflowInstanceWithResult',
      variables: {name: 'Noddy'}, // these get parsed from a string in hydration
      requestTimeoutSeconds: 10,
      quiet
    } as unknown) as Config),
    TE.mapLeft(failure => {
      console.log(failure)
      called = true
    }),
    TE.map(success => {
      try {
        expect(called).toBe(false)
        expect(JSON.parse(success.output).bpmnProcessId).toBe(
          'demo-get-time-int-test'
        )
        expect(JSON.parse(success.output).variables.name).toBe('Noddy')
      } catch (e) {
        console.log(e)
      } finally {
        done()
      }
    })
  )()
})

test('Publish Message', done => {
  let called = false
  pipe(
    run(({
      messageName: 'demo-get-time-int-test',
      operation: 'publishMessage',
      quiet
    } as unknown) as Config),
    TE.mapLeft(failure => {
      console.log(failure)
      called = true
    }),
    TE.map(success => {
      expect(called).toBe(false)
      done()
    })
  )()
})

test('Publish Message', done => {
  let called = false
  pipe(
    run(({
      messageName: 'demo-get-time-int-test',
      operation: 'publishMessage',
      quiet
    } as unknown) as Config),
    TE.mapLeft(failure => {
      console.log(failure)
      called = true
    }),
    TE.map(success => {
      expect(called).toBe(false)
      expect(success.info[0]).toBe('Published message to Zeebe.')
      done()
    })
  )()
})

test('Start Worker', done => {
  let called = false
  pipe(
    run(({
      workerHandlerFile: '__tests__/worker.js',
      workerLifetimeMins: 0.2,
      operation: 'startWorkers',
      quiet: true
    } as unknown) as Config),
    TE.mapLeft(failure => {
      console.log(failure)
      called = true
    }),
    TE.map(success => {
      expect(called).toBe(false)
      done()
    })
  )()
})
