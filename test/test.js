const promisesAplusTests = require('promises-aplus-tests')

const Word = require('../src/index')

const adapter = {
  deferred () {
    const pending = {}
    pending.promise = new Word((resolve, reject) => {
      pending.resolve = resolve
      pending.reject = reject
    })
    return pending
  }
}

// runs Promises/A+ compliance test suite
promisesAplusTests(adapter, function (err) {
  console.log('error', err)
})
