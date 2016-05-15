// import Relay, { Store } from 'react-relay'

class NetworkLayer {
  constructor (model) {
    if (!model) throw new Error('Model is mandatory in new NetworkLayer(model)')
    this.model = model
  }

  async sendMutation (mutationRequest) {
    throw new Error('Mutations are not implemented yet')
  }

  async sendQueries (requests) {
    return Promise.all(requests.map((request) => {
      return this
        ._executeRequest(request)
        .then((response) => request.resolve({response}))
        .catch((err) => request.reject(err))
    }))
  }

  async _executeRequest (request) {
    let graphqlQuery = request.getQueryString()
    let variableValues = request.getVariables()
    let queryOptions = {
      variableValues
    }

    let query = this.model.query(graphqlQuery, queryOptions)
    await query.subscribe()

    query.on('change', () => {
      // There is no official subscriptions support in Relay
      // https://github.com/facebook/relay/issues/541#issuecomment-213093469
    })

    return query.get()
  }

  supports (...options) {
    // Does not support the only defined option, 'defer'
    return false
  }
}

export default NetworkLayer
