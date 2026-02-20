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
                    <Multiselect v-model="row.selected" :options="allItems"  :taggable="true"
                        :close-on-select="true" placeholder="Search or add food item"
                        tag-placeholder="Press enter to add" @tag="addNewItem" class="multi" />

                    <button class="remove-btn" @click="removeRow(index)"> 🗑 </button>
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
/* PAGE */
.admin-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #0f172a, #020617);
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
    box-shadow: 0 20px 45px rgba(0, 0, 0, 0.35);
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
    grid-template-columns: 1fr 50px;
    gap: 10px;
    margin-bottom: 12px;
    align-items: center;
}

.remove-btn {
    height: 44px;
    border: none;
    border-radius: 12px;
    background: #ef4444;
    color: white;
    font-size: 18px;
    cursor: pointer;
    transition: 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.remove-btn:hover {
    background: #dc2626;
    transform: scale(1.05);
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
    background: linear-gradient(135deg, #22c55e, #16a34a);
    color: #fff;
    font-weight: 700;
    font-size: 15px;
    cursor: pointer;
    transition: 0.2s;
}

.save-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 20px rgba(34, 197, 94, 0.3);
}

.success-msg {
    text-align: center;
    margin-top: 14px;
    color: #16a34a;
    font-weight: 600;
}
/* MULTISELECT FULL WIDTH FIX */
:deep(.multiselect) {
  width: 100%;
}

:deep(.multiselect__tags) {
  min-height: 44px;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  padding: 6px 10px;
  background: #f8fafc;
}

:deep(.multiselect__input) {
  font-size: 14px;
}

:deep(.multiselect__tag) {
  background: #22c55e;
  color: white;
  border-radius: 8px;
}

:deep(.multiselect__option--highlight) {
  background: #22c55e;
}

:deep(.multiselect__option--selected) {
  background: #16a34a;
  color: white;
}

/* TOGGLE SWITCH */
.mess-toggle {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f1f5f9;
    padding: 12px 16px;
    border-radius: 14px;
    margin-bottom: 20px;
}

.status-text {
    font-size: 14px;
    font-weight: 600;
}

.open {
    color: #16a34a;
}

.closed {
    color: #dc2626;
}

/* switch */
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
    background: #cbd5e1;
    border-radius: 30px;
    transition: 0.3s;
    cursor: pointer;
}

.slider::before {
    content: "";
    position: absolute;
    height: 22px;
    width: 22px;
    left: 3px;
    top: 3px;
    background: white;
    border-radius: 50%;
    transition: 0.3s;
}

.switch input:checked + .slider {
    background: #22c55e;
}

.switch input:checked + .slider::before {
    transform: translateX(24px);
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
<style scoped>
</style>