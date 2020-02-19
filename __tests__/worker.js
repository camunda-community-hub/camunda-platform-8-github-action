console.log('Worker code running')
console.log('Will shut down shortly...')

module.exports = {
  tasks: {
    'get-some-yo': (job, complete) => {
      console.log('You should never see this...')
      complete.success()
    }
  }
}
