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

import { storeToRefs } from 'pinia'
import { useNodesStore } from '@/stores/nodes.store.js'
import { itemsPerPageOptions } from '@/helpers/items.per.page.js'
import { mdiMagnify } from '@mdi/js'

import { useAlertStore } from '@/stores/alert.store.js'
import { useAuthStore } from '@/stores/auth.store.js'

const alertStore = useAlertStore()
const { alert } = storeToRefs(alertStore)

const authStore = useAuthStore()

const nodesStore = useNodesStore()
const { nodes, nodesU } = storeToRefs(nodesStore)
nodesStore.getAll()

import { useConfirm } from 'vuetify-use-dialog'
const confirm = useConfirm()

const headers = [
  { title: 'Id', align: 'center', key: 'id', sortable: true },
  { title: 'Name', align: 'center', key: 'name', sortable: true },
  { title: 'Host', align: 'center', key: 'host', sortable: true },
  { title: 'Port', align: 'center', key: 'port', sortable: true },
  { title: 'Last round', align: 'center', key: 'roundId', sortable: true },
  { title: '', align: 'center', key: 'actions1', sortable: false, width: '5%' }
]

async function deleteNode(item) {
  const content = 'Do you want to delete information about "' + item.name + '" ? ' +
                  'Please note that it won\'t unregister it from current rounds ' +
                  'or prevent from applying to future rounds.'
  const result = await confirm({
    title: 'Confirmation',
    confirmationText: 'Delete',
    cancellationText: 'Do not delete',
    dialogProps: {
      width: '30%',
      minWidth: '250px'
    },
    confirmationButtonProps: {
      color: 'orange-darken-3'
    },
    content: content
  })

  if (result) {
    nodesStore
      .delete(item.id)
      .then(() => {
        updateDataGrid()
      })
      .catch((error) => {
        alertStore.error(error)
      })
  }
}


function filterNodes(value, query, item) {
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
    i.name.toLocaleUpperCase().indexOf(q) !== -1 ||
    i.host.toLocaleUpperCase().indexOf(q) !== -1 ||
    i.port.toString().indexOf(q) !== -1 ||
    (i.round_id != null && i.round_id.toString().indexOf(q) !== -1)
  ) {
    return true
  }

  return false
}

let isUpdating = false

const updateDataGrid = async () => {
  if (isUpdating) {
    return
  }

  isUpdating = true
  try {
    await nodesStore.getAllU()
    if (!nodesU?.loading && !nodesU?.loading)
    {
      const oldData = [...nodes.value]
      const newItems = []

      for (const newItem of nodesU.value) {
        const oldItem = nodes.value.find(item => item.id === newItem.id)
        if (oldItem) {
          if (JSON.stringify(oldItem) !== JSON.stringify(newItem)) {
            Object.assign(oldItem, newItem)
          }
        }
        else {
          newItems.push(newItem)
        }
      }
      rounds.value.unshift(...newItems)

      for (const oldItem of oldData) {
        const newItem = nodesU.value.find(item => item.id === oldItem.id)
        if (!newItem) {
          const index = nodes.value.indexOf(oldItem)
          nodes.value.splice(index, 1)
        }
      }
    }
  }
  catch {
    alertStore.error('Failed to update nodes list')
  }
  finally {
    isUpdating = false
  }
}

let intervalId = null

onMounted(() => {
  intervalId = setInterval(() => {
    updateDataGrid()
  }, 10000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})

</script>

<template>
  <div class="settings table-2">
    <h1 class="orange">Nodes</h1>
    <hr class="hr" />

    <v-card>
      <v-data-table
        v-if="nodes?.length"
        v-model:items-per-page="authStore.nodes_per_page"
        items-per-page-text="Nodes per page"
        page-text="{0}-{1} of {2}"
        v-model:page="authStore.nodes_page"
        :items-per-page-options="itemsPerPageOptions"
        :headers="headers"
        :items="nodes"
        :search="authStore.nodes_search"
        v-model:sort-by="authStore.nodes_sort_by"
        :custom-filter="filterNodes"
        item-value="id"
        class="elevation-1"
      >
      <template v-slot:[`item.actions1`]="{ item }">
          <button @click="deleteNode(item)" class="anti-btn" v-if="authStore.user?.isAdmin">
            <font-awesome-icon size="1x" icon="fa-solid fa-trash-can" class="anti-btn" />
          </button>
        </template>
      </v-data-table>
      <v-spacer></v-spacer>
      <div v-if="!nodes?.length" class="text-center m-5">No nodes</div>
      <div v-if="nodes?.length">
        <v-text-field
          v-model="authStore.nodes_search"
          :append-inner-icon="mdiMagnify"
          label="Search any node information"
          variant="solo"
          hide-details
        />
      </div>
    </v-card>
    <div v-if="nodes?.error" class="text-center m-5">
      <div class="text-danger">Failed to load nodes list: {{ nodes.error }}</div>
    </div>
    <div v-if="nodes?.loading" class="text-center m-5">
      <span class="spinner-border spinner-border-lg align-center"></span>
    </div>
    <div v-if="alert" class="alert alert-dismissable mt-3 mb-0" :class="alert.type">
      <button @click="alertStore.clear()" class="btn btn-link close">×</button>
      {{ alert.message }}
    </div>
  </div>
</template>
