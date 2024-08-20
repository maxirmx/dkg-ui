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
import { watch } from 'vue'

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

let isUpdating = false

const updatePeriodically = async () => {
  if (isUpdating) {
    return;
  }

  isUpdating = true

  try {
    await nodesStore.fetchFrame({
      page: authStore.nodesPage,
      itemsPerPage: nodesStore.nodesPerPage,
      sortBy: nodesStore.nodesSortBy,
      search: nodesStore.nodesSearch,
    });

  }
  catch (error) {
  }
  finally {
    isUpdating = false;
  }
};

watch(
      () => [
        nodesStore.nodesPage,
        nodesStore.nodesPerPage,
        nodesStore.nodesSortBy,
        nodesStore.nodesSearch,
      ],
      () => { updatePeriodically(); },
      { immediate: true }
    );

let intervalId = null

onMounted(() => {
  intervalId = setInterval(updatePeriodically, 1000);
});

onUnmounted(() => {
  clearInterval(intervalId);
});


import { useConfirm } from 'vuetify-use-dialog'
const confirm = useConfirm()

const headers = [
  { title: 'Id', align: 'center', key: 'id', sortable: true },
  { title: 'Name', align: 'center', key: 'name', sortable: true },
  { title: 'Address', align: 'center', key: 'address', sortable: true },
  { title: 'Round', align: 'center', key: 'roundId', sortable: true },
  { title: 'Status', align: 'center', key: 'status.name', sortable: true },
  { title: '', align: 'center', key: 'actions1', sortable: false, width: '5%' }
]

async function resetNode(item) {
  const content = 'Do you want to reset "' + item.name + '" ? ' +
                  'Please note that it will unregister the node from current rounds ' +
                  'but won\'t prevent from applying to future rounds.'
  const result = await confirm({
    title: 'Confirmation',
    confirmationText: 'Reset',
    cancellationText: 'Do not reset',
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
      .reset(item.id)
      .then(() => {
        updateDataGrid()
      })
      .catch((error) => {
        alertStore.error(error)
      })
  }
}

function formatRound(roundId) {
  if (roundId == null) {
    return '--'
  }
  return roundId.toString()
}


</script>

<template>
  <div class="settings table-2">
    <h1 class="orange">Nodes</h1>
    <hr class="hr" />

    <v-card>
      <v-data-table-server
        v-model:items-per-page="nodesStore.nodesPerPage"
        items-per-page-text="Nodes per page"
        page-text="{0}-{1} of {2}"
        :page="nodesStore.nodesPage"
        :items-per-page-options="itemsPerPageOptions"
        :headers="headers"
        :items="nodesStore.nodesF"
        :itemsLength="nodesStore.totalNodes"
        :search="nodesStore.nodesSearch"
        v-model:sort-by="nodesStore.nodesSortBy"
        item-value="id"
        class="elevation-1"
        @update:options="nodesStore.fetchNodes"
      >
      <template v-slot:[`item.roundId`]="{ item }">
        {{ formatRound(item['roundId']) }}
      </template>

      <template v-slot:[`item.actions1`]="{ item }">
          <button @click="resetNode(item)" class="anti-btn" v-if="authStore.user?.isAdmin">
            <font-awesome-icon size="1x" icon="fa-solid fa-xmark" />
          </button>
          <v-tooltip activator="parent">Reset</v-tooltip>

        </template>
      </v-data-table-server>
      <v-spacer></v-spacer>
      <div v-if="!nodesStore.nodesF?.length" class="text-center m-5">No nodes</div>
      <div v-if="nodesStore.totalNodes">
        <v-text-field
          v-model="nodesStore.nodesSearch"
          :append-inner-icon="mdiMagnify"
          label="Search any node information"
          variant="solo"
          hide-details
        />
      </div>
    </v-card>
    <div v-if="nodesStore.nodesF?.error" class="text-center m-5">
      <div class="text-danger">Failed to load nodes list: {{ nodes.error }}</div>
    </div>
    <div v-if="nodesStore.nodesF?.loading" class="text-center m-5">
      <span class="spinner-border spinner-border-lg align-center"></span>
    </div>
    <div v-if="alert" class="alert alert-dismissable mt-3 mb-0" :class="alert.type">
      <button @click="alertStore.clear()" class="btn btn-link close">×</button>
      {{ alert.message }}
    </div>
  </div>
</template>
