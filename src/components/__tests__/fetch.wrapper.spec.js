import { it, describe, expect, afterEach, beforeEach } from 'vitest'
import sinon from 'sinon';

import { setActivePinia, createPinia } from 'pinia'

import { handleResponse } from '@/helpers/fetch.wrapper.js';
import { useAuthStore } from '@/stores/auth.store.js';

describe('handleResponse', () => {
  let sandbox;

  beforeEach(() => {
    setActivePinia(createPinia())
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should handle 204 response', async () => {
    const response = new Response(null, { status: 204 });

    const result = await handleResponse(response);

    expect(result).to.be.undefined;
  });

  it('should handle successful response', async () => {
    const mockData = { key: 'value' };
    const response = new Response(JSON.stringify(mockData));

    const result = await handleResponse(response);

    expect(result).to.deep.equal(mockData);
  });

  it('should handle error response', async () => {
    const mockData = { message: 'Error message' };
    const response = new Response(JSON.stringify(mockData), { status: 500 });

    const authStore = useAuthStore();
    sandbox.stub(authStore, 'logout');

    try {
      await handleResponse(response);
    } catch (error) {
      expect(error).to.equal(mockData.message);
    }

    expect(authStore.logout.called).to.be.false;
  });

  it('should handle 401 response and logout if user is defined', async () => {
    const mockData = { message: 'Unauthorized' };
    const response = new Response(JSON.stringify(mockData), { status: 401 });

    const authStore = useAuthStore();
    authStore.user = "Some fake data"
    sandbox.stub(authStore, 'logout');

    try {
      await handleResponse(response);
    } catch (error) {
      expect(error).to.equal(mockData.message);
    }

    expect(authStore.logout.called).to.be.true;
  });

  it('should handle 401 response and not logout if user is undefined', async () => {
    const mockData = { message: 'Unauthorized' };
    const response = new Response(JSON.stringify(mockData), { status: 401 });

    const authStore = useAuthStore();
    sandbox.stub(authStore, 'logout');

    try {
      await handleResponse(response);
    } catch (error) {
      expect(error).to.equal(mockData.message);
    }

    expect(authStore.logout.called).to.be.false;
  });

});