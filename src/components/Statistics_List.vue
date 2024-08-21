<script setup>
// Copyright (C) 2024 Maxim [maxirmx] Samsonov  (www.sw.consulting)
// All rights reserved.
// This file is a part of Dkg Frontend applcation
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

import { storeToRefs } from 'pinia'
import { useStatisticsStore } from '@/stores/statistics.store.js'

const statisticsStore = useStatisticsStore()
const { statistics, statisticsU } = storeToRefs(statisticsStore)
statisticsStore.getStatistics()

import { useAlertStore } from '@/stores/alert.store.js'
const alertStore = useAlertStore()
const { alert } = storeToRefs(alertStore)


const headers = [
  { title: 'Function', align: 'center', key: 'name' },
  { title: 'Number of calls', align: 'center', key: 'count' },
  { title: 'Avg. elapsed time (ms)', align: 'center', key: 'timePerCall' }
]


let intervalId = null
let isUpdating = false

onMounted(() => {
  intervalId = setInterval(async () => {
    if (isUpdating) {
        return
    }

    isUpdating = true
    await statisticsStore.getStatisticsU()
    if (!statisticsU?.loading && !statisticsU?.error) {
      statistics.value = statistics.value.map(stat => {
        const updatedStat = statisticsU.value.find(item => item.name === stat.name)
        return updatedStat ? { ...stat, count: updatedStat.count, timePerCall: updatedStat.timePerCall } : stat
      })
    }
    isUpdating = false
  }, 10000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})

</script>

<template>
  <div class="settings table-3">
    <h1 class="orange">Node controller statistics</h1>
    <hr class="hr" />

    <v-card>
      <v-data-table
        v-if="statistics?.length"
        :headers="headers"
        :items="statistics"
        item-value="name"
        class="elevation-1"
      >
      <template v-slot:[`item.timePerCall`]="{ item }">
            {{ item.timePerCall.toFixed(2) }}
        </template>
      </v-data-table>
      <div v-if="!statistics?.length" class="text-center m-5">No data</div>
    </v-card>
    <div v-if="statistics?.loading" class="text-center m-5">
      <span class="spinner-border spinner-border-lg align-center"></span>
    </div>
    <div v-if="statistics?.error" class="text-center m-5">
      <div class="text-danger">Failed to load data: {{ statistics.error }}</div>
    </div>
    <div v-if="alert" class="alert alert-dismissable mt-3 mb-0" :class="alert.type">
      <button @click="alertStore.clear()" class="btn btn-link close">×</button>
      {{ alert.message }}
    </div>
  </div>
</template>
