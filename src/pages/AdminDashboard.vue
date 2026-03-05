<template>
  <div class="admin-page">
    <div class="admin-card">
      <!-- HEADER -->
      <div class="header">
        <div>
          <h2><span class="mess-name">{{ messName }} </span> Admin</h2>
          <p class="date">{{ today }}</p>
        </div>
        <button class="logout-btn" @click="logout">Logout</button>
      </div>
      <div class="dashboard-container">
        <div class="dashboard-header">
          <h2 class="dashboard-title">Dashboard</h2>
          <p class="sub-text">Visitor Analytics Overview</p>
        </div>

        <!-- Top Stats -->
        <div class="stats-grid">
          <div class="stat-card">
            <p>Total</p>
            <h3>{{ stats.total_visits }}</h3>
          </div>

          <div class="stat-card">
            <p>Monthly</p>
            <h3>{{ stats.month_visits }}</h3>
          </div>

          <div class="stat-card">
            <p>Today's</p>
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
      <hr class="horizontal" />
      <!-- ================= TABS ================= -->
      <div class="tabs-container">
        <button :class="['tab-btn', activeTab === 'add' ? 'active-tab' : '']" @click="activeTab = 'add'">
          + Add Meal
        </button>

        <button :class="['tab-btn', activeTab === 'list' ? 'active-tab' : '']" @click="activeTab = 'list'">
          📋 Menu List
        </button>
      </div>
      <div v-if="activeTab === 'add'">
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
        <div class="form-group">
          <label>Meal Type<span style="color: red;"> *</span></label>

          <Multiselect v-model="mealType" :options="mealOptions" label="label" track-by="value" :multiple="false"
            :close-on-select="true" :show-labels="false" placeholder="Select Meal Type" class="multi"
            :disabled="!messOpen || mealsLoading" />
        </div>
        <!-- TITLE INPUT -->
        <div class="form-group">
          <label>Menu Title</label>
          <input type="text" v-model="menuTitle" placeholder="Enter Title (Example: Veg Thali)" class="title-input"
            :disabled="!messOpen" />
        </div>
        <!-- MENU SECTION -->
        <div class="menu-section">
          <div class="menu-header">
            <label>Menu Items<span style="color: red;"> *</span></label>

            <!-- Toggle Price Input -->
            <div class="price-toggle">
              <input type="checkbox" id="showPrice" v-model="showPrice" />
              <label for="showPrice">Show Price</label>
            </div>
          </div>
          <!-- <label>Menu Items</label> -->

          <div class="menu-row" v-for="(row, index) in rows" :key="index">
            <Multiselect v-model="row.selected" :options="allItems" label="label" track-by="value" :multiple="false"
              :taggable="true" :tag-placeholder="''" :close-on-select="true" :show-labels="false"
              placeholder="Select food item" class="multi" :disabled="!messOpen" @tag="addNewMeal">
              <template #option="{ option }">
                <div class="option-row">
                  <span>{{ option.label }}</span>
                  <i class="pi pi-trash option-delete" @click.stop="deleteMeal(option)"></i>
                </div>
              </template>

            </Multiselect>
            <input v-if="showPrice" type="number" v-model="row.price" placeholder="Enter price" min="0"
              class="price-input" />
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
      </div>

      <!-- ================= IMAGE UPLOAD SECTION ================= -->
      <div v-if="activeTab === 'list'">
        <div class="image-upload-section">
          <h3 class="upload-title">Meal Images (Max 3)</h3>

          <!-- Custom File Upload -->
          <label class="custom-file-upload">
            <input type="file" accept="image/*" multiple @change="handleImageSelect" />
            <span>📷 Choose Images</span>
          </label>

          <!-- Preview -->
          <div class="preview-grid" v-if="imagePreviews.length">
            <div v-for="(img, index) in imagePreviews" :key="index" class="preview-box">
              <img :src="img" />
              <button class="remove-img-btn" @click="removeImage(index)">✖</button>
            </div>
          </div>

          <!-- Upload Button -->
          <button class="upload-btn" @click="uploadImages" :disabled="imageFiles.length === 0 || uploadingImages">
            <span v-if="uploadingImages" class="spinner"></span>
            {{ uploadingImages ? 'Uploading...' : 'Upload Images' }}
          </button>

          <!-- Uploaded Images -->
          <div class="uploaded-grid" v-if="uploadedImages.length">
            <div v-for="(img, index) in uploadedImages" :key="index" class="uploaded-box">
              <img :src="img" />
              <button class="remove-img-btn" @click="deleteUploadedImage(img)">✖</button>
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
          <div v-if="Object.keys(groupedMeals.breakfast).length" class="meal-block">
            <div class="meal-heading">
              <h4>🌅 Breakfast</h4>
              <button class="delete-type-btn" @click="deleteMealType(0, 'Breakfast')">
                Delete All
              </button>
            </div>

            <div v-for="(meals, title) in groupedMeals.breakfast" :key="title">

              <!-- Show Title Only If Not General -->
              <div v-if="title !== 'General'" class="group-title">
                {{ title }}
              </div>

              <div class="meal-item" v-for="meal in meals" :key="meal.id">
                <div class="meal-left">
                  <span class="meal-name">{{ meal.meal_name }}</span>
                </div>

                <div class="meal-right">
                  <span v-if="meal.meal_price > 0" class="price">
                    ₹{{ meal.meal_price }}
                  </span>

                  <i class="pi pi-trash delete-icon" @click="deleteCurrentMeal(meal.id)"></i>
                </div>
              </div>

            </div>
          </div>

          <!-- LUNCH -->
          <div v-if="Object.keys(groupedMeals.lunch).length" class="meal-block">
            <div class="meal-heading">
              <h4>🍛 Lunch</h4>
              <button class="delete-type-btn" @click="deleteMealType(1, 'Breakfast')">
                Delete All
              </button>
            </div>

            <div v-for="(meals, title) in groupedMeals.lunch" :key="title">

              <div v-if="title !== 'General'" class="group-title">
                {{ title }}
              </div>

              <div class="meal-item" v-for="meal in meals" :key="meal.id">
                <div class="meal-left">
                  <span class="meal-name">{{ meal.meal_name }}</span>
                </div>

                <div class="meal-right">
                  <span v-if="meal.meal_price > 0" class="price">
                    ₹{{ meal.meal_price }}
                  </span>

                  <i class="pi pi-trash delete-icon" @click="deleteCurrentMeal(meal.id)"></i>
                </div>
              </div>

            </div>
          </div>

          <!-- DINNER -->
          <div v-if="Object.keys(groupedMeals.dinner).length" class="meal-block">
            <div class="meal-heading">
              <h4>🌙 Dinner</h4>
              <button class="delete-type-btn" @click="deleteMealType(2, 'Breakfast')">
                Delete All
              </button>
            </div>

            <div v-for="(meals, title) in groupedMeals.dinner" :key="title" class="title-group">

              <!-- Show Title Only If Exists -->
              <div v-if="title !== 'General'" class="group-title">
                {{ title }}
              </div>

              <!-- Items Under Title -->
              <div class="meal-item" v-for="meal in meals" :key="meal.id">
                <div class="meal-left">
                  <span class="meal-name">{{ meal.meal_name }}</span>
                </div>

                <div class="meal-right">
                  <span v-if="meal.meal_price > 0" class="price">
                    ₹{{ meal.meal_price }}
                  </span>

                  <i class="pi pi-trash delete-icon" @click="deleteCurrentMeal(meal.id)"></i>
                </div>
              </div>

            </div>
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
  addMealApi, updateUserStatusApi, getUserStatusApi, getMealsApi, deleteMealApi, deleteMealsByFlagApi,
  getCurrentMealsApi, softDeleteMealApi, getVisitsApi, uploadMealImagesApi, getMealImagesApi, deleteMealImagesApi
} from '@/services/api'
import { useToast } from "vue-toastification"

