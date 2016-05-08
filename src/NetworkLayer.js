import { Store } from 'react-relay'

class NetworkLayer {
  constructor (model) {
    this.model = model
  }

  async sendMutation (mutationRequest) {
    throw new Error('Mutations are not implemented yet')
  }

  async sendQueries (requests) {
    return Promise.all(requests.map((request) => this._executeRequest(request)))
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
      // As there is no subscriptions support in Relay, we use this
      // https://github.com/facebook/relay/issues/541#issuecomment-213093469
      Store.getStoreData().handleQueryPayload(request.getQuery(), query.get())
    })
    return query.get()
  }

  supports (...options) {

  }
}

export default NetworkLayer
