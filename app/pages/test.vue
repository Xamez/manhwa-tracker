<script setup lang="ts">
import { invoke } from '~/utils/moka';

const currentPath = ref('');
const items = ref<any[]>([]);
const loading = ref(false);
const error = ref('');

// Charge un dossier (par défaut vide = home)
const loadDir = async (path: string = '') => {
  loading.value = true;
  error.value = '';

  try {
    const res = await invoke('app.directories', { path });

    if (res.error) {
      error.value = res.message;
    } else {
      currentPath.value = res.current;
      items.value = res.items;
    }
  } catch (e: any) {
    error.value = 'Erreur système: ' + e.message;
  } finally {
    loading.value = false;
  }
};

// Navigation rapide
const openItem = (item: any) => {
  if (item.type === 'DIR') {
    loadDir(item.path);
  } else {
    alert(`C'est un fichier : ${item.name}`);
  }
};

// Remonter d'un niveau
const goUp = () => {
  if (!currentPath.value) return;
  // Astuce simple pour trouver le parent sans gérer les séparateurs OS JS
  const parent = currentPath.value.split(/[/\\]/).slice(0, -1).join('/') || '/';
  loadDir(parent);
};

// Charger au montage
onMounted(() => loadDir());
</script>

<template>
  <div class="explorer-card">
    <div class="header">
      <h3>Explorateur Local</h3>

      <!-- Barre d'outils -->
      <div class="toolbar">
        <button @click="goUp" title="Remonter">⬆️</button>
        <button @click="loadDir(currentPath)" title="Actualiser">🔄</button>
        <input
          v-model="currentPath"
          @keyup.enter="loadDir(currentPath)"
          placeholder="/home/user..."
          class="path-input"
        />
        <button @click="loadDir(currentPath)">Go</button>
      </div>
    </div>

    <!-- Zone d'erreur -->
    <div v-if="error" class="error-msg">⚠️ {{ error }}</div>

    <!-- Liste des fichiers -->
    <div class="file-list" :class="{ loading }">
      <div v-if="items.length === 0 && !loading" class="text-[#ccc]">Dossier vide</div>

      <div
        v-for="item in items"
        :key="item.path"
        class="file-item"
        :class="item.type.toLowerCase()"
        @dblclick="openItem(item)"
      >
        <span class="icon">{{ item.icon }}</span>
        <span class="name">{{ item.name }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.explorer-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
  background: white;
  display: flex;
  flex-direction: column;
  height: 400px; /* Hauteur fixe pour scroller */
}

.header {
  padding: 10px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.header h3 {
  margin: 0 0 10px 0;
  font-size: 1rem;
  color: #333;
}

.toolbar {
  display: flex;
  gap: 8px;
}

.path-input {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: monospace;
}

button {
  cursor: pointer;
  padding: 4px 10px;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button:hover {
  background: #eee;
}

.file-list {
  flex: 1;
  overflow-y: auto;
  padding: 5px;
}

.file-list.loading {
  opacity: 0.5;
  pointer-events: none;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 6px;
  cursor: default;
  border-radius: 4px;
}

.file-item:hover {
  background: #eef;
  cursor: pointer;
}
.file-item.dir {
  font-weight: 500;
}

.icon {
  margin-right: 8px;
  width: 20px;
  text-align: center;
}
.name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #333;
}

.error-msg {
  background: #ffebee;
  color: #c62828;
  padding: 10px;
  font-size: 0.9rem;
}
</style>
