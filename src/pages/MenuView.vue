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
  if (h >= 6 && h < 11) return 'breakfast'
  if (h >= 11 && h < 18) return 'lunch'
  return 'dinner'
}
const activeTab = ref(getDefaultTab())

const today = new Date().toLocaleDateString('en-IN', {
  weekday: 'long', month: 'short', day: 'numeric'
})

const allTabs = [
  { key: 'breakfast', label: 'Breakfast', icon: '🍳' },
  { key: 'lunch', label: 'Lunch', icon: '🍛' },
  { key: 'dinner', label: 'Dinner', icon: '🌙' },
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
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800;900&display=swap');

/* ─── Reset ─── */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

button {
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
  border: none;
  outline: none;
}

/* ════════════════════════════════
   APP — gradient is always the bg
   It shows: left+right of sheet,
   behind tab bar, below sheet
════════════════════════════════ */
.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #0e2142, #6e43d3, #4e2538);
  /* background: linear-gradient(140deg, #888888, #8361d8, #e74690); */
  /* background: linear-gradient(140deg, #637fcd, #343337, #c44343); */

  font-family: 'Poppins', sans-serif;
  max-width: 480px;
  margin: 0 auto;
  -webkit-font-smoothing: antialiased;
}

/* ════════════════════════════════
   HERO
════════════════════════════════ */
.hero {
  position: relative;
  height: 280px;
  overflow: hidden;
}

.hero-carousel {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.hero-track {
  display: flex;
  height: 100%;
  transition: transform 0.65s cubic-bezier(0.4, 0, 0.2, 1);
}

.hero-slide {
  flex: 0 0 100%;
  height: 100%;
}

.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

.hero-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(155deg, #fbc2eb 0%, #a18cd1 50%, #667eea 100%);
}

.hero-scrim {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(to bottom,
      rgba(0, 0, 0, 0.55) 0%,
      rgba(0, 0, 0, 0.00) 36%,
      rgba(0, 0, 0, 0.00) 46%,
      rgba(0, 0, 0, 0.68) 100%);
}

/* ── Navbar ── */
.navbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 0;
  padding-top: max(14px, env(safe-area-inset-top));
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}

.nav-icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.32);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.nav-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.nav-label {
  font-size: 9px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.68);
  text-transform: uppercase;
  letter-spacing: 1px;
  line-height: 1;
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
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.38);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 7px 12px;
  border-radius: 30px;
  transition: background 0.2s;
}

.nav-dir-btn:active {
  background: rgba(255, 255, 255, 0.3);
}

/* ── Hero bottom text ── */
.hero-bottom {
  position: absolute;
  bottom: 18px;
  left: 0;
  right: 0;
  z-index: 2;
  padding: 0 18px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.hero-pill {
  display: inline-block;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.38);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  padding: 3px 11px;
  border-radius: 30px;
  margin-bottom: 5px;
}

.hero-title {
  font-size: 28px;
  font-weight: 900;
  color: #fff;
  text-transform: capitalize;
  line-height: 1.12;
  letter-spacing: -0.4px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6), 0 4px 16px rgba(0, 0, 0, 0.4);
}

.hero-date {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.76);
  margin-top: 3px;
}

.hero-dots {
  display: flex;
  gap: 5px;
  margin-top: 9px;
}

.hdot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.35);
  cursor: pointer;
  transition: all 0.3s;
}

.hdot.active {
  background: #fff;
  width: 18px;
  border-radius: 3px;
}

/* ════════════════════════════════
   TAB BAR
   Sits directly on the gradient —
   full width, no padding, no card
════════════════════════════════ */
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
  color: rgba(255, 255, 255, 0.58);
  font-size: 11px;
  font-weight: 700;
  transition: color 0.18s, border-color 0.18s;
  letter-spacing: 0.1px;
}

.tab-btn.active {
  /* active: full white with bottom indicator */
  color: #ffffff;
  border-bottom-color: #ffffff;
}

.tab-icon {
  font-size: 19px;
  line-height: 1;
  margin-bottom: 3px;
  display: block;
}

.tab-label {
  font-size: 11px;
}

