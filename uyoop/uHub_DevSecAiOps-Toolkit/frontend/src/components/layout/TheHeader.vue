<script setup lang="ts">
import { useUIStore } from '@/stores/ui'
import { Menu, User, Bell, Search } from 'lucide-vue-next'

const uiStore = useUIStore()
</script>

<template>
  <header class="header metallic-border-bottom">
    <div class="header-left">
      <button 
        class="menu-btn md:hidden"
        @click="uiStore.toggleSidebar()"
      >
        <Menu />
      </button>
      <div class="header-brand">
         <span class="brand-text">DevSecAiOps ToolKit</span>
      </div>
    </div>

    <div class="header-right">
       <!-- Search Trigger -->
       <button 
        class="search-trigger metallic-border hide-mobile"
        @click="uiStore.openSearch()"
        title="Search (Cmd+K)"
       >
          <div class="search-icon-wrapper">
             <Search class="w-4 h-4 text-black" />
          </div>
          <span class="search-text">Search...</span>
          <kbd class="shortcut">⌘K</kbd>
       </button>
       
       <button class="icon-btn metallic-border" title="Notifications">
        <Bell class="w-5 h-5" />
      </button>
      <div class="user-profile metallic-border">
        <div class="avatar">
          <User class="w-5 h-5" />
        </div>
        <span class="username hide-mobile">Admin User</span>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  height: var(--header-height);
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 0;
  position: sticky;
  top: 0;
  z-index: 30;
  background: #0f0f0f; /* Darker than sidebar (#0a0a0a) but distinct? Actually #0f0f0f is lighter. Let's try #050505 or just standard dark grey */
  background: #111111; /* Dark grey, consistent with "not blue" */
  /* border-bottom handled by metallic-border-bottom */
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.menu-btn {
  background: transparent;
  border: none;
  color: var(--c-text-main);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--radius-md);
}

.menu-btn:hover {
  background: rgba(255,255,255,0.1);
}

.header-brand {
    display: flex;
    flex-direction: column;
    justify-content: center;
    line-height: 1.1;
}

.brand-text {
  font-size: 1.2rem; /* Balanced size */
  font-weight: 700;
  color: white;
  line-height: 1;
  text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
  letter-spacing: 0.5px;
}

.brand-sub {
    font-size: 0.7rem;
    color: var(--c-primary);
    opacity: 0.9;
    letter-spacing: 0.5px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-btn {
  background: rgba(0,0,0,0.5);
  border: none; /* Handled by metallic class */
  color: var(--c-text-muted);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: color var(--trans-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  color: var(--c-text-main);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.25rem;
  padding-right: 1rem;
  border-radius: 2rem;
  background: rgba(0,0,0,0.5);
  cursor: pointer;
  transition: background var(--trans-fast);
}

.user-profile:hover {
  background: rgba(255,255,255,0.05);
}

.avatar {
  width: 32px;
  height: 32px;
  background: var(--c-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: black;
  font-weight: bold;
}

.username {
  font-size: 0.9rem;
  font-weight: 500;
}

/* Search Trigger Styles */
.search-trigger {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.25rem 1rem 0.25rem 0.25rem; /* Match user-profile padding structure */
    background: rgba(0,0,0,0.5);
    border-radius: 2rem; /* Rounded full like user profile */
    border: 1px solid rgba(255,255,255,0.1);
    color: var(--c-text-muted);
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.2s;
    margin-right: 0.5rem;
}

.search-trigger:hover {
    background: rgba(255,255,255,0.05);
    border-color: rgba(255,255,255,0.2);
    color: white;
}

.search-icon-wrapper {
    width: 32px;
    height: 32px;
    background: var(--c-primary);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: black;
}

.search-text {
    opacity: 0.8;
    font-weight: 500;
}


.shortcut {
    background: rgba(255,255,255,0.1);
    padding: 2px 4px;
    border-radius: 3px;
    font-size: 0.7rem;
    font-family: inherit;
    color: #aaa;
}

/* Utilities */
.text-muted {
    opacity: 0.6;
}

@media (min-width: 768px) {
  .md\:hidden { display: none; }
}
.hide-mobile {
    display: none;
}
@media (min-width: 640px) {
    .hide-mobile {
        display: flex;
    }
}
</style>
