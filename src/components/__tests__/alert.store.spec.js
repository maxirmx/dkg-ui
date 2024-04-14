// Copyright (C) 2023-2024 Maxim [maxirmx] Samsonov  (www.sw.consulting)
// All rights reserved.
// This file is a part of Dkg Frontend applcation
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

import { it, describe, expect, beforeEach } from 'vitest'
import { useAlertStore } from '@/stores/alert.store'
import { createPinia } from 'pinia'

describe('alert.store.js', () => {
  let store

  beforeEach(() => {
    const pinia = createPinia()
    store = useAlertStore(pinia)
  })

  it('initializes with a null alert', () => {
    expect(store.alert).toBeNull()
  })

  it('sets a success alert', () => {
    store.success('Success message')
    expect(store.alert).toEqual({ message: 'Success message', type: 'alert-success' })
  })

  it('sets an error alert', () => {
    store.error('Error message')
    expect(store.alert).toEqual({ message: 'Error message', type: 'alert-danger' })
  })

  it('clears the alert', () => {
    store.success('Success message')
    store.clear()
    expect(store.alert).toBeNull()
  })
})