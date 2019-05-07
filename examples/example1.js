const Word = require('../src/index')

const p = new Word(function (resolve, reject) {
  setTimeout(function () {
    resolve('foo')
  }, 3000)
  // call resolve method after 3 seconds
})

p.then(function (value) {
  console.log('a', value)
  // print out "foo" after 3 seconds
  return 'bar'
})
  .then(function (value) {
    console.log('b', value)
    // print "bar"
    return 'baz'
  })
  .then(function (value) {
    console.log('c', value)
    // print "bar"
  })
