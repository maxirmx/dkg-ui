import { it, describe, expect, afterEach, beforeEach } from 'vitest'
import sinon from 'sinon'

import { setActivePinia, createPinia } from 'pinia'

import { fetchWrapper, authHeader, handleResponse } from '@/helpers/fetch.wrapper.js'
import { apiUrl } from '@/helpers/config.js'
import { useAuthStore } from '@/stores/auth.store.js'

describe('handleResponse', () => {
  let sandbox
  let fetchStub

  beforeEach(() => {
    setActivePinia(createPinia())
    sandbox = sinon.createSandbox()
    fetchStub = sandbox.stub(window, 'fetch')
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('should make a GET request', async () => {
    const mockData = { key: 'value' }
    fetchStub.resolves(new Response(JSON.stringify(mockData)))

    const result = await fetchWrapper.get('http://example.com')

    expect(result).to.deep.equal(mockData)
    sinon.assert.calledWith(fetchStub, 'http://example.com', sinon.match.has('method', 'GET'))
  })

  it('should make a POST request', async () => {
    const mockData = { key: 'value' }
    fetchStub.resolves(new Response(JSON.stringify(mockData)))

    const result = await fetchWrapper.post('http://example.com', mockData)

    expect(result).to.deep.equal(mockData)
    sinon.assert.calledWith(fetchStub, 'http://example.com', sinon.match.has('method', 'POST'))
    sinon.assert.calledWith(fetchStub, 'http://example.com', sinon.match.hasNested('headers.Content-Type', 'application/json'))
    sinon.assert.calledWith(fetchStub, 'http://example.com', sinon.match.has('body', JSON.stringify(mockData)))
  })

  it('should make a PUT request', async () => {
    const mockData = { key: 'value' }
    fetchStub.resolves(new Response(JSON.stringify(mockData)))

    const result = await fetchWrapper.put('http://example.com', mockData)

    expect(result).to.deep.equal(mockData)
    sinon.assert.calledWith(fetchStub, 'http://example.com', sinon.match.has('method', 'PUT'))
    sinon.assert.calledWith(fetchStub, 'http://example.com', sinon.match.hasNested('headers.Content-Type', 'application/json'))
    sinon.assert.calledWith(fetchStub, 'http://example.com', sinon.match.has('body', JSON.stringify(mockData)))
  })

  it('should make a DELETE request', async () => {
    const mockData = { key: 'value' }
    fetchStub.resolves(new Response(JSON.stringify(mockData)))

    const result = await fetchWrapper.delete('http://example.com')

    expect(result).to.deep.equal(mockData)
    sinon.assert.calledWith(fetchStub, 'http://example.com', sinon.match.has('method', 'DELETE'))
  })

  it('should return auth header if user is logged in and url starts with base url', () => {
    const authStore = useAuthStore()
    sandbox.stub(authStore, 'user').value({ token: 'dummyToken' })

    const headers = authHeader(`${apiUrl}/dummy`)

    expect(headers).to.deep.equal({ Authorization: 'Bearer dummyToken' })
  })

  it('should return auth header if user is logged in but url does not start with base url', () => {
    const authStore = useAuthStore()
    sandbox.stub(authStore, 'user').value({ token: 'dummyToken' })

    const headers = authHeader('https://example.com/dummy')

    expect(headers).to.deep.equal({})
  })

  it('should return empty header if user is not logged in', () => {
    const authStore = useAuthStore()
    sandbox.stub(authStore, 'user').value(null)

    const headers = authHeader(`${apiUrl}/dummy`)

    expect(headers).to.deep.equal({})
  })

  it('should handle 204 response', async () => {
    const response = new Response(null, { status: 204 })

    const result = await handleResponse(response)

    expect(result).to.be.undefined
  })

  it('should handle successful response', async () => {
    const mockData = { key: 'value' }
    const response = new Response(JSON.stringify(mockData))

    const result = await handleResponse(response)

    expect(result).to.deep.equal(mockData)
  })

  it('should handle error response', async () => {
    const mockData = { message: 'Error message' }
    const response = new Response(JSON.stringify(mockData), { status: 500 })

    const authStore = useAuthStore()
    sandbox.stub(authStore, 'logout')

    try {
      await handleResponse(response)
    } catch (error) {
      expect(error).to.equal(mockData.message)
    }

    expect(authStore.logout.called).to.be.false
  })

  it('should handle 401 response and logout if user is defined', async () => {
    const mockData = { message: 'Unauthorized' }
    const response = new Response(JSON.stringify(mockData), { status: 401 })

    const authStore = useAuthStore()
    authStore.user = "Some fake data"
    sandbox.stub(authStore, 'logout')

    try {
      await handleResponse(response)
    } catch (error) {
      expect(error).to.equal(mockData.message)
    }

    expect(authStore.logout.called).to.be.true
  })

  it('should handle 401 response and not logout if user is undefined', async () => {
    const mockData = { message: 'Unauthorized' }
    const response = new Response(JSON.stringify(mockData), { status: 401 })

    const authStore = useAuthStore()
    sandbox.stub(authStore, 'logout')

    try {
      await handleResponse(response)
    } catch (error) {
      expect(error).to.equal(mockData.message)
    }

    expect(authStore.logout.called).to.be.false
  })

})