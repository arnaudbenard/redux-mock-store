import { applyMiddleware } from 'redux'
import isPlainObject from 'lodash.isplainobject'

const isFunction = arg => typeof arg === 'function'

export function configureStore (middlewares = []) {
  return function mockStore (getState = {}) {
    function mockStoreWithoutMiddleware () {
      let actions = []
      let listeners = []

      const self = {
        getState () {
          return isFunction(getState) ? getState(actions) : getState
        },

        getActions () {
          return actions
        },

        dispatch (action) {
          if (!isPlainObject(action)) {
            throw new Error(
              'Actions must be plain objects. ' +
              'Use custom middleware for async actions.'
            )
          }

          if (typeof action.type === 'undefined') {
            throw new Error(
              'Actions may not have an undefined "type" property. ' +
              'Have you misspelled a constant? ' +
              'Action: ' +
              JSON.stringify(action)
            )
          }

          actions.push(action)

          for (let i = 0; i < listeners.length; i++) {
            listeners[i](action)
          }

          return action
        },

        clearActions () {
          actions = []
        },

        subscribe (cb) {
          if (isFunction(cb)) {
            listeners.push(cb)
          }

          return () => {
            const index = listeners.indexOf(cb)

            if (index < 0) {
              return
            }
            listeners.splice(index, 1)
          }
        },

        replaceReducer (nextReducer) {
          if (!isFunction(nextReducer)) {
            throw new Error('Expected the nextReducer to be a function.')
          }
        }
      }

      return self
    }

    const mockStoreWithMiddleware = applyMiddleware(
      ...middlewares
    )(mockStoreWithoutMiddleware)

    return mockStoreWithMiddleware()
  }
}

export default configureStore
