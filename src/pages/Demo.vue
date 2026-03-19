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
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          Directions
        </button>
      </div>

      <div class="hero-bottom">
        <div class="hero-pill">Today's Menu</div>
        <p class="hero-date">{{ today }}</p>
        <div v-if="imageUrls.length > 1" class="hero-dots">
          <span v-for="(_, i) in imageUrls" :key="i" class="hdot"
            :class="{ active: currentSlide === i }" @click="currentSlide = i" />
        </div>
      </div>
    </div>

    <!-- ════════ TAB BAR ════════ -->
    <div v-if="!loading && (
      Object.keys(groupedMeals.breakfast).length ||
      Object.keys(groupedMeals.lunch).length ||
      Object.keys(groupedMeals.dinner).length
    )" class="tab-bar">
      <button v-for="tab in visibleTabs" :key="tab.key" class="tab-btn"
        :class="{ active: activeTab === tab.key }" @click="activeTab = tab.key">
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </div>

    <!-- ════════ SHEET ════════ -->
    <div class="sheet-wrap">
      <div class="sheet">

        <div v-if="loading" class="state-box">
          <div class="spinner" />
          <p class="state-txt">Loading today's menu…</p>
        </div>

        <div v-else-if="
          !Object.keys(groupedMeals.breakfast).length &&
          !Object.keys(groupedMeals.lunch).length &&
          !Object.keys(groupedMeals.dinner).length
        " class="state-box">
          <p class="state-icon">🚫</p>
          <p class="state-txt error">No Menu Available Today</p>
        </div>

        <div v-else class="meal-container">

          <!-- Breakfast -->
          <div v-show="activeTab === 'breakfast'" class="meal-panel breakfast">
            <div class="time-badge">🕖 7 AM – 10 AM</div>
            <div v-for="(items, title) in groupedMeals.breakfast" :key="title">
              <div v-if="title !== 'general'" class="group-title">{{ title }}</div>
              <div class="items">
                <div class="item-card" :class="{ selected: cart[item.id] }"
                  v-for="item in items" :key="item.id" @click="toggleCart(item)">
                  <span class="item-name">{{ item.meal_name }}</span>
                  <div class="item-right">
                    <button class="rate-btn" @click.stop="openRating(item)">⭐</button>
                    <div v-if="cart[item.id]" class="qty-stepper" @click.stop>
                      <button class="qty-btn" @click="changeQty(item.id, -1)">−</button>
                      <span class="qty-num">{{ cart[item.id].qty }}</span>
                      <button class="qty-btn" @click="changeQty(item.id, +1)">+</button>
                    </div>
                    <span v-if="item.meal_price !== null && Number(item.meal_price) > 0" class="item-price">
                      ₹{{ Number(item.meal_price) }}
                    </span>
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
                <div class="item-card" :class="{ selected: cart[item.id] }"
                  v-for="item in items" :key="item.id" @click="toggleCart(item)">
                  <span class="item-name">{{ item.meal_name }}</span>
                  <div class="item-right">
                    <button class="rate-btn" @click.stop="openRating(item)">⭐</button>
                    <div v-if="cart[item.id]" class="qty-stepper" @click.stop>
                      <button class="qty-btn" @click="changeQty(item.id, -1)">−</button>
                      <span class="qty-num">{{ cart[item.id].qty }}</span>
                      <button class="qty-btn" @click="changeQty(item.id, +1)">+</button>
                    </div>
                    <span v-if="item.meal_price !== null && Number(item.meal_price) > 0" class="item-price">
                      ₹{{ Number(item.meal_price) }}
                    </span>
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
                <div class="item-card" :class="{ selected: cart[item.id] }"
                  v-for="item in items" :key="item.id" @click="toggleCart(item)">
                  <span class="item-name">{{ item.meal_name }}</span>
                  <div class="item-right">
                    <button class="rate-btn" @click.stop="openRating(item)">⭐</button>
                    <div v-if="cart[item.id]" class="qty-stepper" @click.stop>
                      <button class="qty-btn" @click="changeQty(item.id, -1)">−</button>
                      <span class="qty-num">{{ cart[item.id].qty }}</span>
                      <button class="qty-btn" @click="changeQty(item.id, +1)">+</button>
                    </div>
                    <span v-if="item.meal_price !== null && Number(item.meal_price) > 0" class="item-price">
                      ₹{{ Number(item.meal_price) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

  </div>

  <!-- ════════ CART BAR ════════ -->
  <Transition name="slide-up">
    <div v-if="cartCount > 0" class="cart-bar">
      <div class="cart-left">
        <span class="cart-badge">{{ cartCount }}</span>
        <span class="cart-label">items</span>
      </div>
      <span class="cart-total">₹{{ cartTotal }}</span>
      <button class="pay-btn" @click="openPaySheet">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0">
          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8h16v10zm-6-3h-1v-2h1c.55 0 1-.45 1-1s-.45-1-1-1h-2v5h1v-1h1c1.1 0 2-.9 2-2s-.9-2-2-2z"/>
        </svg>
        Pay ₹{{ cartTotal }}
      </button>
    </div>
  </Transition>

  <!-- ════════ PAYMENT SHEET ════════ -->
  <Transition name="modal">
    <div v-if="showPaySheet" class="modal-bg" @click.self="showPaySheet = false">
      <div class="pay-sheet">
        <div class="pay-handle" />

        <div class="pay-header">
          <div>
            <p class="pay-title">Pay ₹{{ cartTotal }}</p>
            <p class="pay-sub">{{ cartCount }} item{{ cartCount > 1 ? 's' : '' }} · Admin verifies manually</p>
          </div>
          <button class="pay-close" @click="showPaySheet = false">✕</button>
        </div>

        <!-- Order summary -->
        <div class="pay-summary">
          <div class="pay-row" v-for="entry in Object.values(cart)" :key="entry.item.id">
            <span class="pay-row-name">{{ entry.item.meal_name }} × {{ entry.qty }}</span>
            <span class="pay-row-amt">₹{{ Number(entry.item.meal_price) * entry.qty }}</span>
          </div>
          <div class="pay-row total-row">
            <span>Total</span>
            <span>₹{{ cartTotal }}</span>
          </div>
        </div>

        <!-- ── Section 1: UPI Apps with amount pre-filled ── -->
        <p class="section-label">Pay directly — amount pre-filled</p>
        <div class="upi-list">
          <button class="upi-btn phonepe-btn" @click="payWith('phonepe')">
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTo4x8kSTmPUq4PFzl4HNT0gObFuEhivHOFYg&s" alt="PhonePe logo" class="scanner-logo phonepe-logo">
            <div class="upi-info">
              <span class="upi-name">PhonePe</span>
              <span class="upi-desc">Opens with ₹{{ cartTotal }} pre-filled</span>
            </div>
            <span class="upi-arrow">›</span>
          </button>

          <button class="upi-btn gpay-btn" @click="payWith('gpay')">
            <img src="https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/google-pay-icon.png" alt="PhonePe logo" class="upi-logo gpay-logo">
            <div class="upi-info">
              <span class="upi-name">Google Pay</span>
              <span class="upi-desc">Opens with ₹{{ cartTotal }} pre-filled</span>
            </div>
            <span class="upi-arrow">›</span>
          </button>
        </div>

        <!-- ── OR divider ── -->
        <div class="or-divider"><span>or scan admin's QR code</span></div>

        <!-- ── Section 2: Open scanner inside UPI app ── -->
        <p class="section-label">Open QR scanner in app</p>
        <div class="scanner-list">

          <button class="scanner-btn phonepe-scan" @click="openScanner('phonepe')">
            <!-- <div class="scanner-logo phonepe-logo">Pe</div> -->
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTo4x8kSTmPUq4PFzl4HNT0gObFuEhivHOFYg&s" alt="PhonePe logo" class="scanner-logo phonepe-logo">
            <div class="upi-info">
              <span class="upi-name">PhonePe Scanner</span>
              <span class="upi-desc">Opens PhonePe → tap Scan QR inside</span>
            </div>
            <svg class="scan-qr-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 3h7v7H3zm1 1v5h5V4zm1 1h3v3H5zm8-2h7v7h-7zm1 1v5h5V4zm1 1h3v3h-3zM3 13h7v7H3zm1 1v5h5v-5zm1 1h3v3H5zm8 0h2v2h-2zm0 4h2v2h-2zm4-4h2v2h-2zm-2 2h2v2h-2zm2 2h2v2h-2z"/>
            </svg>
          </button>

          <button class="scanner-btn gpay-scan" @click="openScanner('gpay')">
             <img src="https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/google-pay-icon.png" alt="PhonePe logo" class="upi-logo gpay-logo">
            <div class="upi-info">
              <span class="upi-name">GPay Scanner</span>
              <span class="upi-desc">Opens Google Pay → tap Scan QR inside</span>
            </div>
            <svg class="scan-qr-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 3h7v7H3zm1 1v5h5V4zm1 1h3v3H5zm8-2h7v7h-7zm1 1v5h5V4zm1 1h3v3h-3zM3 13h7v7H3zm1 1v5h5v-5zm1 1h3v3H5zm8 0h2v2h-2zm0 4h2v2h-2zm4-4h2v2h-2zm-2 2h2v2h-2zm2 2h2v2h-2z"/>
            </svg>
          </button>

        </div>
        <!-- UPI ID copy row -->
        <div v-if="upiId" class="upi-id-row">
          <span class="upi-id-label">UPI ID</span>
          <span class="upi-id-val">{{ upiId }}</span>
          <button class="copy-btn" @click="copyUpiId">{{ copied ? '✓ Copied' : 'Copy' }}</button>
        </div>

        <p class="pay-secure">🔒 Pay directly · Admin verifies manually</p>
      </div>
    </div>
  </Transition>

  <!-- ════════ RATING MODAL ════════ -->
  <Transition name="modal">
    <div v-if="showRatingModal" class="modal-bg" @click.self="showRatingModal = false">
      <div class="modal-box">
        <p class="modal-title">Rate this item</p>
        <p class="modal-item-name">{{ selectedItem?.meal_name }}</p>
        <div class="stars">
          <span v-for="star in 5" :key="star" class="star"
            :class="{ active: star <= selectedStars }" @click="selectedStars = star">★</span>
        </div>
        <button class="submit-btn" :disabled="!selectedStars" @click="submitItemRating">
          Submit Rating
        </button>
        <button class="cancel-btn" @click="showRatingModal = false">Cancel</button>
      </div>
    </div>
  </Transition>

</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { getCustomerMealsApi } from '@/services/api'

// ─── Meals ────────────────────────────────────────────────────
const meals        = ref([])
const loading      = ref(true)
const messName     = ref('')
const imageUrls    = ref([])
const mapUrl       = ref('')
const upiId        = ref('')   // comes from backend
const currentSlide = ref(0)
let   slideInterval = null

// ─── Rating ───────────────────────────────────────────────────
const showRatingModal = ref(false)
const selectedItem    = ref(null)
const selectedStars   = ref(0)

// ─── Tabs ─────────────────────────────────────────────────────
const getDefaultTab = () => {
  const h = new Date().getHours()
  if (h >= 3  && h < 11) return 'breakfast'
  if (h >= 11 && h < 18) return 'lunch'
  return 'dinner'
}
const activeTab = ref(getDefaultTab())

const today = new Date().toLocaleDateString('en-IN', {
  weekday: 'long', month: 'short', day: 'numeric'
})

const allTabs = [
  { key: 'breakfast', label: 'Breakfast', icon: '🍳' },
  { key: 'lunch',     label: 'Lunch',     icon: '🍜' },
  { key: 'dinner',    label: 'Dinner',    icon: '🍱' },
]

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
  lunch:     groupByTitle(meals.value.filter(m => m.meal_flag === 1)),
  dinner:    groupByTitle(meals.value.filter(m => m.meal_flag === 2)),
}))

