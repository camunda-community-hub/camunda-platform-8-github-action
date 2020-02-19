console.log('Worker code running')

module.exports = {
  tasks: {
    'get-some-yo': (job, complete) => {
      console.log('You should never see this...')
      complete.success()
    }
  }
}
