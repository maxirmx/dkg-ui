<script setup>
// Copyright (C) 2023-2024 Maxim [maxirmx] Samsonov (www.sw.consulting)
// All rights reserved.
// This file is a part of s-tracker applcation
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions
// are met:
// 1. Redistributions of source code must retain the above copyright
// notice, this list of conditions and the following disclaimer.
// 2. Redistributions in binary form must reproduce the above copyright
// notice, this list of conditions and the following disclaimer in the
// documentation and/or other materials provided with the distribution.
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

import { storeToRefs } from 'pinia'
import { useRoundsStore } from '@/stores/rounds.store.js'
import { itemsPerPageOptions } from '@/helpers/items.per.page.js'
import { mdiMagnify } from '@mdi/js'

import { useAlertStore } from '@/stores/alert.store.js'
import { useAuthStore } from '@/stores/auth.store.js'

const alertStore = useAlertStore()
const { alert } = storeToRefs(alertStore)

const authStore = useAuthStore()

const roundsStore = useRoundsStore()
const { rounds } = storeToRefs(roundsStore)
roundsStore.getAll()

const headers = [
  { title: 'Id', align: 'center', key: 'id', sortable: true },
  { title: 'Status', align: 'center', key: 'status.name', sortable: true }
]
</script>

<template>
  <div class="settings table-1">
    <h1 class="orange">Rounds</h1>
    <hr class="hr" />

    <v-card>
      <v-data-table
        v-if="rounds?.length"
        v-model:items-per-page="authStore.rounds_per_page"
        items-per-page-text="Rounds per page"
        page-text="{0}-{1} of {2}"
        v-model:page="authStore.rounds_page"
        :items-per-page-options="itemsPerPageOptions"
        :headers="headers"
        :items="rounds"
        :search="authStore.rounds_search"
        v-model:sort-by="authStore.rounds_sort_by"
        class="elevation-1"
      >
      </v-data-table>
      <v-spacer></v-spacer>
      <v-text-field
        v-model="authStore.rounds_search"
        :append-inner-icon="mdiMagnify"
        label="Search"
        variant="solo"
        hide-details
      ></v-text-field>
    </v-card>
    <div v-if="rounds?.error" class="text-center m-5">
      <div class="text-danger">Failed to load rounds list: {{ rounds.error }}</div>
    </div>
    <div v-if="rounds?.loading" class="text-center m-5">
      <span class="spinner-border spinner-border-lg align-center"></span>
    </div>
    <div v-if="alert" class="alert alert-dismissable mt-3 mb-0" :class="alert.type">
      <button @click="alertStore.clear()" class="btn btn-link close">×</button>
      {{ alert.message }}
    </div>
  </div>
</template>
