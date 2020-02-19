import {run} from '../src/run'
import {pipe} from 'fp-ts/lib/pipeable'
import {Config} from '../src/parameters/getEnvironment'
import * as TE from 'fp-ts/lib/TaskEither'

jest.setTimeout(30000)

test('Deploy Workflow', done => {
  let called = false
  pipe(
    run(({
      bpmnFilename: '__tests__/demo-get-time.bpmn',
      operation: 'deployWorkflow'
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
      operation: 'createWorkflowInstance'
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
      variables: '{"name": "Noddy"}'
    } as unknown) as Config),
    TE.mapLeft(failure => {
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
      variables: '{"name": "Noddy"}'
    } as unknown) as Config),
    TE.mapLeft(failure => {
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
