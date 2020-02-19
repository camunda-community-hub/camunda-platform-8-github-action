import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {Config, PublishMessage} from '../src/operation-config-validation'
import {fold, either, left} from 'fp-ts/lib/Either'
import {pipe} from 'fp-ts/lib/pipeable'
import * as t from 'io-ts'
import {PathReporter} from 'io-ts/lib/PathReporter'

// test('throws invalid number', async () => {
//   const input = parseInt('foo', 10)
//   await expect(wait(input)).rejects.toThrow('milliseconds not a number')
// })

// test('wait 500 ms', async () => {
//   const start = new Date()
//   await wait(500)
//   const end = new Date()
//   var delta = Math.abs(end.getTime() - start.getTime())
//   expect(delta).toBeGreaterThan(450)
// })

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', () => {
  process.env['INPUT_MILLISECONDS'] = '500'
  console.log(process.cwd())
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecSyncOptions = {
    env: process.env
  }
  // console.log(cp.execSync(`node ${ip}`, options).toString())
})

test('Bail on missing required parameters', () => {
  // failure handler
  const onLeft = (errors: t.Errors): any => PathReporter.report(left(errors))

  // success handler
  const onRight = (s: t.TypeOf<typeof PublishMessage>): any => `No errors: ${s}`
  const res = pipe(
    Config.PublishMessage.decode({
      message_name: 'Hello',
      // variables: 'shnt', // missing required value
      timeToLive: 10000
    }),
    fold(onLeft, onRight)
  )
  expect(typeof res).toBe('object')
})
