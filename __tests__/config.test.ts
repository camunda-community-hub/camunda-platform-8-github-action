import * as TE from 'fp-ts/lib/TaskEither'
import {run} from '../src/run'
import {Config} from '../src/parameters/getEnvironment'
import {
  ConfigValidator,
  PublishMessage
} from '../src/operation-config-validation'
import {fold, left} from 'fp-ts/lib/Either'
import {pipe} from 'fp-ts/lib/pipeable'
import * as t from 'io-ts'
import {PathReporter} from 'io-ts/lib/PathReporter'

const ZeebeConfig = {
  ZEEBE_ADDRESS: 'something',
  ZEEBE_AUTHORIZATION_SERVER_URL: 'something',
  ZEEBE_CLIENT_ID: 'something',
  ZEEBE_CLIENT_SECRET: 'something'
}

test('Bail on missing required parameters', () => {
  // failure handler
  const onLeft = (errors: t.Errors): any => PathReporter.report(left(errors))

  // success handler
  const onRight = (s: t.TypeOf<typeof PublishMessage>): any => `No errors: ${s}`
  const res = pipe(
    ConfigValidator.PublishMessage.decode({
      message_name: 'Hello',
      // variables: 'shnt', // missing required value
      timeToLive: 10000
    }),
    fold(onLeft, onRight)
  )
  expect(typeof res).toBe('object')
})

test('Parameter validation - no params', done => {
  // it will blow up with no parameters at all
  let called = false
  pipe(
    run({} as Config),
    TE.mapLeft(failure => {
      expect(failure?.message).toBeTruthy()
      expect(called).toBe(false)
      expect(failure.message.includes('Unknown operation')).toBe(true)
      done()
      return failure
    }),
    TE.map(success => {
      called = true
    })
  )()
})

test('Parameter validation - bad operation name', done => {
  // it will blow up with no parameters at all
  let called = false
  pipe(
    run(({
      ...ZeebeConfig,
      operation: 'whatever'
    } as unknown) as Config),
    TE.mapLeft(failure => {
      expect(failure?.message).toBeTruthy()
      expect(called).toBe(false)
      expect(failure.message.includes('Unknown operation whatever')).toBe(true)
      done()
      return failure
    }),
    TE.map(success => {
      called = true
    })
  )()
})

test('Parameter validation - missing required parameters for operation', done => {
  // it will blow up with no parameters at all
  let called = false
  pipe(
    run(({
      ...ZeebeConfig,
      operation: 'publishMessage'
    } as unknown) as Config),
    TE.mapLeft(failure => {
      console.log(failure)
      expect(failure?.message).toBeTruthy()
      expect(called).toBe(false)
      expect(
        failure.message[0].includes(
          'Missing required configuration keys for operation publishMessage'
        )
      ).toBe(true)
      done()
      return failure
    }),
    TE.map(success => {
      called = true
    })
  )()
})