const toast = useToast()
const router = useRouter()
const activeTab = ref('add') // default tab
const messOpen = ref(true)
const statusLoading = ref(false)
const success = ref(false)
const loading = ref(false)
const menuTitle = ref("")
const rows = ref([{ selected: null, price: null }])
const allItems = ref([])
const mealsLoading = ref(false)
const addingMeal = ref(false)
const mealType = ref(null)
const currentMeals = ref([])
const currentLoading = ref(false)
const showPrice = ref(true)
const messName = ref('')
const stats = ref({
  total_visits: 0,
  today_visits: 0,
  month_visits: 0
})
const monthlyStats = ref([])
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
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
// img upload
const imageFiles = ref([])
const imagePreviews = ref([])
const uploadedImages = ref([])
const uploadingImages = ref(false)
/* ---------- MULTISELECT ROWS ---------- */
function addRow() {
  rows.value.push({ selected: [] })
}

const groupedMeals = computed(() => {

  function groupByTitle(meals) {
    const grouped = {}

    meals.forEach(meal => {
      const title = meal.title || "General"

      if (!grouped[title]) {
        grouped[title] = []
      }

      grouped[title].push(meal)
    })

    return grouped
  }

  return {
    breakfast: groupByTitle(
      currentMeals.value.filter(m => m.meal_flag === 0)
    ),
    lunch: groupByTitle(
      currentMeals.value.filter(m => m.meal_flag === 1)
    ),
    dinner: groupByTitle(
      currentMeals.value.filter(m => m.meal_flag === 2)
    )
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
  // ✅ Create temporary local item
  const tempItem = {
    label: trimmed,
    value: `temp_${Date.now()}`, // temporary ID
    isNew: true
  }
  allItems.value.push(tempItem)
  rows.value[rows.value.length - 1].selected = tempItem
}
/* ---------- LOGOUT ---------- */
async function deleteUploadedImage(imageUrl) {
  try {
    const imageName = imageUrl.split('/').pop()
    await deleteMealImagesApi({
      image_names: [imageName]
    })
    toast.success("Image deleted successfully")
    uploadedImages.value = uploadedImages.value.filter(
      img => img !== imageUrl
    )
  } catch (error) {
    toast.error("Failed to delete image")
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
    messName.value = res.data.user_name
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
    .filter(row =>
      row.selected &&
      row.selected.label &&
      row.selected.label.trim() !== ''
    )
    .map(row => ({
      meal_flag: mealType.value.value,
      meal_name: row.selected.label.trim(),
      meal_price: row.price && row.price > 0 ? row.price : 0,
      title: menuTitle.value?.trim() || 'Menu'  // ✅ ADD TITLE HERE
    }))

  if (selectedItems.length === 0) {
    toast.error('Please select at least one item')
    return
  }
  loading.value = true
  success.value = false
  try {
    await addMealApi({ meals: selectedItems })
    toast.success("Menu saved successfully")
    success.value = true
    rows.value = [{ selected: null, price: null }]
    mealType.value = null
    menuTitle.value = ""
    fetchCurrentMeals()
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
    // update main stats
    stats.value.total_visits = res.data.total_visits
    stats.value.today_visits = res.data.today_visits
    stats.value.month_visits = res.data.current_month_visits
    // map API monthly stats to names
    monthlyStats.value = res.data.monthly_stats.map(item => ({
      name: monthNames[item.month - 1],
      count: item.monthly_visits
    }))
  } catch (error) {
    toast.error("Failed to fetch visitor stats")
  }
}
// img
function handleImageSelect(event) {
  const files = Array.from(event.target.files)

  if (files.length + imageFiles.value.length > 3) {
    toast.error("Maximum 3 images allowed")
    return
  }

  files.forEach(file => {
    imageFiles.value.push(file)
    imagePreviews.value.push(URL.createObjectURL(file))
  })
}
function removeImage(index) {
  imageFiles.value.splice(index, 1)
  imagePreviews.value.splice(index, 1)
}
async function uploadImages() {
  if (imageFiles.value.length === 0) return

  const formData = new FormData()

  imageFiles.value.forEach(file => {
    formData.append('images', file)
  })

  uploadingImages.value = true

  try {
    await uploadMealImagesApi(formData)
    toast.success("Images uploaded successfully")

    imageFiles.value = []
    imagePreviews.value = []

    fetchMealImages()

  } catch (error) {
    toast.error("Failed to upload images")
  } finally {
    uploadingImages.value = false
  }
}
async function fetchMealImages() {
  try {
    const res = await getMealImagesApi()
    uploadedImages.value = res.data.images // adjust if backend format differs
  } catch (error) {
    toast.error("Failed to load images")
  }
}
async function deleteMealType(flag, typeName) {
  toast.warning(`Click again to confirm deleting all ${typeName} meals`, { timeout: 4000 })
  if (deleteMealType.confirming === flag) {
    try {
      const res = await deleteMealsByFlagApi(flag)
      if (res.status === 200) {
        toast.success(`${typeName} meals deleted successfully`)
      }
      fetchCurrentMeals()
    } catch (error) {
      toast.error(`Failed to delete ${typeName} meals`)
    }
    deleteMealType.confirming = null
  } else {
    deleteMealType.confirming = flag
  }
}

onMounted(() => {
  fetchMessStatus()
  fetchMeals()
  fetchCurrentMeals()
  fetchVisits()
  fetchMealImages()
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

.mess-name {
  text-transform: capitalize;
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
  flex: 2;
}

/* Menu header with toggle */
.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.price-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #334155;
  font-weight: 500;
}

.price-toggle input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #0ea5e9;
  cursor: pointer;
  margin: 0px 5px 5px 5px;
}

.price-input {
  flex: 1;
  /* make input smaller but aligned */
  height: 44px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  font-size: 14px;
  background: #f9fafb;
  transition: all 0.2s ease;
}

.price-input:focus {
  outline: none;
  border-color: #0ea5e9;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15);
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
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  width: 100%;
  height: 46px;
  border-radius: 14px;
  border: 2px dashed #cbd5e1;
  background: #f8fafc;
  font-weight: 600;
  color: #334155;
  margin-top: 10px;
  transition: all 0.2s ease;
}

/* ================= MOBILE OPTIMIZED MENU ROWS ================= */
@media (max-width: 600px) {
  .menu-row {
    display: grid;
    grid-template-columns: 1fr auto auto;
    /* select | price | remove */
    gap: 8px;
    align-items: center;
    margin-bottom: 12px;
  }

  .multi {
    width: 100%;
    grid-column: 1 / 2;
  }

  .price-input {
    width: 100%;
    max-width: 80px;
    /* compact input */
    grid-column: 2 / 3;
    text-align: right;
  }

  .remove-btn {
    grid-column: 3 / 4;
    justify-self: end;
    width: 38px;
    height: 38px;
  }

  /* Stack on very narrow screens */
  @media (max-width: 380px) {
    .menu-row {
      grid-template-columns: 1fr;
      /* stack everything */
      gap: 6px;
    }

    .price-input,
    .remove-btn {
      width: 100%;
      justify-self: stretch;
    }
  }
}

.price {
  text-align: right;
  font-weight: 600;
  color: #334155;
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
  padding-top: 5px;
}

.dashboard-header h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
  margin-top: 0px
}

.dashboard-title {
  font-size: 16px;
  color: #f34500;
}

.sub-text {
  font-size: 13px;
  color: #6b7280;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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
    /* grid-template-columns: 1fr 1fr; */
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  .stat-card {
    padding: 1px;
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
  border-radius: 5px;
  padding: 7px 0px;
  display: flex;
  justify-content: center;
  margin: auto;
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
  transform: translateY(-1px);
}

.meal-name {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meal-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.price {
  font-weight: 600;
  color: #059669;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 13px;
}

.delete-icon {
  color: #ef4444;
  cursor: pointer;
  font-size: 17px;
  transition: 0.2s;
}

.delete-icon:hover {
  transform: scale(1.15);
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

.horizontal {
  margin: 20px 0px;
  border: 1px solid #e2e8f0;
  ;
}

.image-upload-section {
  margin-top: 20px;
}

.preview-grid,
.uploaded-grid {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.preview-box {
  position: relative;
}

.preview-box img,
.uploaded-grid img {
  width: 98px;
  height: 98px;
  object-fit: cover;
  border-radius: 8px;
}

.preview-box button {
  position: absolute;
  top: -6px;
  right: -6px;
  background: red;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
}

/* ================= IMAGE UPLOAD ================= */

.upload-title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #0f172a;
}

/* Hide default input */
.custom-file-upload input {
  display: none;
}

/* Styled File Button */
.custom-file-upload {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 48px;
  border-radius: 14px;
  border: 2px dashed #cbd5e1;
  background: #f8fafc;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  transition: all 0.25s ease;
}

.custom-file-upload:hover {
  background: #e0f2fe;
  border-color: #0ea5e9;
  transform: translateY(-2px);
}

/* Upload Button (Gradient like Save) */
.upload-btn {
  width: 100%;
  height: 50px;
  border-radius: 16px;
  border: none;
  margin-top: 16px;
  color: white;
  font-weight: 700;
  font-size: 14px;

  background: linear-gradient(135deg, #0ea5e9, #2563eb);
  box-shadow: 0 10px 20px rgba(37, 99, 235, 0.35);
  transition: all 0.25s ease;
}

.upload-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px rgba(37, 99, 235, 0.45);
}

.upload-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

/* Preview Grid */
.preview-grid,
.uploaded-grid {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 14px;
}

.preview-box {
  position: relative;
}

/* Remove Button */
.remove-img-btn {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 22px;
  height: 22px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 12px;
  cursor: pointer;
  transition: 0.2s;
}

.remove-img-btn:hover {
  transform: scale(1.1);
}

/* Spinner */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top: 2px solid white;
  border-radius: 50%;
  display: inline-block;
  animation: spin 0.8s linear infinite;
  margin-right: 6px;
}

/* ================= TABS ================= */

.tabs-container {
  display: flex;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 16px;
  margin-bottom: 22px;
  border: 1px solid #e2e8f0;
}


.tab-btn {
  flex: 1;
  height: 42px;
  border-radius: 12px;
  border: none;
  background: transparent;
  font-weight: 600;
  font-size: 14px;
  color: #475569;
  transition: all 0.25s ease;
  position: relative;
  z-index: 1;
}

.tab-btn:hover {
  color: #0ea5e9;
}

/* Active Tab */
.active-tab {
  background: white;
  color: #0ea5e9;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.06),
    0 2px 6px rgba(0, 0, 0, 0.04);
}

/* Image Section Inside List */
.menu-images-section {
  margin-bottom: 20px;
}

.menu-images-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #0f172a;
}

.uploaded-box {
  position: relative;
}

.uploaded-box img {
  width: 98px;
  height: 98px;
  object-fit: cover;
  border-radius: 8px;
}

.uploaded-box .remove-img-btn {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 22px;
  height: 22px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 12px;
  cursor: pointer;
  transition: 0.2s;
}

.uploaded-box .remove-img-btn:hover {
  transform: scale(1.1);
}

/* ================= MENU TITLE INPUT ================= */

.menu-title-input {
  width: 100%;
  height: 50px;
  border-radius: 16px;
  border: 1.5px solid #e2e8f0;
  padding: 0 16px;
  font-size: 15px;
  font-weight: 500;
  background: linear-gradient(145deg, #f8fafc, #ffffff);
  transition: all 0.25s ease;
}

.menu-title-input::placeholder {
  color: #94a3b8;
  font-weight: 400;
}

.menu-title-input:focus {
  outline: none;
  border-color: #2563eb;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
  transform: translateY(-1px);
}

/* ===== TITLE INPUT ===== */
.title-input {
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  background-color: #f9fafb;
  font-size: 14px;
  transition: all 0.2s ease;
  outline: none;
}

/* Focus Effect */
.title-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

/* Disabled */
.title-input:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
  opacity: 0.8;
}

/* Mobile Optimization */
@media (max-width: 600px) {
  .title-input {
    height: 42px;
    font-size: 13px;
  }
}

.menu-section {
  margin-top: 10px;
}

.group-title {
  margin: 12px 0;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  text-align: center;
  position: relative;
  letter-spacing: 1px;
}

.group-title::before,
.group-title::after {
  content: "";
  position: absolute;
  top: 50%;
  width: 30%;
  height: 2px;
  background: rgba(0, 0, 0, 0.15);
}

.group-title::before {
  left: 0;
}

.group-title::after {
  right: 0;
}

.meal-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1px 1px 1px 16px;
  background: #ffffff;
  border-radius: 12px;
  margin-bottom: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.meal-heading h4 {
  margin: 0;
  /* 🔥 removes default top/bottom gap */
  font-size: 14px;
  font-weight: 600;
  color: #2563eb;
}

/* Delete button */
.delete-type-btn {
  background: transparent;
  color: #dc2626;
  border: 1px solid #fecaca;
  padding: 5px 14px;
  border-radius: 999px;
  /* pill shape */
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
}
</style>