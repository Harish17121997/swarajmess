<template>
  <div class="menu-wrapper">
    <div class="menu-card">

      <!-- Welcome Header -->
      <div class="header">
        <h1>Welcome to <span class="mess-name">{{ messName }} </span></h1>
        <p class="subtitle">Your meals for today</p>
        <p class="date">{{ today }}</p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="state-text">
        🔄 Loading today's menu...
      </div>

      <!-- No Menu -->
      <div v-else-if="!groupedMeals.breakfast.length && !groupedMeals.lunch.length && !groupedMeals.dinner.length" class="state-text error">
        🚫 No Menu Available Today
      </div>

      <!-- Menu Sections -->
      <div v-else>
        <!-- Breakfast -->
        <div v-if="groupedMeals.breakfast?.length" class="meal-section breakfast">
          <div class="meal-title">
            <span class="meal-badge">🍳</span> Breakfast (7 AM - 10 AM)
          </div>
          <div class="items">
            <div class="item-card" v-for="item in groupedMeals.breakfast" :key="item.id">
              {{ item.meal_name }}
            </div>
          </div>
        </div>

        <!-- Lunch -->
        <div v-if="groupedMeals.lunch?.length" class="meal-section lunch">
          <div class="meal-title">
            <span class="meal-badge">🍛</span> Lunch (12 PM - 3 PM)
          </div>
          <div class="items">
            <div class="item-card" v-for="item in groupedMeals.lunch" :key="item.id">
              {{ item.meal_name }}
            </div>
          </div>
        </div>

        <!-- Dinner -->
        <div v-if="groupedMeals.dinner?.length" class="meal-section dinner">
          <div class="meal-title">
            <span class="meal-badge">🌙</span> Dinner (6 PM - 10 PM)
          </div>
          <div class="items">
            <div class="item-card" v-for="item in groupedMeals.dinner" :key="item.id">
              {{ item.meal_name }}
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getCustomerMealsApi } from '@/services/api'

const meals = ref([])
const loading = ref(true)
const messName = ref('')
const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })

onMounted(async () => {
  try {
    const params = new URLSearchParams(window.location.search)
    const userId = params.get('user_id')
    if (!userId) {
      loading.value = false
      return
    }
    const response = await getCustomerMealsApi(userId)
    console.log(response)
    meals.value = response.data?.meals || []
    messName.value = response.data?.user_name
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})

const groupedMeals = computed(() => ({
  breakfast: meals.value?.filter(m => m.meal_flag === 0),
  lunch: meals.value?.filter(m => m.meal_flag === 1),
  dinner: meals.value?.filter(m => m.meal_flag === 2)
}))
</script>

<style scoped>
.mess-name{
  text-transform: capitalize;
}
/* Page background */
.menu-wrapper {
  min-height: 100vh;
  background: linear-gradient(135deg, #fbc2eb, #a18cd1, #667eea);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  font-family: 'Poppins', sans-serif;
}

/* Card */
.menu-card {
  width: 100%;
  max-width: 480px;
  background: #ffffff;
  border-radius: 28px;
  padding: 28px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  animation: fadeIn 0.5s ease-in-out;
}

/* Header */
.header {
  text-align: center;
  margin-bottom: 24px;
}

.header h1 {
  font-size: 26px;
  font-weight: 800;
  color: #1e293b;
}

.header .subtitle {
  font-size: 16px;
  color: #475569;
  margin: 4px 0;
}

.date {
  font-size: 14px;
  color: #64748b;
  margin-top: 6px;
}

/* Meal Section Titles */
.meal-section {
  margin-bottom: 20px;
  padding: 12px 0;
}

.meal-title {
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #1e293b;
}

.meal-badge {
  font-size: 20px;
}

/* Meal Card Styles */
.items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-card {
  padding: 14px 18px;
  border-radius: 16px;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s ease;
  cursor: default;
  color: #1e293b;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Colored backgrounds per meal type */
.breakfast .item-card {
  background: linear-gradient(135deg, #ffd194, #d1913c);
  color: #fff;
}

.lunch .item-card {
  background: linear-gradient(135deg, #6dd5ed, #2193b0);
  color: #fff;
}

.dinner .item-card {
  background: linear-gradient(135deg, #fbc2eb, #a6c1ee);
  color: #1e293b;
}

.item-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
}

/* Loading / No data text */
.state-text {
  text-align: center;
  padding: 20px;
  font-size: 15px;
  color: #64748b;
}

.error {
  color: #ef4444;
  font-weight: 700;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Mobile */
@media (max-width: 480px) {
  .menu-card {
    padding: 20px;
  }

  .header h1 {
    font-size: 22px;
  }

  .item-card {
    font-size: 14px;
    padding: 12px 16px;
  }
}
</style>