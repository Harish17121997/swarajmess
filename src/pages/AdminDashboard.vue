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
          <input type="checkbox" v-model="messOpen" @change="saveMessStatus">
          <span class="slider"></span>
        </label>
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

        <div class="menu-row" v-for="(row, index) in rows" :key="index">
          <Multiselect v-model="row.selected" :options="allItems" :taggable="true" :close-on-select="true"
            placeholder="Search or add food item" tag-placeholder="Press enter to add" @tag="addNewItem"
            class="multi" />
          <button class="remove-btn" @click="removeRow(index)"> <i class="pi pi-trash delete-btn-color"></i> </button>
        </div>
        <button class="add-btn" @click="addRow">
          + Add More Item
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
import Multiselect from 'vue-multiselect'

const router = useRouter()

/* ---------- ROUTE PROTECTION ---------- */
onMounted(() => {
  if (!localStorage.getItem('messAdmin')) {
    router.push('/login')
  }
})

/* ---------- DATE ---------- */
const today = new Date().toLocaleDateString('en-IN', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric'
})

/* ---------- MEAL TYPE ---------- */
const mealType = ref('')

/* ---------- ALL MENU ITEMS (PERMANENT STORAGE) ---------- */
const allItems = ref(
  JSON.parse(localStorage.getItem('allMenuItems')) || [
    'Veg Thali',
    'Chicken Thali',
    'Egg Thali',
    'Paneer Masala',
    'Dal Fry',
    'Chapati',
    'Rice'
  ]
)

/* ---------- MULTISELECT ROWS ---------- */
const rows = ref([
  { selected: [] }
])

function addRow() {
  rows.value.push({ selected: [] })
}

function removeRow(index) {
  rows.value.splice(index, 1)
}

/* ---------- ADD NEW ITEM FROM SEARCH ---------- */
function addNewItem(newItem) {
  const item = newItem.trim()

  if (!item) return

  // If item not exists → permanently save
  if (!allItems.value.includes(item)) {
    allItems.value.push(item)

    localStorage.setItem(
      'allMenuItems',
      JSON.stringify(allItems.value)
    )
  }
}
/* ---------- MESS STATUS ---------- */
const messOpen = ref(
  JSON.parse(localStorage.getItem('messOpen')) ?? true
)

function saveMessStatus() {
  localStorage.setItem('messOpen', JSON.stringify(messOpen.value))
}

/* ---------- LOGOUT ---------- */
function logout() {
  localStorage.removeItem('messAdmin')
  router.push('/login')
}

/* ---------- SAVE MENU ---------- */
const success = ref(false)

function saveMenu() {

  if (!mealType.value) {
    alert('Please select Lunch or Dinner')
    return
  }

  let items = []

  // collect selected items from all rows
  rows.value.forEach(row => {
    if (row.selected && row.selected.length) {
      items.push(...row.selected)
    }
  })

  // remove duplicates
  items = [...new Set(items)]

  if (items.length === 0) {
    alert('Add at least one menu item')
    return
  }

  // Save today menu
  localStorage.setItem('todayMenu', JSON.stringify({
    date: today,
    meal: mealType.value,
    items
  }))

  success.value = true
}
</script>

<style scoped>
/* ============================= */
/* GLOBAL PAGE BACKGROUND */
/* ============================= */

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
  margin-bottom: 22px;
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

/* ============================= */
/* MULTISELECT IMPROVEMENTS */
/* ============================= */
:deep(.multiselect__single) {
    padding-left: 5px;
    margin-bottom: 0px;
    align-items: center;
    text-align: center;
    padding-top: 6px;
    background: #f9fafb;
}
:deep(.multiselect__tags) {
  min-height: 48px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  background: #f9fafb;
}

/* :deep(.multiselect__tag) {
  background: linear-gradient(135deg, #96c9e0, #6087dd);
  border-radius: 8px;
} */

/* :deep(.multiselect__option--highlight) {
  background: #0ea5e9;
  color: white;
} */

:deep(.multiselect__option--selected) {
  background: #87f578;
  color: rgb(14, 13, 13);
}
.delete-btn-color {
  font-size: 16px;
  color: #ef4444;
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
  }

  .header h2 {
    font-size: 18px;
  }

  .save-btn {
    height: 50px;
  }
}
</style>