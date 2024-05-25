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

import { onMounted, onUnmounted } from 'vue'
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
const { rounds, roundsU } = storeToRefs(roundsStore)
roundsStore.getAll()

const headers = [
  { title: 'Id', align: 'center', key: 'id', sortable: true },
  { title: 'Status', align: 'center', key: 'status.name', sortable: true },
  { title: 'Result', align: 'center', key: 'result', sortable: false },
  { title: 'Max. nodes', align: 'center', key: 'maxNodes', sortable: false },
  { title: 'Timeouts (s)', align: 'center', key: 'timeouts', sortable: false },
  { title: 'Nodes', align: 'center', key: 'nodeCount', sortable: true },
  { title: 'Running', align: 'center', key: 'nodeCountRunning', sortable: true },
  { title: 'Failed', align: 'center', key: 'nodeCountFailed', sortable: true },
//  { title: 'Timed Out', align: 'center', key: 'nodeCountTimedOut', sortable: true },
  { title: 'Finished', align: 'center', key: 'nodeCountFinished', sortable: true },
  { title: 'Lost', align: 'center', key: 'nodeCountLost', sortable: true },
 { title: 'Created', align: 'center', key: 'createdOn', sortable: true },
//  { title: 'Modified', align: 'center', key: 'modifiedOn', sortable: true },
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
    (i.result != null && i.result.toString().indexOf(q) !== -1) ||
    i.status.name.toLocaleUpperCase().indexOf(q) !== -1 ||
    formatDate(i.createdOn).toLocaleUpperCase().indexOf(q) !== -1
  ) {
    return true
  }

  return false
}

function formatDate(date) {
  let dateObj = moment.utc(date)
  return dateObj.local().format('lll Z')
}

function formatResult(result) {
  if (result == null) {
    return '--'
  }

  let str = result.toString();
  str = str.slice(-6);
  str = str.padStart(6, '0');
  let groups = str.match(/.{1,2}/g);
  let formatted = groups.join(' ');
  return formatted;
}

function formatRunningData(item) {
  let str = '0'
  if (item['isVersatile']) {
    const tt =
    item['nodeCountStepOne'] +
    item['nodeCountWStepTwo'] +
    item['nodeCountStepTwo'] +
    item['nodeCountWStepThree'] +
    item['nodeCountStepThree']
    if (tt > 0)
      str = tt.toString() + '  [ ' +
        '' + item['nodeCountStepOne'].toString() + '⇒' +
        '' + item['nodeCountWStepTwo'].toString() + '⇒' +
        '' + item['nodeCountStepTwo'].toString() + '⇒' +
        '' + item['nodeCountWStepThree'].toString() + '⇒' +
        '' + item['nodeCountStepThree'].toString() + ']'
  }
  return str;
}

function formatLostData(item) {
  let str = '0'
  if (!item['isVersatile']) {
    const tt =
    item['nodeCountStepOne'] +
    item['nodeCountWStepTwo'] +
    item['nodeCountStepTwo'] +
    item['nodeCountWStepThree'] +
    item['nodeCountStepThree']
    if (tt > 0)
      str = tt.toString()
  }
  return str
}

function formatTimeouts(item) {
  console.log(item)
  let tt = item['timeout2'].toString()
  tt = tt + '/' +  item['timeout3'].toString()
  tt = tt + '/' +  item['timeoutR'].toString()
  return tt 
}

async function newRound(maxNodes, timeout2, timeout3, timeoutR) {
  const roundSettings = {
    maxNodes: maxNodes,
    timeout2: timeout2,
    timeout3: timeout3,
    timeoutR: timeoutR
  }
  roundsStore.add(roundSettings)
  .then(() => {
        updateDataGrid()
      })
      .catch((error) => {
        alertStore.error(error)
      })
}

async function cancelRound(id) {
  roundsStore.cancel(id)
  .then(() => {
        updateDataGrid()
      })
      .catch((error) => {
        alertStore.error(error)
      })
}

async function nextRoundStep(id) {
  roundsStore.next(id)
  .then(() => {
        updateDataGrid()
      })
      .catch((error) => {
        alertStore.error(error)
      })
}

