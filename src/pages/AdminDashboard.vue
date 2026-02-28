<template>
  <div class="admin-page">
    <div class="admin-card">
      <!-- HEADER -->
      <div class="header">
        <div>
          <h2>Swaraj Mess Admin</h2>
          <p class="date">{{ today }}</p>
        </div>
        <button class="logout-btn" @click="logout">Logout</button>
      </div>

      <div class="mess-toggle">
        <span class="status-text">
          Mess Status :
          <b :class="messOpen ? 'open' : 'closed'">
            {{ messOpen ? 'OPEN' : 'CLOSED' }}
          </b>
        </span>
        <label class="switch">
          <input type="checkbox" v-model="messOpen" @change="saveMessStatus" :disabled="statusLoading" />
          <span class="slider"></span>
        </label>
      </div>

      <!-- MEAL TYPE -->
      <!-- MEAL TYPE -->
      <div class="form-group">
        <label>Meal Type</label>

        <Multiselect v-model="mealType" :options="mealOptions" label="label" track-by="value" :multiple="false"
          :close-on-select="true" :show-labels="false" placeholder="Select Meal Type" class="multi"
          :disabled="!messOpen || mealsLoading" />
      </div>

      <!-- MENU SECTION -->
      <div class="menu-section">
        <label>Menu Items</label>

        <div class="menu-row" v-for="(row, index) in rows" :key="index">
          <Multiselect v-model="row.selected" :options="allItems" label="label" track-by="value" :multiple="false"
            :taggable="true" :close-on-select="true" :show-labels="false" placeholder="Select food item" class="multi"
            :disabled="!messOpen" @tag="addNewMeal">

            <template #noResult="{ search }">
              <div class="add-new-option" @click="addNewMeal(search)">
                ➕ Add "{{ search }}"
              </div>
            </template>
            <template #option="{ option }">
              <div class="option-row">
                <span>{{ option.label }}</span>
                <i class="pi pi-trash option-delete" @click.stop="deleteMeal(option)"></i>
              </div>
            </template>

          </Multiselect>
          <button class="remove-btn" @click="removeRow(index)"> <i class="pi pi-trash delete-btn-color"></i> </button>
        </div>
        <button class="add-btn" @click="addRow">
          + Add More Item
        </button>
      </div>

      <!-- SAVE -->
      <button class="save-btn" @click="saveMenu" :disabled="loading || !messOpen">
        <span v-if="loading" class="spinner"></span>
        {{ loading ? 'Saving...' : 'Save Menu' }}
      </button>
      <p v-if="success" class="success-msg">
        ✔ Menu Saved Successfully
      </p>
      <div class="dashboard-container">
        <div class="dashboard-header">
          <h2>Dashboard</h2>
          <p class="sub-text">Visitor Analytics Overview</p>
        </div>

        <!-- Top Stats -->
        <div class="stats-grid">
          <div class="stat-card">
            <p>Total Visitors</p>
            <h3>{{ stats.total_visits }}</h3>
          </div>

          <div class="stat-card">
            <p>Today's Visitors</p>
            <h3>{{ stats.today_visits }}</h3>
          </div>
        </div>

        <!-- Monthly Breakdown -->
        <div class="monthly-section">
          <h4>Monthly Overview</h4>

          <div class="month-grid">
            <div v-for="month in monthlyStats" :key="month.name" class="month-card">
              <span>{{ month.name }}</span>
              <strong>{{ month.count }}</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- ================= CURRENT MEALS LIST ================= -->
      <div v-if="messOpen" class="current-section">
        <h3> Today's Menu <p class="date">{{ today }}</p>
        </h3>

        <div v-if="currentLoading" class="loading-text">
          Loading meals...
        </div>

        <!-- BREAKFAST -->
        <div v-if="groupedMeals.breakfast.length" class="meal-block">
          <h4 class="breakfast">🌅 Breakfast</h4>
          <div class="meal-item" v-for="meal in groupedMeals.breakfast" :key="meal.id">
            <span>{{ meal.meal_name }}</span>
            <i class="pi pi-trash delete-icon" @click="deleteCurrentMeal(meal.id)"></i>
          </div>
        </div>

        <!-- LUNCH -->
        <div v-if="groupedMeals.lunch.length" class="meal-block">
          <h4 class="breakfast"> 🍛 Lunch</h4>
          <div class="meal-item" v-for="meal in groupedMeals.lunch" :key="meal.id">
            <span>{{ meal.meal_name }}</span>
            <i class="pi pi-trash delete-icon" @click="deleteCurrentMeal(meal.id)"></i>
          </div>
        </div>

        <!-- DINNER -->
        <div v-if="groupedMeals.dinner.length" class="meal-block">
          <h4 class="breakfast">🌙 Dinner</h4>
          <div class="meal-item" v-for="meal in groupedMeals.dinner" :key="meal.id">
            <span>{{ meal.meal_name }}</span>
            <i class="pi pi-trash delete-icon" @click="deleteCurrentMeal(meal.id)"></i>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import Multiselect from 'vue-multiselect'
