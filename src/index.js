const { isFunction, isObject } = require('./utils')

const PENDING = 'PENDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'

class Word {
  constructor (callback) {
    this._state = PENDING
    this._handlers = []
    this._value = null
    callback(this._resolve.bind(this), this._reject.bind(this))
  }

  _reject (err) {
    this._state = REJECTED
    this._value = err
    this._handlers.forEach(handler => this._callHandler(handler))
  }

  _resolve (res) {
    if (res === this) {
      throw new TypeError('Resolving object can not be the same object')
    } else if (res instanceof Word) {
      res.then(this._resolve.bind(this), this._reject.bind(this))
    } else if (isFunction(res) || isObject(res)) {
      let called = false

      try {
        const thenable = res.then
        if (isFunction(thenable)) {
          thenable.call(
            res,
            result => {
              if (!called) {
                this._resolve(result)
                called = true
              }
            },
            err => {
              if (!called) {
                this._reject(err)
              }
              called = true
            }
          )
        } else {
          this._fulfill(res)
        }
      } catch (err) {
        if (!called) {
          this._reject(err)
        }
      }
    } else {
      this._fulfill(res)
    }
  }

  _fulfill (result) {
    this._state = FULFILLED
    this._value = result
    this._handlers.forEach(handler => this._callHandler(handler))
  }

  _callHandler (handler) {
    if (this._isFulfilled() && isFunction(handler.onFulfilled)) {
      handler.onFulfilled(this._value)
    } else if (this._isRejected() && isFunction(handler.onRejected)) {
      handler.onRejected(this._value)
    }
  }

  _isPending () {
    return this._state === PENDING
  }

  _isFulfilled () {
    return this._state === FULFILLED
  }

  _isRejected () {
    return this._state === REJECTED
  }

  _addHandler (onFulfilled, onRejected) {
    this._handlers.push({
      onFulfilled,
      onRejected
    })
  }

  then (onFulfilled, onRejected) {
    switch (this._state) {
      case PENDING: {
        return new Word((resolve, reject) => {
          const fulfillCallback = value => {
            setTimeout(() => {
              try {
                if (isFunction(onFulfilled)) {
                  resolve(onFulfilled(value))
                } else {
                  resolve(value)
                }
              } catch (err) {
                reject(err)
              }
            }, 0)
          }

          const rejectCallback = err => {
            setTimeout(() => {
              try {
                if (isFunction(onRejected)) {
                  resolve(onRejected(err))
                } else {
                  reject(err)
                }
              } catch (error) {
                reject(error)
              }
            }, 0)
          }

          this._addHandler(fulfillCallback, rejectCallback)
        })
      }
      case FULFILLED: {
        return new Word((resolve, reject) => {
          setTimeout(() => {
            try {
              if (isFunction(onFulfilled)) {
                resolve(onFulfilled(this._value))
              } else {
                resolve(this._value)
              }
            } catch (err) {
              reject(err)
            }
          }, 0)
        })
      }
      case REJECTED: {
        return new Word((resolve, reject) => {
          setTimeout(() => {
            try {
              if (isFunction(onRejected)) {
                resolve(onRejected(this._value))
              } else {
                reject(this._value)
              }
            } catch (err) {
              reject(err)
            }
          }, 0)
        })
      }
    }
  }
}

module.exports = Word
