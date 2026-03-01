<template>
  <div class="menu-wrapper">
    <div class="menu-card">

      <!-- Welcome Header -->
      <div class="header">
        <h1>Welcome to <span class="mess-name">{{ messName }} </span></h1>
        <p class="subtitle">Your meals for today</p>
        <p class="date">{{ today }}</p>
      </div>
      <div v-if="imageUrls.length" class="carousel">
  <div 
    class="carousel-track"
    :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
  >
    <div 
      class="carousel-slide"
      v-for="(img, i) in imageUrls" 
      :key="i"
    >
      <img :src="img" class="carousel-img" />
    </div>
  </div>
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
              <div class="item-row">
                  <span class="item-name">{{ item.meal_name }}</span>
                  <span v-if="item.meal_price !== null" class="item-price">
                    ₹{{ Number(item.meal_price) }}
                  </span>
                </div>
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
              <div class="item-row">
                  <span class="item-name">{{ item.meal_name }}</span>
                  <span v-if="item.meal_price !== null" class="item-price">
                    ₹{{ Number(item.meal_price) }}
                  </span>
                </div>
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
                <div class="item-row">
                  <span class="item-name">{{ item.meal_name }}</span>
                  <span v-if="item.meal_price !== null" class="item-price">
                    ₹{{ Number(item.meal_price) }}
                  </span>
                </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { getCustomerMealsApi } from '@/services/api'

const meals = ref([])
const loading = ref(true)
const messName = ref('')
const imageUrls = ref([
  "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1490645935967-10de6ba17061"])
const currentSlide = ref(0)
let interval = null
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
    meals.value = response.data?.meals || []
    messName.value = response.data?.user_name
    // imageUrls.value = response.data?.image_urls || []
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
  if (imageUrls.value.length > 1) {
    interval = setInterval(() => {
      currentSlide.value =
        (currentSlide.value + 1) % imageUrls.value.length
    }, 3000) // change every 3 seconds
  }
})
onBeforeUnmount(() => {
  clearInterval(interval)
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

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.item-name {
  font-weight: 600;
  font-size: 15px;
  flex: 1;
  text-transform: capitalize;
}

.item-price {
  font-weight: 700;
  font-size: 14px;
  padding: 4px 10px;
  border-radius: 20px;
  background: rgba(255,255,255,0.2);
}
.image-slider {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  margin-bottom: 20px;
}

.slider-img {
  width: 100%;
  max-width: 280px;
  border-radius: 16px;
  object-fit: cover;
}
.carousel {
  width: 100%;
  overflow: hidden;
  border-radius: 20px;
  position: relative;
}

.carousel-track {
  display: flex;
  transition: transform 0.6s ease-in-out;
}

.carousel-slide {
  flex: 0 0 100%;   /* VERY IMPORTANT */
  max-width: 100%;  /* Prevent overflow */
}

.carousel-img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  display: block;
}
.carousel-track {
  display: flex;
  width: 100%;
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