import {
  addMealApi, updateUserStatusApi, getUserStatusApi, getMealsApi, deleteMealApi,
  getCurrentMealsApi, softDeleteMealApi, getVisitsApi
} from '@/services/api'
import { useToast } from "vue-toastification"

const toast = useToast()
const router = useRouter()
const messOpen = ref(true)
const statusLoading = ref(false)
const success = ref(false)
const loading = ref(false)
const rows = ref([{ selected: null }])
const allItems = ref([])
const mealsLoading = ref(false)
const addingMeal = ref(false)
const mealType = ref(null)
const currentMeals = ref([])
const currentLoading = ref(false)
const stats = ref({
  total_visits: 0,
  today_visits: 0,
  month_visits: 0
})
const monthlyStats = ref([
  { name: "Jan", count: 30 },
  { name: "Feb", count: 110 },
  { name: "Mar", count: 40 },
  { name: "Apr", count: 50 },
  { name: "May", count: 0 },
  { name: "Jun", count: 0 },
  { name: "Jul", count: 0 },
  { name: "Aug", count: 0 },
  { name: "Sep", count: 0 },
  { name: "Oct", count: 0 },
  { name: "Nov", count: 0 },
  { name: "Dec", count: 0 }
])
/* ---------- DATE ---------- */
const today = new Date().toLocaleDateString('en-IN', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric'
})
const mealOptions = [
  { label: 'Breakfast', value: 0 },
  { label: 'Lunch', value: 1 },
  { label: 'Dinner', value: 2 }
]
/* ---------- MULTISELECT ROWS ---------- */
function addRow() {
  rows.value.push({ selected: [] })
}

const groupedMeals = computed(() => {
  return {
    breakfast: currentMeals.value.filter(m => m.meal_flag === 0),
    lunch: currentMeals.value.filter(m => m.meal_flag === 1),
    dinner: currentMeals.value.filter(m => m.meal_flag === 2)
  }
})

async function deleteMeal(option) {
  try {
    await deleteMealApi(option.value)
    allItems.value = allItems.value.filter(
      item => item.value !== option.value
    )
    rows.value.forEach(row => {
      if (row.selected?.value === option.value) {
        row.selected = null
      }
    })
    toast.warning("Meal deleted successfully")
  } catch (error) {
    toast.error("Failed to delete meal")
  }
}

async function addNewMeal(searchText) {
  const trimmed = searchText?.trim()
  if (!trimmed) return
  const exists = allItems.value.find(
    item => item.label.toLowerCase() === trimmed.toLowerCase()
  )
  if (exists) {
    toast.info("Meal already exists")
    return
  }
  addingMeal.value = true
  try {
    await addMealApi({
      meal_flag: mealType.value.value ?? 0,
      meal_name: trimmed
    })

    toast.success("Meal added successfully")
    await fetchMeals()
    const created = allItems.value.find(
      item => item.label.toLowerCase() === trimmed.toLowerCase()
    )
    if (created) {
      rows.value[rows.value.length - 1].selected = created
    }
  } catch (error) {
    toast.error("Failed to add meal")
  } finally {
    addingMeal.value = false
  }
}

function logout() {
  localStorage.removeItem('token')
  router.push('/login')
}

async function fetchMeals() {
  mealsLoading.value = true
  try {
    const res = await getMealsApi()
    allItems.value = res.data.map(meal => ({
      label: meal.meal_name,
      value: meal.id
    }))
  } catch (error) {
    toast.error("Failed to fetch meals")
  } finally {
    mealsLoading.value = false
  }
}

async function fetchMessStatus() {
  try {
    const res = await getUserStatusApi()
    messOpen.value = res.data.status_flag == "1"
  } catch (error) {
    console.log('Failed to fetch status')
  }
}

/* ---------- SAVE MENU (API INTEGRATION) ---------- */
async function saveMessStatus() {
  const previousValue = !messOpen.value
  statusLoading.value = true
  try {
    await updateUserStatusApi(messOpen.value ? 1 : 0)
  } catch (error) {
    messOpen.value = previousValue
    toast.error('Failed to update mess status')
  } finally {
    statusLoading.value = false
  }
}

