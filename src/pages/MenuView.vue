<template>
  <div class="app">

    <!-- ════════ HERO ════════ -->
    <div class="hero">
      <div v-if="imageUrls.length" class="hero-carousel">
        <div class="hero-track" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
          <div class="hero-slide" v-for="(img, i) in imageUrls" :key="i">
            <img :src="img" class="hero-img" />
          </div>
        </div>
      </div>
      <div v-else class="hero-gradient" />
      <div class="hero-scrim" />

      <!-- Navbar -->
      <div class="navbar">
        <div class="navbar-left">
          <div class="nav-icon">🍽️</div>
          <div class="nav-text">
            <span class="nav-label">Welcome to</span>
            <span class="nav-name">{{ messName || 'Our Kitchen' }}</span>
          </div>
        </div>
        <button v-if="mapUrl" class="nav-dir-btn" @click="openMap">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          Directions
        </button>
      </div>

      <!-- Hero bottom text -->
      <div class="hero-bottom">
        <div class="hero-pill">Today's Menu</div>
        <p class="hero-date">{{ today }}</p>
        <div v-if="imageUrls.length > 1" class="hero-dots">
          <span v-for="(_, i) in imageUrls" :key="i" class="hdot" :class="{ active: currentSlide === i }"
            @click="currentSlide = i" />
        </div>
      </div>
    </div>

    <!-- ════════ TAB BAR — full width ON the gradient ════════ -->
    <div v-if="!loading && (
      Object.keys(groupedMeals.breakfast).length ||
      Object.keys(groupedMeals.lunch).length ||
      Object.keys(groupedMeals.dinner).length
    )" class="tab-bar">
      <button v-for="tab in visibleTabs" :key="tab.key" class="tab-btn" :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key">
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </div>

    <!-- ════════ SHEET WRAPPER
         padding left+right = gradient visible on both sides
    ════════ -->
    <div class="sheet-wrap">
      <div class="sheet">

        <!-- Loading -->
        <div v-if="loading" class="state-box">
          <div class="spinner" />
          <p class="state-txt">Loading today's menu…</p>
        </div>

        <!-- No menu -->
        <div v-else-if="
          !Object.keys(groupedMeals.breakfast).length &&
          !Object.keys(groupedMeals.lunch).length &&
          !Object.keys(groupedMeals.dinner).length
        " class="state-box">
          <p class="state-icon">🚫</p>
          <p class="state-txt error">No Menu Available Today</p>
        </div>

        <!-- Panels -->
        <div v-else class="meal-container">

          <!-- Breakfast -->
          <div v-show="activeTab === 'breakfast'" class="meal-panel breakfast">
            <div class="time-badge">🕖 7 AM – 10 AM</div>
            <div v-for="(items, title) in groupedMeals.breakfast" :key="title">
              <div v-if="title !== 'general'" class="group-title">{{ title }}</div>
              <div class="items">
                <div class="item-card" v-for="item in items" :key="item.id">
                  <span class="item-name">{{ item.meal_name }}</span>
                  <div class="item-right">
                    <button class="rate-btn" @click="openRating(item)">⭐</button>
                    <span v-if="item.meal_price !== null" class="item-price">₹{{ Number(item.meal_price) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Lunch -->
          <div v-show="activeTab === 'lunch'" class="meal-panel lunch">
            <div class="time-badge">🕛 12 PM – 3 PM</div>
            <div v-for="(items, title) in groupedMeals.lunch" :key="title">
              <div v-if="title !== 'general'" class="group-title">{{ title }}</div>
              <div class="items">
                <div class="item-card" v-for="item in items" :key="item.id">
                  <span class="item-name">{{ item.meal_name }}</span>
                  <div class="item-right">
                    <button class="rate-btn" @click="openRating(item)">⭐</button>
                    <span v-if="item.meal_price !== null" class="item-price">₹{{ Number(item.meal_price) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Dinner -->
          <div v-show="activeTab === 'dinner'" class="meal-panel dinner">
            <div class="time-badge">🕕 6 PM – 10 PM</div>
            <div v-for="(items, title) in groupedMeals.dinner" :key="title">
              <div v-if="title !== 'general'" class="group-title">{{ title }}</div>
              <div class="items">
                <div class="item-card" v-for="item in items" :key="item.id">
                  <span class="item-name">{{ item.meal_name }}</span>
                  <div class="item-right">
                    <button class="rate-btn" @click="openRating(item)">⭐</button>
                    <span v-if="item.meal_price !== null" class="item-price">₹{{ Number(item.meal_price) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

  </div>

  <!-- ════════ RATING MODAL ════════ -->
  <Transition name="modal">
    <div v-if="showRatingModal" class="modal-bg" @click.self="showRatingModal = false">
      <div class="modal-box">
        <p class="modal-title">Rate this item</p>
        <p class="modal-item-name">{{ selectedItem?.meal_name }}</p>
        <div class="stars">
          <span v-for="star in 5" :key="star" class="star" :class="{ active: star <= selectedStars }"
            @click="selectedStars = star">★</span>
        </div>
        <button class="submit-btn" :disabled="!selectedStars" @click="submitItemRating">Submit Rating</button>
        <button class="cancel-btn" @click="showRatingModal = false">Cancel</button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { getCustomerMealsApi } from '@/services/api'

const meals = ref([])
const loading = ref(true)
const messName = ref('')
const imageUrls = ref([])
const mapUrl = ref('')
const currentSlide = ref(0)
let slideInterval = null

const showRatingModal = ref(false)
const selectedItem = ref(null)
const selectedStars = ref(0)

const getDefaultTab = () => {
  const h = new Date().getHours()
  if (h >= 3 && h < 11) return 'breakfast'
  if (h >= 11 && h < 18) return 'lunch'
  return 'dinner'
}
const activeTab = ref(getDefaultTab())

const today = new Date().toLocaleDateString('en-IN', {
  weekday: 'long', month: 'short', day: 'numeric'
})
// need veg thali icon
const allTabs = [
  { key: 'breakfast', label: 'Breakfast', icon: '🍔' },
  { key: 'lunch', label: 'Lunch', icon: '🍜' },
  { key: 'dinner', label: 'Dinner', icon: '🍱' },
]

const visibleTabs = computed(() =>
  allTabs.filter(t => Object.keys(groupedMeals.value[t.key]).length > 0)
)

const groupByTitle = (arr) => {
  const g = {}
  arr.forEach(m => {
    const k = m.title || 'general'
    if (!g[k]) g[k] = []
    g[k].push(m)
  })
  return g
}

const groupedMeals = computed(() => ({
  breakfast: groupByTitle(meals.value.filter(m => m.meal_flag === 0)),
  lunch: groupByTitle(meals.value.filter(m => m.meal_flag === 1)),
  dinner: groupByTitle(meals.value.filter(m => m.meal_flag === 2)),
}))

const openMap = () => window.open(mapUrl.value, '_blank')

const openRating = (item) => {
  selectedItem.value = item
  selectedStars.value = 0
  showRatingModal.value = true
}

const submitItemRating = async () => {
  if (!selectedStars.value) return
  try {
    // await submitItemRatingApi({ meal_id: selectedItem.value.id, rating: selectedStars.value })
    showRatingModal.value = false
  } catch (err) { console.error(err) }
}

onMounted(async () => {
  try {
    const params = new URLSearchParams(window.location.search)
    const userId = params.get('user_id')
    if (!userId) { loading.value = false; return }

    const res = await getCustomerMealsApi(userId)
    meals.value = res.data?.meals || []
    messName.value = res.data?.user_name || ''
    imageUrls.value = res.data?.image_urls || []
    mapUrl.value = res.data?.location?.map_url || ''

    const available = allTabs
      .filter(t => groupByTitle(meals.value.filter(
        m => m.meal_flag === allTabs.findIndex(x => x.key === t.key)
      )).length > 0)
      .map(t => t.key)

    if (available.length && !available.includes(activeTab.value)) {
      activeTab.value = available[0]
    }
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }

  if (imageUrls.value.length > 1) {
    slideInterval = setInterval(() => {
      currentSlide.value = (currentSlide.value + 1) % imageUrls.value.length
    }, 3500)
  }
})

onBeforeUnmount(() => clearInterval(slideInterval))
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

button {
  border: none;
  background: none;
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
}

.app {
  font-family: 'Poppins', sans-serif;
  max-width: 480px;
  margin: auto;
  min-height: 100vh;
  background: linear-gradient(180deg, #fafafa, #eef1f6);
}

/* HERO */

.hero {
  position: relative;
  height: 230px;
  overflow: hidden;
}

.hero-track {
  display: flex;
  height: 100%;
  transition: transform .6s ease;
}

.hero-slide {
  flex: 0 0 100%;
}

.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, .55), rgba(0, 0, 0, .15), rgba(0, 0, 0, .75));
}

/* NAVBAR */

.navbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  /* backdrop-filter:blur(10px); */
  /* background:rgba(0,0,0,.25); */
  z-index: 10;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.nav-label {
  font-size: 10px;
  color: #ddd;
}

.nav-name {
  font-size: 15px;
  font-weight: 900;
  color: #fff;
  text-transform: capitalize;
  line-height: 1.2;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.45);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 170px;
}

.nav-dir-btn {
  background: #ff7a18;
  color: white;
  padding: 7px 14px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

/* HERO TEXT */

.hero-bottom {
  position: absolute;
  bottom: 18px;
  left: 18px;
  color: white;
}

.hero-pill {
  font-size: 10px;
  background: rgba(255, 255, 255, .25);
  padding: 4px 10px;
  border-radius: 20px;
  margin-bottom: 6px;
}

.hero-date {
  font-size: 12px;
}

/* TABS */

.tab-bar {
  display: flex;
  width: 100%;
  /* Frosted glass so gradient shows through */
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  position: sticky;
  top: 0;
  box-shadow:
    0 10px 25px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  z-index: 30;
}

.tab-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 11px 4px 10px;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  /* inactive: white at 55% opacity on gradient */
  font-size: 11px;
  font-weight: 700;
  transition: color 0.18s, border-color 0.18s;
  letter-spacing: 0.1px;
}

.tab-icon {
  font-size: 20px;
  margin-bottom: 4px;
}

/* CONTENT */

.sheet-wrap {
  padding: 14px;
}

.sheet {
  background: white;
  border-radius: 20px;
  /* box-shadow:0 10px 25px rgba(0,0,0,.08); */
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

/* MEAL PANEL */

.meal-panel {
  padding: 16px;
}

.time-badge {
  text-align: center;
  font-size: 11px;
  color: #64748b;
  margin-bottom: 14px;
}

/* GROUP TITLE */

/* ─── Group Title ─── */
.group-title {
  position: relative;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: #5f5c5c;
  text-align: center;
  margin: 16px 0 9px;
}

.group-title::before,
.group-title::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 27%;
  height: 1px;
  background: #e2e8f0;
}

.group-title::before {
  left: 0;
}

.group-title::after {
  right: 0;
}

/* ITEM LIST */

.items {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* FOOD CARD */

.item-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px 9px 18px;
  border-radius: 16px;
  background: #f8fafc;
  transition: .2s;
  box-shadow: 0 3px 8px rgba(0, 0, 0, .05);
}

.item-card:active {
  transform: scale(.97);
}

/* MEAL COLORS */

.breakfast .item-card {
  background: linear-gradient(135deg, #fff1c9, #ffe08a);
}

.lunch .item-card {
  background: linear-gradient(135deg, #d8f1ff, #a8e0ff);
}

.dinner .item-card {
  background: linear-gradient(135deg, #e8dcff, #c6b5ff);
}

/* NAME */

.item-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

/* RIGHT */

.item-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* RATE BUTTON */

.rate-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, .15);
}

/* PRICE */

.item-price {
  background: #fff;
  color: #111;
  ;
  font-size: 12px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 20px;
}

/* LOADING */

.state-box {
  padding: 60px 20px;
  text-align: center;
}

.state-txt {
  font-size: 14px;
  color: #64748b;
}

.state-txt.error {
  color: #ef4444;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #e5e7eb;
  border-top-color: #ff7a18;
  border-radius: 50%;
  animation: spin .8s linear infinite;
  margin: auto;
}

@keyframes spin {
  to {
    transform: rotate(360deg)
  }
}

/* MODAL */

.modal-bg {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, .5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.modal-box {
  width: 100%;
  max-width: 480px;
  background: white;
  border-radius: 22px 22px 0 0;
  padding: 24px;
  text-align: center;
}

.modal-item-name {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 18px;
}

.stars {
  display: flex;
  justify-content: center;
  gap: 8px;
  font-size: 34px;
}

.star {
  color: #ddd;
}

.star.active {
  color: #fbbf24;
}

.submit-btn {
  margin-top: 18px;
  width: 100%;
  padding: 13px;
  border-radius: 10px;
  background: #ff7a18;
  color: white;
  font-weight: 700;
}

.cancel-btn {
  margin-top: 10px;
  color: #ef4444;
  font-weight: 600;
}

.nav-text {
  display: flex;
  flex-direction: column;
}

.tab-btn.active[data-v-a35968e3] {
  color: #ff420b;
  border-bottom-color: #5fc2db;
}
</style>