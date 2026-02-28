<template>
  <div class="menu-wrapper">
    <div class="menu-card">

      <!-- HEADER -->
      <div class="header">
        <h2>Today's Menu</h2>
        <p class="date">{{ today }}</p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="state-text">
        Loading menu...
      </div>

      <!-- No Data -->
      <div v-else-if="!menu" class="state-text error">
        No Menu Available Today
      </div>

      <!-- Menu Content -->
      <div v-else>

        <div class="meal-type">
          {{ menu.type }}
        </div>

        <div class="time">
          ⏰ {{ menu.start_time }} - {{ menu.end_time }}
        </div>

        <div class="items">
          <div 
            class="item-card"
            v-for="(item, index) in menu.items"
            :key="index"
          >
            {{ item }}
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
// import { getMyVisitsApi } from '@/services/api'

const today = ref('')
const menu = ref(null)
const loading = ref(true)


onMounted(async () => {
  try {
    // const response = await getMyVisitsApi({ my_visits})
    menu.value = response.data
  } catch (err) {
    console.error(err)
  }
})
</script>

<style scoped>

.menu-wrapper {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.menu-card {
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 12px 35px rgba(0,0,0,0.35);
}

.header {
  text-align: center;
  margin-bottom: 18px;
}

.header h2 {
  margin: 0;
  color: #0f172a;
  font-size: 22px;
}

.date {
  font-size: 14px;
  color: #64748b;
  margin-top: 5px;
}

.no-menu {
  text-align: center;
  color: #ef4444;
  font-weight: 600;
  margin-top: 20px;
}

.meal-type {
  text-align: center;
  background: #2563eb;
  color: white;
  padding: 10px;
  border-radius: 12px;
  font-weight: bold;
  margin-bottom: 10px;
}

.time {
  text-align: center;
  font-size: 14px;
  color: #475569;
  margin-bottom: 20px;
}

.items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-card {
  background: #f1f5f9;
  padding: 14px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  transition: 0.3s;
  cursor: pointer;
}

.item-card:hover {
  background: #e2e8f0;
  transform: translateY(-2px);
}

/* Mobile Optimization */
@media (max-width: 480px) {
  .menu-card {
    padding: 18px;
  }

  .header h2 {
    font-size: 20px;
  }

  .item-card {
    font-size: 14px;
  }
}

</style>