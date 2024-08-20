// Copyright (C) 2023-2024 Maxim [maxirmx] Samsonov  (www.sw.consulting)
// All rights reserved.
// This file is a part of b-tracker applcation
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions
// are met:
// 1. Redistributions of source code must retain the above copyright
//    notice, this list of conditions and the following disclaimer.
// 2. Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in the
//    documentation and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// ``AS IS'' AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
// TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
// PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDERS OR CONTRIBUTORS
// BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
// SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
// CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
// ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE.

import { defineStore } from 'pinia'
import { fetchWrapper } from '@/helpers/fetch.wrapper.js'
import { apiUrl } from '@/helpers/config.js'

const baseUrl = `${apiUrl}/nodes`

export const useNodesStore = defineStore({
  id: 'nodes',
  state: () => ({
    nodes: {},
    nodesF: [ ],
    nodesU: {},
    node: {},
    totalNodes: 0,
    nodesPerPage: 10,
    nodesSearch: '',
    nodesSortBy: [ { key: 'id', order: 'desc' } ],
    nodesPage: 1,
  }),
  actions: {
   async fetchFrame({ page, itemsPerPage, sortBy, sortDesc, search }) {
      const request = {
        page,
        itemsPerPage,
        sortBy,
        sortDesc,
        search,
      };
      try {
        const response = await fetchWrapper.post(`${baseUrl}/fetch`, request)
        this.nodesF = response.nodesFrame
        this.totalNodes = response.totalNodes
        } catch (error) {
        this.nodesF = { error }
      }
    },
    async getAll() {
      this.nodes = { loading: true }
      try {
        const url = baseUrl
        this.nodes = await fetchWrapper.get(url)
      } catch (error) {
        this.nodes = { error }
      }
    },
    async getAllU() {
      this.nodesU = { loading: true }
      try {
        const url = baseUrl
        this.nodesU = await fetchWrapper.get(url)
      } catch (error) {
        this.nodesU = { error }
      }
    },
    async get(id) {
      this.node = { loading: true }
      try {
        this.node = await fetchWrapper.get(`${baseUrl}/${id}`)
      } catch (error) {
        this.node = { error }
      }
    },
    async delete(id) {
      await fetchWrapper.delete(`${baseUrl}/${id}`)
    },
    async reset(id) {
      await fetchWrapper.post(`${baseUrl}/reset/${id}`)
    }
  }
})
