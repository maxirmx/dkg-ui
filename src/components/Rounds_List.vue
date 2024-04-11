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

import moment from 'moment'

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
  { title: 'Status', align: 'center', key: 'status.name', sortable: true },
  { title: 'Created', align: 'center', key: 'createdOn', sortable: true },
  { title: 'Modified', align: 'center', key: 'modifiedOn', sortable: true },
  { title: '', align: 'center', key: 'actionNext', sortable: false, width: '5%' },
  { title: '', align: 'center', key: 'actionCancel', sortable: false, width: '5%' }
]

function filterRounds(value, query, item) {
  if (query == null || item == null) {
    return false
  }

  const i = item.raw
  if (i == null) {
    return false
  }

  const q = query.toLocaleUpperCase()

  if (
    i.id.toString().indexOf(q) !== -1 ||
    i.status.name.toLocaleUpperCase().indexOf(q) !== -1 ||
    formatDate(i.createdOn).toLocaleUpperCase().indexOf(q) !== -1 ||
    formatDate(i.modifiedOn).toLocaleUpperCase().indexOf(q) !== -1
  ) {
    return true
  }

  return false
}

function formatDate(date) {
  let dateObj = moment.utc(date)
  return dateObj.local().format('lll Z')
}

async function newRound() {
  roundsStore.add()
  .then(() => {
        roundsStore.getAll()
      })
      .catch((error) => {
        alertStore.error(error)
      })
}

async function cancelRound(id) {
  roundsStore.cancel(id)
  .then(() => {
        roundsStore.getAll()
      })
      .catch((error) => {
        alertStore.error(error)
      })
}

async function nextRoundStep(id) {
  roundsStore.next(id)
  .then(() => {
        roundsStore.getAll()
      })
      .catch((error) => {
        alertStore.error(error)
      })
}

</script>

<template>
  <div class="settings table-2">
    <h1 class="orange">Rounds</h1>
    <hr class="hr" />

    <div class="link-crt">
      <a class="link" @click="newRound">
        <font-awesome-icon size="1x" icon="fa-solid fa-plus" class="link" />
        New round
      </a>
      </div>

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
        :custom-filter="filterRounds"
        item-value="id"
        class="elevation-1"
      >
      <template v-slot:[`item.createdOn`]="{ item }">
          {{ formatDate(item['createdOn']) }}
        </template>

        <template v-slot:[`item.modifiedOn`]="{ item }">
          {{ formatDate(item['modifiedOn']) }}
        </template>

        <template v-slot:[`item.actionNext`]="{ item }">
          <button @click="nextRoundStep(item['id'])" class="anti-btn" v-if="item['isVersatile']">
            <font-awesome-icon size="1x" :icon= "'fa-solid ' + item['nextStatus'].actionIcon" class="anti-btn" />
          </button>
          <v-tooltip v-if="item['isVersatile']"
              activator="parent"
            >{{ item['nextStatus'].actionName }}</v-tooltip>
        </template>

        <template v-slot:[`item.actionCancel`]="{ item }">
          <button @click="cancelRound(item['id'])" class="anti-btn" v-if="item['isVersatile']">
            <font-awesome-icon size="1x" :icon= "'fa-solid ' + item['cancelStatus'].actionIcon" class="anti-btn" />
            <v-tooltip v-if="item['isVersatile']"
              activator="parent"
            >{{ item['cancelStatus'].actionName }}</v-tooltip>
          </button>
        </template>
      </v-data-table>
      <v-spacer></v-spacer>
      <div v-if="!rounds?.length" class="text-center m-5">No rounds</div>
      <div v-if="rounds?.length">
        <v-text-field
          v-model="authStore.rounds_search"
          :append-inner-icon="mdiMagnify"
          label="Search any round information"
          variant="solo"
          hide-details
        />
      </div>

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
