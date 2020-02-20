core.info('Worker code successfully loaded')
core.info('A worker will start, then shut down shortly...')

module.exports = {
  tasks: {
    'get-some-yo': (job, complete) => {
      core.error('You should never see this...')
      complete.success()
    }
  }
}
