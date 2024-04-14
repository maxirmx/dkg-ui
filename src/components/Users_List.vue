<script setup>
// Copyright (C) 2023-2024 Maxim [maxirmx] Samsonov  (www.sw.consulting)
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

import router from '@/router'

import { storeToRefs } from 'pinia'
import { useUsersStore } from '@/stores/users.store.js'
import { itemsPerPageOptions } from '@/helpers/items.per.page.js'
import { mdiMagnify } from '@mdi/js'

import { useAuthStore } from '@/stores/auth.store.js'
const authStore = useAuthStore()

const usersStore = useUsersStore()
const { users } = storeToRefs(usersStore)
usersStore.getAll()

import { useAlertStore } from '@/stores/alert.store.js'
const alertStore = useAlertStore()
const { alert } = storeToRefs(alertStore)

import { useConfirm } from 'vuetify-use-dialog'
const confirm = useConfirm()

function userSettings(item) {
  var id = item.id
  router.push('user/edit/' + id)
}

function getRoles(item) {
  let crd = null
  if (item) {
    crd = ''
    if (item.isAdmin) {
      crd = 'Admin'
    }
  }
  return crd
}

function filterUsers(value, query, item) {
  if (query == null || item == null) {
    return false
  }
  const i = item.raw
  if (i == null) {
    return false
  }
  const q = query.toLocaleUpperCase()

  if (
    i.name.toLocaleUpperCase().indexOf(q) !== -1 ||
    i.email.toLocaleUpperCase().indexOf(q) !== -1
  ) {
    return true
  }

  const crd = getRoles(i)
  if (crd.toLocaleUpperCase().indexOf(q) !== -1) {
    return true
  }
  return false
}

async function deleteUser(item) {
  const content = 'Do you want to delete "' + item.name + '" ?'
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
    usersStore
      .delete(item.id)
      .then(() => {
        usersStore.getAll()
      })
      .catch((error) => {
        alertStore.error(error)
      })
  }
}

const headers = [
  { title: 'User', align: 'start', key: 'id' },
  { title: 'E-mail', align: 'start', key: 'email' },
  { title: 'Roles', align: 'start', key: 'roles', sortable: false },
  { title: '', align: 'center', key: 'actions1', sortable: false, width: '5%' },
  { title: '', align: 'center', key: 'actions2', sortable: false, width: '5%' }
]
</script>

<template>
  <div class="settings table-2">
    <h1 class="orange">Users</h1>
    <hr class="hr" />

    <div class="link-crt">
      <router-link to="/register" class="link"
        ><font-awesome-icon
          size="1x"
          icon="fa-solid fa-user-plus"
          class="link"
        />&nbsp;&nbsp;&nbsp;Create new user
      </router-link>
    </div>

    <v-card>
      <v-data-table
        v-if="users?.length"
        v-model:items-per-page="authStore.users_per_page"
        items-per-page-text="Users per page"
        :items-per-page-options="itemsPerPageOptions"
        page-text="{0}-{1} из {2}"
        v-model:page="authStore.users_page"
        :headers="headers"
        :items="users"
        :search="authStore.users_search"
        v-model:sort-by="authStore.users_sort_by"
        :custom-filter="filterUsers"
        item-value="name"
        class="elevation-1"
      >
        <template v-slot:[`item.id`]="{ item }">
          {{ item['name'] }}
        </template>

        <template v-slot:[`item.roles`]="{ item }">
          <span v-html="getRoles(item)"></span>
        </template>

        <template v-slot:[`item.actions1`]="{ item }">
          <button @click="userSettings(item)" class="anti-btn">
            <font-awesome-icon size="1x" icon="fa-solid fa-pen" class="anti-btn" />
          </button>
        </template>
        <template v-slot:[`item.actions2`]="{ item }">
          <button @click="deleteUser(item)" class="anti-btn">
            <font-awesome-icon size="1x" icon="fa-solid fa-trash-can" class="anti-btn" />
          </button>
        </template>
      </v-data-table>
      <div v-if="!users?.length" class="text-center m-5">No users</div>
      <div v-if="users?.length">
        <v-text-field
          v-model="authStore.users_search"
          :append-inner-icon="mdiMagnify"
          label="Search any user information"
          variant="solo"
          hide-details
        />
      </div>
    </v-card>
    <div v-if="users?.loading" class="text-center m-5">
      <span class="spinner-border spinner-border-lg align-center"></span>
    </div>
    <div v-if="users?.error" class="text-center m-5">
      <div class="text-danger">Failed to load user list: {{ users.error }}</div>
    </div>
    <div v-if="alert" class="alert alert-dismissable mt-3 mb-0" :class="alert.type">
      <button @click="alertStore.clear()" class="btn btn-link close">×</button>
      {{ alert.message }}
    </div>
  </div>
</template>
