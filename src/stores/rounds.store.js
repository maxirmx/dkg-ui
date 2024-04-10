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

const baseUrl = `${apiUrl}/rounds`

export const useRoundsStore = defineStore({
  id: 'rounds',
  state: () => ({
    rounds: {},
    round: {}
  }),
  actions: {
    async add(round) {
      await fetchWrapper.post(`${baseUrl}/add`, round)
    },
    async getAll() {
      this.rounds = { loading: true }
      try {
        const url = baseUrl
        this.rounds = await fetchWrapper.get(url)
      } catch (error) {
        this.rounds = { error }
      }
    },
    async get(id) {
      this.round = { loading: true }
      try {
        this.round = await fetchWrapper.get(`${baseUrl}/${id}`)
      } catch (error) {
        this.round = { error }
      }
    },
    async update(id, params) {
      await fetchWrapper.put(`${baseUrl}/${id}`, params)
    }
  }
})