const visibleTabs = computed(() =>
  allTabs.filter(t => Object.keys(groupedMeals.value[t.key]).length > 0)
)

// ─── Cart ─────────────────────────────────────────────────────
const cart = ref({})

const toggleCart = (item) => {
  if (item.meal_price === null || Number(item.meal_price) === 0) return
  if (cart.value[item.id]) {
    delete cart.value[item.id]
  } else {
    cart.value[item.id] = { item, qty: 1 }
  }
}

const changeQty = (id, delta) => {
  if (!cart.value[id]) return
  const next = cart.value[id].qty + delta
  if (next <= 0) delete cart.value[id]
  else cart.value[id].qty = next
}

const cartTotal = computed(() =>
  Object.values(cart.value).reduce((s, e) => s + Number(e.item.meal_price) * e.qty, 0)
)
const cartCount = computed(() =>
  Object.values(cart.value).reduce((s, e) => s + e.qty, 0)
)

// ─── Payment ──────────────────────────────────────────────────
const showPaySheet = ref(false)
const copied       = ref(false)

const openPaySheet = () => {
  showPaySheet.value = true
}

// ── Pay with amount pre-filled ──
const payWith = (app) => {
  const amount = cartTotal.value.toFixed(2)
  const id     = upiId.value
  const name   = encodeURIComponent(messName.value || 'Mess Payment')
  const note   = encodeURIComponent('Meal order')

  const links = {
    phonepe: `phonepe://pay?pa=${id}&pn=${name}&am=${amount}&cu=INR&tn=${note}`,
    gpay:    `tez://upi/pay?pa=${id}&pn=${name}&am=${amount}&cu=INR&tn=${note}`,
    upi:     `upi://pay?pa=${id}&pn=${name}&am=${amount}&cu=INR&tn=${note}`,
  }

  const a = document.createElement('a')
  a.href  = links[app]
  a.click()

  if (app !== 'upi') {
    setTimeout(() => {
      const fb = document.createElement('a')
      fb.href  = links.upi
      fb.click()
    }, 1800)
  }
}

