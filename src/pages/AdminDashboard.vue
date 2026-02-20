<template>
  <div class="admin-page">
    <div class="admin-card">

      <!-- HEADER -->
      <div class="header">
        <div>
          <h2>Mess Admin Panel</h2>
          <p class="date">{{ today }}</p>
        </div>
        <button class="logout-btn" @click="logout">Logout</button>
      </div>

      <!-- MEAL TYPE -->
      <div class="form-group">
        <label>Meal Type</label>
        <select v-model="mealType" class="input">
          <option disabled value="">Select Meal</option>
          <option>Lunch</option>
          <option>Dinner</option>
        </select>
      </div>

      <!-- MENU SECTION -->
      <div class="menu-section">
        <label>Menu Items</label>

        <div
          class="menu-row"
          v-for="(row, index) in rows"
          :key="index"
        >
          <!-- Dropdown -->
          <select v-model="row.selected" class="input">
            <option disabled value="">Select Item</option>
            <option
              v-for="item in allItems"
              :key="item"
            >
              {{ item }}
            </option>
          </select>

          <!-- Custom input -->
          <input
            v-model="row.custom"
            @blur="handleCustom(index)"
            placeholder="Add new item"
            class="input"
          />

          <!-- Remove -->
          <button
            class="remove-btn"
            @click="removeRow(index)"
          >
            ✕
          </button>
        </div>

        <button class="add-btn" @click="addRow">
          + Add Item
        </button>
      </div>

      <!-- SAVE -->
      <button class="save-btn" @click="saveMenu">
        Save Menu
      </button>

      <p v-if="success" class="success-msg">
        ✔ Menu Saved Successfully
      </p>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Protect route
onMounted(() => {
  if (!localStorage.getItem('messAdmin')) {
    router.push('/login')
  }
})

// Date
const today = new Date().toLocaleDateString('en-IN', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric'
})

// Meal type
const mealType = ref('')

// All available dropdown items
const allItems = ref(
  JSON.parse(localStorage.getItem('allMenuItems')) || [
    'Veg Thali',
    'Chicken Thali',
    'Egg Thali',
    'Dal Rice',
    'Chapati Bhaji'
  ]
)

// Rows
const rows = ref([
  { selected: '', custom: '' }
])

function addRow() {
  rows.value.push({ selected: '', custom: '' })
}

function removeRow(index) {
  rows.value.splice(index, 1)
}

function handleCustom(index) {
  const value = rows.value[index].custom.trim()
  if (!value) return

  // Add to dropdown if not exists
  if (!allItems.value.includes(value)) {
    allItems.value.push(value)
    localStorage.setItem(
      'allMenuItems',
      JSON.stringify(allItems.value)
    )
  }

  rows.value[index].selected = value
  rows.value[index].custom = ''
}

function logout() {
  localStorage.removeItem('messAdmin')
  router.push('/login')
}

const success = ref(false)

function saveMenu() {
  if (!mealType.value) {
    alert('Select meal type')
    return
  }

  const items = rows.value
    .map(r => r.selected)
    .filter(Boolean)

  if (items.length === 0) {
    alert('Add at least one item')
    return
  }

  localStorage.setItem('todayMenu', JSON.stringify({
    date: today,
    meal: mealType.value,
    items
  }))

  success.value = true
}
</script>

<style scoped>

/* PAGE */
.admin-page {
  min-height: 100vh;
  background: linear-gradient(135deg,#0f172a,#020617);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

/* CARD */
.admin-card {
  width: 100%;
  max-width: 500px;
  background: #ffffff;
  padding: 28px;
  border-radius: 22px;
  box-shadow: 0 20px 45px rgba(0,0,0,0.35);
}

/* HEADER */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}

.date {
  font-size: 13px;
  color: #64748b;
  margin-top: 4px;
}

.logout-btn {
  background: #ef4444;
  color: #fff;
  border: none;
  padding: 8px 14px;
  border-radius: 10px;
  cursor: pointer;
}

/* FORM */
.form-group {
  margin-bottom: 20px;
}

label {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 6px;
  display: block;
}

.input {
  width: 100%;
  height: 44px;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  padding: 0 12px;
  font-size: 14px;
  background: #f8fafc;
  transition: 0.2s;
}

.input:focus {
  outline: none;
  border-color: #3b82f6;
  background: #fff;
  box-shadow: 0 0 0 2px #bfdbfe;
}

/* MENU SECTION */
.menu-section {
  margin-bottom: 20px;
}

.menu-row {
  display: grid;
  grid-template-columns: 1fr 1fr 45px;
  gap: 8px;
  margin-bottom: 10px;
  align-items: center;
}

.remove-btn {
  height: 44px;
  border: none;
  border-radius: 10px;
  background: #ef4444;
  color: #fff;
  cursor: pointer;
}

.add-btn {
  width: 100%;
  height: 44px;
  border-radius: 12px;
  border: 1px dashed #cbd5e1;
  background: #f1f5f9;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
}

/* SAVE */
.save-btn {
  width: 100%;
  height: 50px;
  border-radius: 14px;
  border: none;
  background: linear-gradient(135deg,#22c55e,#16a34a);
  color: #fff;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: 0.2s;
}

.save-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(34,197,94,0.3);
}

.success-msg {
  text-align: center;
  margin-top: 14px;
  color: #16a34a;
  font-weight: 600;
}

/* MOBILE */
@media (max-width: 520px) {
  .menu-row {
    grid-template-columns: 1fr;
  }

  .remove-btn {
    width: 100%;
  }
}

</style>