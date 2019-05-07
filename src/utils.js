const utils = {}

utils.isFunction = function (value) {
  return value && typeof value === 'function'
}

utils.isObject = function (value) {
  return value && typeof value === 'object' && !Array.isArray(value)
}

module.exports = utils
