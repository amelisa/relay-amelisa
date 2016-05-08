import assert from 'assert'
import { Store } from 'amelisa'
import Relay from 'react-relay'
import NetworkLayer from '../src/NetworkLayer'
import createSchema from './createSchema'
import { getStorage, docId, value, sleep } from './util'

let model
let model2
let networkLayer
let graphqlQuery = `
query GetUser($id: String!) {
  user(id: "1") {
    name,
    stories {
      id,
      text
    }
  }
}
`
let relayQuery = Relay.QL`
query GetUser($id: String!) {
  user(id: "1") {
    name,
    stories {
      id,
      text
    }
  }
}
`
let variableValues = {
  id: 1
}

// TODO: research why "Invariant Violation: RelayQL: Unexpected invocation at runtime."
let query = Relay.createQuery(relayQuery, {id: '1'})
let request = {
  getQuery: () => query,
  getQueryString: () => graphqlQuery,
  getVariables: () => variableValues
}

describe('NetworkLayer', () => {
  beforeEach(async () => {
    let storage = await getStorage()
    let store = new Store({storage, createSchema, saveDebounceTimeout: 0})
    await store.init()
    model = store.createModel()
    model2 = store.createModel()
    model.createSchema = createSchema
    networkLayer = new NetworkLayer(model)
  })

  it('should sendQueries and get results', async () => {
    await model.add('stories', {id: docId, text: 'Story 1', userId: docId})
    await model.add('users', {id: docId, name: value})

    let results = await networkLayer.sendQueries([request])

    assert.deepEqual(results, [{user: {name: value, stories: [{id: docId, text: 'Story 1'}]}}])
  })

  it('should sendQueries and get results after data change', async () => {
    await model.add('stories', {id: docId, text: 'Story 1', userId: docId})
    await model.add('users', {id: docId, name: value})

    let results = await networkLayer.sendQueries([request])
    assert.deepEqual(results, [{user: {name: value, stories: [{id: docId, text: 'Story 1'}]}}])

    setTimeout(() => model2.set(['stories', docId, 'text'], 'Story 2'))
    await sleep(200)
    // FIXME: test Relay data change
    results = await networkLayer.sendQueries([request])

    assert.deepEqual(results, [{user: {name: value, stories: [{id: docId, text: 'Story 2'}]}}])
  })
})