async function saveMenu() {
  if (!mealType.value) {
    toast.error('Please select meal type')
    return
  }
  const selectedItems = rows.value
    .map(row => row.selected)
    .filter(Boolean)

  if (selectedItems.length === 0) {
    toast.error('Please select at least one item')
    return
  }
  loading.value = true
  success.value = false

  try {
    await Promise.all(
      selectedItems.map(item =>
        addMealApi({
          meal_flag: mealType.value.value,
          meal_name: item.label
        })
      )
    )
    toast.success("Menu saved successfully")
    success.value = true
    rows.value = [{ selected: null }]
    mealType.value = null

  } catch (error) {
    toast.error('Failed to save menu')
  } finally {
    loading.value = false
  }
}
const removeRow = index => {
  if (rows.value.length === 1) {
    toast.warning("At least one item is required")
    return
  }
  rows.value.splice(index, 1)
}

async function fetchCurrentMeals() {
  currentLoading.value = true
  try {
    const res = await getCurrentMealsApi()
    currentMeals.value = res.data
  } catch (error) {
    toast.error("Failed to fetch current meals")
  } finally {
    currentLoading.value = false
  }
}
async function deleteCurrentMeal(id) {
  try {
    await softDeleteMealApi(id)
    toast.success("Meal removed")
    fetchCurrentMeals()
  } catch (error) {
    toast.error("Failed to delete meal")
  }
}
async function fetchVisits() {
  try {
    const res = await getVisitsApi()
    stats.value = res.data
  } catch (error) {
    toast.error("Failed to fetch visitor stats")
  }
}
onMounted(() => {
  fetchMessStatus()
  fetchMeals()
  fetchCurrentMeals()
  fetchVisits()
})
</script>
<style scoped>
.admin-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30px 16px;

  background:
    radial-gradient(circle at 15% 20%, rgba(14, 165, 233, 0.15), transparent 40%),
    radial-gradient(circle at 85% 10%, rgba(59, 130, 246, 0.12), transparent 40%),
    linear-gradient(180deg, #f8fafc, #eef2f7);

  font-family: 'Inter', sans-serif;
}

/* ============================= */
/* MAIN CARD */
/* ============================= */

.admin-card {
  width: 100%;
  max-width: 620px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(18px);
  border-radius: 22px;
  padding: 28px 24px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 2px 0 2px -1px rgba(0, 0, 0, 0.2), 4px 0 3px 0 rgba(0, 0, 0, 0.14), 1px 0 10px 0 rgba(0, 0, 0, 0.12);

  box-shadow:
    0 20px 40px rgba(15, 23, 42, .08),
    0 4px 12px rgba(15, 23, 42, .05);

  animation: fadeSlide .5s ease;
}

@keyframes fadeSlide {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ============================= */
/* HEADER */
/* ============================= */

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, #0ea5e9, #2563eb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.date {
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
}

.logout-btn {
  background: white;
  border: 1px solid #fecaca;
  color: #ef4444;
  padding: 8px 14px;
  border-radius: 14px;
  font-weight: 600;
  font-size: 13px;
  transition: all .2s ease;
}

.logout-btn:hover {
  background: #fee2e2;
  box-shadow: 0 6px 14px rgba(239, 68, 68, .25);
  transform: translateY(-2px);
}

/* ============================= */
/* MESS STATUS CARD */
/* ============================= */

.mess-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 14px 16px;
  border-radius: 16px;

  background: linear-gradient(135deg, #f1f5f9, #ffffff);
  border: 1px solid #e2e8f0;

  margin-bottom: 22px;
  transition: all .2s ease;
}

.mess-toggle:hover {
  box-shadow: 0 10px 25px rgba(2, 132, 199, .15);
}

.status-text {
  font-size: 14px;
  font-weight: 600;
}

.open {
  color: #0ea5e9;
}

.closed {
  color: #ef4444;
}

/* ============================= */
/* MODERN SWITCH */
/* ============================= */

.switch {
  position: relative;
  width: 52px;
  height: 28px;
}

.switch input {
  display: none;
}

.slider {
  position: absolute;
  inset: 0;
  border-radius: 50px;
  background: #cbd5e1;
  transition: .3s;
  cursor: pointer;
}

.slider::before {
  content: "";
  position: absolute;
  width: 22px;
  height: 22px;
  top: 3px;
  left: 3px;
  background: white;
  border-radius: 50%;
  transition: .3s;
  box-shadow: 0 3px 8px rgba(0, 0, 0, .2);
}

.switch input:checked+.slider {
  background: linear-gradient(135deg, #0ea5e9, #2563eb);
}

.switch input:checked+.slider::before {
  transform: translateX(24px);
}

/* ============================= */
/* FORM ELEMENTS */
/* ============================= */

.form-group {
  margin-bottom: 20px;
}

label {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 6px;
  display: block;
  color: #334155;
}

.input {
  width: 100%;
  height: 48px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  padding: 0 14px;
  font-size: 14px;
  background: #f9fafb;
  transition: all .2s ease;
}

.input:focus {
  outline: none;
  border-color: #0ea5e9;
  background: white;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, .15);
}