let isUpdating = false

const updateDataGrid = async () => {
  if (isUpdating) {
    return
  }

  isUpdating = true
  try {
    await roundsStore.getAllU()
    if (!roundsU?.loading && !roundsU?.loading)
    {
      const oldData = [...rounds.value]
      const newItems = []
      for (const newItem of roundsU.value) {
        const oldItem = rounds.value.find(item => item.id === newItem.id)
        if (oldItem) {
          if (JSON.stringify(oldItem) !== JSON.stringify(newItem)) {
            Object.assign(oldItem, newItem)
          }
        }
        else {
          newItems.push(newItem)
        }
      }
      rounds.value.unshift(...newItems.reverse())
      for (const oldItem of oldData) {
        const newItem = roundsU.value.find(item => item.id === oldItem.id)
        if (!newItem) {
          const index = rounds.value.indexOf(oldItem)
          rounds.value.splice(index, 1)
        }
      }
    }
  }
  catch {
    alertStore.error('Failed to update rounds list')
  }
  finally {
    isUpdating = false
  }
}

let intervalId = null

onMounted(() => {
  intervalId = setInterval(() => {
    updateDataGrid()
  }, 1000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})

function showProceed(item) {
  return (item['isVersatile']  && parseInt(item['nodeCount']) >= 3) ||
          item['statusValue'] == 0
}

function showCancel(item) {
  return (item['isVersatile'] )
}

</script>

<template>
  <div class="settings table-3">
    <h1 class="orange">Rounds</h1>
    <hr class="hr" />

    <div class="link-crt">
      <a class="link" @click="newRound(authStore.max_nodes, authStore.timeout2, authStore.timeout3, authStore.timeoutR)">
        <font-awesome-icon size="1x" icon="fa-solid fa-plus" class="link" />
        New round
      </a>
      <span class="link-ext">
        <span>&nbsp;&nbsp;&nbsp;&nbsp;maximum nodes:&nbsp;</span>
        <input id="maxNodes" type="number" v-model.number="authStore.max_nodes" min="3" class="link-input">
        <span>&nbsp;Generation timeouts (seconds)</span>
        <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;deals:&nbsp;</span>
        <input id="timeout2" type="number" v-model.number="authStore.timeout2" min="3" class="link-input">
        <span>&nbsp;responses:&nbsp;</span>
        <input id="timeout3" type="number" v-model.number="authStore.timeout3" min="3" class="link-input">
        <span>&nbsp;shares:&nbsp;</span>
        <input id="timeoutR" type="number" v-model.number="authStore.timeoutR" min="3" class="link-input">
      </span>
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
        <template v-slot:[`item.timeouts`]="{ item }">
            {{ formatTimeouts(item) }}
        </template>

        <template v-slot:[`item.result`]="{ item }">
            {{ formatResult(item['result']) }}
        </template>

        <template v-slot:[`item.nodeCountRunning`]="{ item }">
          {{ formatRunningData(item) }}
        </template>

        <template v-slot:[`item.nodeCountLost`]="{ item }">
          {{ formatLostData(item) }}
        </template>

        <template v-slot:[`item.createdOn`]="{ item }">
          {{ formatDate(item['createdOn']) }}
        </template>

        <template v-slot:[`item.actionNext`]="{ item }">
          <button @click="nextRoundStep(item['id'])" class="anti-btn" v-if="showProceed(item)">
            <font-awesome-icon size="1x" :icon= "'fa-solid ' + item['nextStatus'].actionIcon" class="anti-btn" />
          </button>
            <v-tooltip v-if="showProceed(item)"
            activator="parent"
          >{{ item['nextStatus'].actionName }}</v-tooltip>
        </template>

        <template v-slot:[`item.actionCancel`]="{ item }">
          <button @click="cancelRound(item['id'])" class="anti-btn" v-if="showCancel(item)">
            <font-awesome-icon size="1x" :icon= "'fa-solid ' + item['cancelStatus'].actionIcon" class="anti-btn" />
            <v-tooltip v-if="showCancel(item)"
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