/* ════════════════════════════════
   SHEET WRAPPER
   padding: reveals gradient as
   a frame on left + right sides
════════════════════════════════ */
.sheet-wrap {
  padding: 10px 12px 32px;
  padding-bottom: max(32px, calc(env(safe-area-inset-bottom) + 16px));
}

.sheet {
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
  min-height: calc(100vh - 380px);
}

/* ─── States ─── */
.state-box {
  padding: 52px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.state-icon {
  font-size: 38px;
}

.state-txt {
  font-size: 14px;
  color: #94a3b8;
  font-weight: 600;
}

.state-txt.error {
  color: #ef4444;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #e2e8f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
  margin-bottom: 6px;
}

/* ─── Meal Panel ─── */
.meal-container {
  display: flex;
  flex-direction: column;
}

.meal-panel {
  padding: 14px 14px 32px;
}

.time-badge {
  align-items: center;
  gap: 5px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #64748b;
  font-size: 10px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
  margin-bottom: 12px;
  display: flex;
  justify-content: center;
}

/* ─── Group Title ─── */
.group-title {
  position: relative;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: #94a3b8;
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

/* ─── Item Cards ─── */
.items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 13px;
  border-radius: 13px;
  transition: transform 0.15s;
}

/* .item-card:active {
  transform: scale(0.98);
} */

.breakfast .item-card {
  background: linear-gradient(135deg, #fde8b4, #f6c25e);
}

.lunch .item-card {
  background: linear-gradient(135deg, #bae6fd, #38bdf8);
}

.dinner .item-card {
  background: linear-gradient(135deg, #ddd6fe, #a78bfa);
}

.item-name {
  flex: 1;
  font-size: 13.5px;
  font-weight: 700;
  color: #1e293b;
  text-transform: capitalize;
}

.item-right {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-shrink: 0;
}

.rate-btn {
  background: rgba(255, 255, 255, 0.42);
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s;
  padding: 0;
}

.rate-btn:active {
  transform: scale(1.2);
}

.item-price {
  background: rgba(255, 255, 255, 0.38);
  font-size: 11.5px;
  font-weight: 700;
  color: #1e293b;
  padding: 3px 9px;
  border-radius: 20px;
  white-space: nowrap;
}

/* ─── Rating Modal ─── */
.modal-bg {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.46);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom);
}

.modal-box {
  background: #fff;
  border-radius: 26px 26px 0 0;
  padding: 14px 26px 36px;
  width: 100%;
  max-width: 480px;
  text-align: center;
}

.modal-box::before {
  content: '';
  display: block;
  width: 38px;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  margin: 0 auto 22px;
}

.modal-title {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: #94a3b8;
  margin-bottom: 6px;
}

.modal-item-name {
  font-size: 20px;
  font-weight: 900;
  color: #1e293b;
  text-transform: capitalize;
  margin-bottom: 20px;
  line-height: 1.2;
}

.stars {
  display: flex;
  justify-content: center;
  gap: 8px;
  font-size: 36px;
  margin-bottom: 20px;
}

.star {
  cursor: pointer;
  color: #e2e8f0;
  transition: color 0.15s, transform 0.15s;
}

.star.active {
  color: #fbbf24;
}

.star:active {
  transform: scale(1.18);
}

.submit-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.2px;
  box-shadow: 0 8px 22px rgba(102, 126, 234, 0.38);
  transition: opacity 0.2s;
}

.submit-btn:active:not(:disabled) {
  opacity: 0.86;
}

.submit-btn:disabled {
  background: #e2e8f0;
  color: #94a3b8;
  box-shadow: none;
  cursor: not-allowed;
}

.cancel-btn {
  display: block;
  width: 100%;
  margin-top: 11px;
  background: none;
  color: #ef4444;
  font-size: 13px;
  font-weight: 700;
  padding: 6px;
}

/* ─── Modal Transition ─── */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.22s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-box,
.modal-leave-active .modal-box {
  transition: transform 0.26s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from .modal-box {
  transform: translateY(100%);
}

.modal-leave-to .modal-box {
  transform: translateY(100%);
}

/* ─── Keyframes ─── */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>