/* ============================= */
/* MENU SECTION */
/* ============================= */

.menu-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.multi {
  flex: 1;
}

.remove-btn {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  border: none;
  background: #fff1f2;
  border: 1px solid #fecaca;
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all .2s ease;
}

.remove-btn:hover {
  background: #fee2e2;
  transform: scale(1.07);
}

/* ============================= */
/* ADD BUTTON */
/* ============================= */

.add-btn {
  width: 100%;
  height: 48px;
  border-radius: 14px;
  border: 2px dashed #cbd5e1;
  background: #f8fafc;
  font-weight: 600;
  color: #334155;
  margin-top: 8px;
  transition: all .2s ease;
}

.add-btn:hover {
  background: #e0f2fe;
  border-color: #0ea5e9;
}

/* ============================= */
/* SAVE BUTTON */
/* ============================= */
.save-btn {
  width: 100%;
  height: 54px;
  border-radius: 16px;
  border: none;
  margin-top: 20px;
  color: white;
  font-weight: 700;
  font-size: 15px;

  background: linear-gradient(135deg, #0ea5e9, #2563eb);
  box-shadow: 0 12px 25px rgba(37, 99, 235, .35);
  transition: all .25s ease;
}

.save-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 35px rgba(37, 99, 235, .45);
}

.success-msg {
  text-align: center;
  margin-top: 14px;
  color: #16a34a;
  font-weight: 600;
}


@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Header */
.dashboard-header {
  margin-bottom: 16px;
}

.dashboard-header h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
}

.sub-text {
  font-size: 13px;
  color: #6b7280;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

/* Stat Card */
.stat-card {
  background: #ffffff;
  padding: 14px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  transition: 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-card p {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 6px;
}

.stat-card h3 {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}

.sub-text {
  font-size: 13px;
  color: #6b7280;
  margin-top: 4px;
}

/* ===== MONTHLY SECTION ===== */
.monthly-section {
  margin-top: 30px;
}

.monthly-section h4 {
  font-size: 15px;
  margin-bottom: 12px;
  color: #374151;
}

/* Month Grid */
.month-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.month-card {
  padding: 10px;
  background: #f9fafb;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #e5e7eb;
}

.month-card span {
  font-size: 11px;
  color: #6b7280;
}

.month-card strong {
  display: block;
  margin-top: 3px;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

/* ================= MOBILE VIEW ================= */
@media (max-width: 600px) {

  .dashboard-container {
    padding: 0px 14px 0px 14px;
  }

  .sub-text {
    font-size: 11px;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .stat-card {
    padding: 12px;
  }

  .stat-card h3 {
    font-size: 18px;
  }

  /* Make month grid scrollable */
  .month-grid {
    display: flex;
    overflow-x: auto;
    gap: 8px;
  }

  .month-card {
    min-width: 70px;
    padding: 8px;
  }

  .month-card strong {
    font-size: 13px;
  }
}

/* ============================= */
/* MOBILE OPTIMIZATION */
/* ============================= */
@media (max-width: 520px) {

  .admin-page {
    align-items: flex-start;
    padding-top: 20px;
  }

  .admin-card {
    padding: 20px 16px;
    border-radius: 18px;
    box-shadow: 2px 0 2px -1px rgba(0, 0, 0, 0.2), 4px 0 3px 0 rgba(0, 0, 0, 0.14), 1px 0 10px 0 rgba(0, 0, 0, 0.12);
  }

  .header h2 {
    font-size: 18px;
  }

  .save-btn {
    height: 50px;
  }
}

/* ================= CURRENT MEALS ================= */

.current-section {
  margin-top: 28px;
  padding-top: 18px;
  border-top: 1px solid #e2e8f0;
}

.current-section h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #0f172a;
}

.meal-block {
  margin-bottom: 16px;
}

.meal-block h4 {
  font-size: 14px;
  font-weight: 600;
  color: #2563eb;
  margin-bottom: 8px;
}

.meal-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: 12px;
  background: #e9f3ff;
  margin-bottom: 6px;
  transition: .2s ease;
}

.meal-item:hover {
  background: #e0f2fe;
}

.delete-icon {
  color: #ef4444;
  cursor: pointer;
  font-size: 14px;
}

.delete-icon:hover {
  transform: scale(1.1);
}

.loading-text {
  font-size: 13px;
  color: #64748b;
}

.breakfast {
  align-items: center;
  justify-content: center;
  display: flex;
  gap: 10px;
}
</style>