// ── Open app so user can tap Scan QR inside (no amount) ──
// Browser cannot directly open the scanner — user taps Scan inside the app
const openScanner = (app) => {
  const id   = upiId.value
  const name = encodeURIComponent(messName.value || 'Mess Payment')
  const note = encodeURIComponent('Meal order')

  // No amount — so the QR code the user scans will set the amount
  const links = {
    phonepe: `phonepe://pay?pa=${id}&pn=${name}&cu=INR&tn=${note}`,
    gpay:    `tez://upi/pay?pa=${id}&pn=${name}&cu=INR&tn=${note}`,
    upi:     `upi://pay?pa=${id}&pn=${name}&cu=INR&tn=${note}`,
  }

  const a = document.createElement('a')
  a.href  = links[app] || links.upi
  a.click()

  if (app !== 'upi') {
    setTimeout(() => {
      const fb = document.createElement('a')
      fb.href  = links.upi
      fb.click()
    }, 1800)
  }
}

// ── Copy UPI ID ──
const copyUpiId = async () => {
  try {
    await navigator.clipboard.writeText(upiId.value)
  } catch {
    const el = document.createElement('textarea')
    el.value = upiId.value
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
  }
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

// ─── Helpers ──────────────────────────────────────────────────
const openMap = () => window.open(mapUrl.value, '_blank')

const openRating = (item) => {
  selectedItem.value    = item
  selectedStars.value   = 0
  showRatingModal.value = true
}

const submitItemRating = async () => {
  if (!selectedStars.value) return
  try {
    // await submitItemRatingApi({ meal_id: selectedItem.value.id, rating: selectedStars.value })
    showRatingModal.value = false
  } catch (err) { console.error(err) }
}

// ─── Lifecycle ────────────────────────────────────────────────
onMounted(async () => {
  try {
    const params = new URLSearchParams(window.location.search)
    const userId = params.get('user_id')
    if (!userId) { loading.value = false; return }

    const res       = await getCustomerMealsApi(userId)
    meals.value     = res.data?.meals      || []
    messName.value  = res.data?.user_name  || ''
    imageUrls.value = res.data?.image_urls || []
    mapUrl.value    = res.data?.location?.map_url || ''

    // ── UPI ID from backend ──
    // Update the key below to match your API response field name
    upiId.value = res.data?.upi_id || '8484808337@ybl'

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

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
button { border: none; background: none; font-family: 'Poppins', sans-serif; cursor: pointer; }

.app { font-family: 'Poppins', sans-serif; max-width: 480px; margin: auto; min-height: 100vh; background: linear-gradient(180deg, #fafafa, #eef1f6); }

/* HERO */
.hero { position: relative; height: 230px; overflow: hidden; }
.hero-track { display: flex; height: 100%; transition: transform .6s ease; }
.hero-slide { flex: 0 0 100%; }
.hero-img { width: 100%; height: 100%; object-fit: cover; }
.hero-gradient { width: 100%; height: 100%; background: linear-gradient(135deg, #1e293b, #334155); }
.hero-scrim { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,.55), rgba(0,0,0,.15), rgba(0,0,0,.75)); }
.navbar { position: absolute; top: 0; left: 0; right: 0; display: flex; justify-content: space-between; align-items: center; padding: 13px 15px; z-index: 10; }
.navbar-left { display: flex; align-items: center; gap: 10px; }
.nav-icon { width: 38px; height: 38px; border-radius: 12px; background: white; display: flex; align-items: center; justify-content: center; font-size: 18px; }
.nav-text { display: flex; flex-direction: column; }
.nav-label { font-size: 10px; color: #ddd; }
.nav-name { font-size: 15px; font-weight: 900; color: #fff; text-transform: capitalize; line-height: 1.2; text-shadow: 0 1px 8px rgba(0,0,0,.45); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 170px; }
.nav-dir-btn { background: #ff7a18; color: white; padding: 7px 14px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.hero-bottom { position: absolute; bottom: 18px; left: 18px; color: white; }
.hero-pill { font-size: 10px; background: rgba(255,255,255,.25); padding: 4px 10px; border-radius: 20px; margin-bottom: 6px; }
.hero-date { font-size: 12px; }
.hero-dots { display: flex; gap: 5px; margin-top: 8px; }
.hdot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,.4); cursor: pointer; transition: .2s; }
.hdot.active { background: white; width: 16px; border-radius: 3px; }

/* TAB BAR */
.tab-bar { display: flex; width: 100%; background: rgba(255,255,255,.15); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,.2); position: sticky; top: 0; box-shadow: 0 10px 25px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.6); z-index: 30; }
.tab-btn { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 11px 4px 10px; background: transparent; border: none; border-bottom: 3px solid transparent; font-size: 11px; font-weight: 700; transition: color .18s, border-color .18s; letter-spacing: .1px; }
.tab-btn.active { color: #ff420b; border-bottom-color: #5fc2db; }
.tab-icon { font-size: 19px; line-height: 1; margin-bottom: 3px; display: block; }
.tab-label { font-size: 11px; }

/* SHEET */
.sheet-wrap { padding: 13px; background: linear-gradient(135deg, #7b7c7d, #4b338f, #847e81); min-height: 50vh; }
.sheet { background: white; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.6); }
.meal-panel { padding: 16px; }
.time-badge { text-align: center; font-size: 11px; color: #64748b; margin-bottom: 14px; }
.group-title { position: relative; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: #5f5c5c; text-align: center; margin: 16px 0 9px; }
.group-title::before, .group-title::after { content: ''; position: absolute; top: 50%; width: 27%; height: 1px; background: #e2e8f0; }
.group-title::before { left: 0; }
.group-title::after  { right: 0; }

/* ITEMS */
.items { display: flex; flex-direction: column; gap: 10px; }
.item-card { display: flex; justify-content: space-between; align-items: center; padding: 10px 15px 9px 18px; border-radius: 16px; background: #f8fafc; transition: .2s; box-shadow: 0 3px 8px rgba(0,0,0,.05); cursor: pointer; }
.item-card:active { transform: scale(.97); }
.item-card.selected { outline: 2px solid #ff7a18; outline-offset: -2px; }
.breakfast .item-card { background: linear-gradient(135deg, #fff1c9, #ffe08a); }
.lunch     .item-card { background: linear-gradient(135deg, #d8f1ff, #a8e0ff); }
.dinner    .item-card { background: linear-gradient(135deg, #e8dcff, #c6b5ff); }
.item-name { font-size: 14px; font-weight: 600; color: #1e293b; }
.item-right { display: flex; align-items: center; gap: 8px; }
.rate-btn { width: 30px; height: 30px; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 2px 6px rgba(0,0,0,.15); }
.item-price { background: #fff; color: #111; font-size: 12px; font-weight: 600; padding: 3px 9px; border-radius: 20px; }
.qty-stepper { display: flex; align-items: center; gap: 4px; background: white; border-radius: 20px; padding: 2px 6px; box-shadow: 0 2px 6px rgba(0,0,0,.12); }
.qty-btn { width: 22px; height: 22px; border-radius: 50%; background: #ff7a18; color: white; font-size: 15px; font-weight: 700; display: flex; align-items: center; justify-content: center; line-height: 1; border: none; cursor: pointer; }
.qty-num { font-size: 13px; font-weight: 700; min-width: 16px; text-align: center; color: #1e293b; }

/* STATES */
.state-box { padding: 60px 20px; text-align: center; }
.state-icon { font-size: 40px; margin-bottom: 12px; }
.state-txt { font-size: 14px; color: #64748b; }
.state-txt.error { color: #ef4444; }
.spinner { width: 30px; height: 30px; border: 3px solid #e5e7eb; border-top-color: #ff7a18; border-radius: 50%; animation: spin .8s linear infinite; margin: 0 auto 12px; }
@keyframes spin { to { transform: rotate(360deg) } }

/* MODAL */
.modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,.5); display: flex; align-items: flex-end; justify-content: center; z-index: 200; }
.modal-enter-active, .modal-leave-active { transition: opacity .25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

/* RATING */
.modal-box { width: 100%; max-width: 480px; background: white; border-radius: 22px 22px 0 0; padding: 24px; text-align: center; }
.modal-title { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 6px; }
.modal-item-name { font-size: 20px; font-weight: 700; margin-bottom: 18px; color: #0f172a; }
.stars { display: flex; justify-content: center; gap: 8px; font-size: 34px; }
.star { color: #ddd; cursor: pointer; }
.star.active { color: #fbbf24; }
.submit-btn { margin-top: 18px; width: 100%; padding: 13px; border-radius: 10px; background: #ff7a18; color: white; font-weight: 700; font-family: 'Poppins', sans-serif; }
.submit-btn:disabled { opacity: .5; cursor: not-allowed; }
.cancel-btn { margin-top: 10px; color: #ef4444; font-weight: 600; }

/* CART BAR */
.cart-bar { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); width: calc(100% - 32px); max-width: 448px; background: #1e293b; border-radius: 20px; padding: 10px 12px; display: flex; align-items: center; gap: 10px; z-index: 100; box-shadow: 0 8px 32px rgba(0,0,0,.28); }
.cart-left { display: flex; align-items: center; gap: 6px; }
.cart-badge { background: #ff7a18; color: white; font-size: 11px; font-weight: 700; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.cart-label { font-size: 12px; color: #94a3b8; font-weight: 500; }
.cart-total { flex: 1; font-size: 17px; font-weight: 700; color: white; }
.pay-btn { background: linear-gradient(135deg, #7c3aed, #5b21b6); color: white; padding: 10px 16px; border-radius: 14px; font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 6px; white-space: nowrap; box-shadow: 0 4px 14px rgba(91,33,182,.45); transition: transform .15s; }
.pay-btn:active { transform: scale(.96); }
.slide-up-enter-active, .slide-up-leave-active { transition: transform .3s ease, opacity .3s ease; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateX(-50%) translateY(80px); opacity: 0; }

/* PAYMENT SHEET */
.pay-sheet { width: 100%; max-width: 480px; background: white; border-radius: 26px 26px 0 0; padding: 12px 18px 36px; max-height: 92vh; overflow-y: auto; }
.pay-handle { width: 36px; height: 4px; background: #e2e8f0; border-radius: 2px; margin: 0 auto 16px; }
.pay-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
.pay-title { font-size: 20px; font-weight: 700; color: #0f172a; }
.pay-sub { font-size: 12px; color: #64748b; margin-top: 2px; }
.pay-close { width: 30px; height: 30px; border-radius: 50%; background: #f1f5f9; color: #64748b; font-size: 13px; display: flex; align-items: center; justify-content: center; }

/* SUMMARY */
.pay-summary { background: #f8fafc; border-radius: 14px; padding: 10px 14px; margin-bottom: 16px; }
.pay-row { display: flex; justify-content: space-between; font-size: 13px; color: #475569; padding: 4px 0; }
.pay-row-name { font-weight: 500; }
.pay-row-amt { font-weight: 600; color: #334155; }
.total-row { border-top: 1px solid #e2e8f0; margin-top: 6px; padding-top: 8px; font-size: 14px; font-weight: 700; color: #0f172a; }

/* SECTION LABEL */
.section-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .8px; color: #94a3b8; margin-bottom: 10px; display: block; }

/* UPI BUTTONS */
.upi-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 4px; }
.upi-btn { width: 100%; display: flex; align-items: center; gap: 12px; padding: 11px 14px; border-radius: 14px; border: 1.5px solid transparent; cursor: pointer; transition: transform .15s; text-align: left; }
.upi-btn:active { transform: scale(.97); }
.phonepe-btn { background: #f5f0ff; border-color: #c4b5fd; }
.gpay-btn    { background: #ffffff; border-color: #86efac; }
.other-btn   { background: #f8fafc; border-color: #e2e8f0; }
.upi-logo { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; flex-shrink: 0; }
.phonepe-logo { background: #5a2d9c; color: white; }
.gpay-logo    { color: white; }
.other-logo   { background: #64748b; color: white; font-size: 16px; }
.upi-info { flex: 1; display: flex; flex-direction: column; gap: 1px; }
.upi-name { font-size: 13px; font-weight: 700; color: #0f172a; }
.upi-desc { font-size: 11px; color: #64748b; }
.upi-arrow { font-size: 20px; color: #cbd5e1; }

/* OR DIVIDER */
.or-divider { display: flex; align-items: center; gap: 10px; margin: 16px 0 14px; }
.or-divider::before, .or-divider::after { content: ''; flex: 1; height: 1px; background: #e2e8f0; }
.or-divider span { font-size: 11px; color: #94a3b8; font-weight: 600; white-space: nowrap; }

/* SCANNER BUTTONS */
.scanner-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.scanner-btn { width: 100%; display: flex; align-items: center; gap: 12px; padding: 11px 14px; border-radius: 14px; border: 1.5px solid transparent; cursor: pointer; transition: transform .15s; text-align: left; }
.scanner-btn:active { transform: scale(.97); }
.phonepe-scan { background: #f5f0ff; border-color: #c4b5fd; }
.gpay-scan    { background: #ffffff; border-color: #86efac; }
.other-scan   { background: #f8fafc; border-color: #e2e8f0; }
.scanner-logo { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; flex-shrink: 0; }
.scan-qr-icon { width: 18px; height: 18px; flex-shrink: 0; }

/* UPI ID ROW */
.upi-id-row { display: flex; align-items: center; gap: 8px; background: #f8fafc; border-radius: 12px; padding: 10px 14px; margin-bottom: 4px; }
.upi-id-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .5px; flex-shrink: 0; }
.upi-id-val { flex: 1; font-size: 13px; font-weight: 600; color: #0f172a; font-family: monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.copy-btn { font-size: 11px; font-weight: 700; color: #7c3aed; background: #ede9fe; border: none; border-radius: 8px; padding: 4px 10px; cursor: pointer; flex-shrink: 0; font-family: 'Poppins', sans-serif; transition: background .15s; }
.copy-btn:active { background: #ddd6fe; }

.pay-secure { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 14px; }
</style>