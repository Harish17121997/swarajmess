<template>
  <div class="login-container">
    <div class="background-shape shape1"></div>
    <div class="background-shape shape2"></div>

    <div class="login-card">
      <div class="header">
        <div class="icon">🍽</div>
        <h1>{{ isRegister ? 'Register Mess' : 'Mess Admin' }}</h1>
        <p>
          {{ isRegister ? 'Create new mess account' : 'Login to manage daily menu' }}
        </p>
      </div>

      <!-- Mess Name (Only Register) -->
      <div v-if="isRegister" class="form-group">
        <label>Mess Name</label>
        <input
          v-model="messName"
          type="text"
          placeholder="Enter mess name"
          class="input"
        />
      </div>

      <!-- Username -->
      <div class="form-group">
        <label>Username / Mobile</label>
        <input
          v-model="username"
          type="text"
          placeholder="Enter username or mobile"
          class="input"
        />
      </div>

      <!-- Password -->
      <div class="form-group">
        <label>Password</label>
        <input
          v-model="password"
          type="password"
          placeholder="Enter password"
          class="input"
          @keyup.enter="handleSubmit"
        />
      </div>

      <!-- Button -->
      <button
        class="login-btn"
        @click="handleSubmit"
        :disabled="loading"
      >
        {{ loading ? 'Please wait...' : isRegister ? 'Register' : 'Login' }}
      </button>

      <!-- Toggle -->
      <p class="toggle-text">
        {{ isRegister ? 'Already have account?' : 'New user?' }}
        <span @click="toggleForm">
          {{ isRegister ? 'Login here' : 'Register here' }}
        </span>
      </p>

      <!-- Error / Success -->
      <p v-if="message" :class="success ? 'success-msg' : 'error-msg'">
        {{ message }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginApi, registerApi } from '@/services/api'

const router = useRouter()

const isRegister = ref(false)
const messName = ref('')
const username = ref('')
const password = ref('')
const message = ref('')
const success = ref(false)
const loading = ref(false)

const clearForm = () => {
  messName.value = ''
  username.value = ''
  password.value = ''
}

const toggleForm = () => {
  isRegister.value = !isRegister.value
  message.value = ''
  clearForm()
}

const handleSubmit = async () => {
  message.value = ''
  success.value = false

  if (!username.value || !password.value) {
    message.value = 'Please fill all required fields'
    return
  }

  if (isRegister.value && !messName.value) {
    message.value = 'Please enter mess name'
    return
  }

  loading.value = true

  try {
    if (isRegister.value) {
      // REGISTER
      await registerApi({
        name: messName.value,
        mobile: username.value,
        password: password.value
      })

      success.value = true
      message.value = 'Registration successful! Please login.'
      isRegister.value = false
      clearForm()

    } else {
      // LOGIN
      const res = await loginApi({
        mobile: username.value,
        password: password.value
      })

      // Save token if backend sends it
      if (res.data.token) {
        localStorage.setItem('token', res.data.token)
      }

      localStorage.setItem('messAdmin', 'true')
      router.push('/admin')
    }

  } catch (err) {
    message.value =
      err.response?.data?.message || 'Something went wrong'
  } finally {
    loading.value = false
  }
}
</script>
<style scoped>

/* ===== FULL SCREEN LAYOUT ===== */
.login-container {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a, #1e293b);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  padding: 20px;
}

/* ===== BACKGROUND EFFECT ===== */
.background-shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.4;
}

.shape1 {
  width: 350px;
  height: 350px;
  background: #3b82f6;
  top: -100px;
  left: -100px;
}

.shape2 {
  width: 400px;
  height: 400px;
  background: #22c55e;
  bottom: -120px;
  right: -120px;
}

/* ===== CARD ===== */
.login-card {
  width: 100%;
  max-width: 380px;
  background: #ffffff;
  border-radius: 24px;
  padding: 35px 28px;
  box-shadow: 0 30px 70px rgba(0,0,0,0.35);
  position: relative;
  z-index: 2;
  animation: fadeIn 0.5s ease-in-out;
}

/* ===== HEADER ===== */
.header {
  text-align: center;
  margin-bottom: 25px;
}

.icon {
  font-size: 42px;
  margin-bottom: 8px;
}

.header h1 {
  margin: 0;
  font-size: 22px;
  color: #0f172a;
}

.header p {
  margin-top: 6px;
  font-size: 13px;
  color: #64748b;
}

/* ===== FORM ===== */
.form-group {
  margin-bottom: 18px;
}

label {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  display: block;
  margin-bottom: 6px;
}

.input {
  width: 100%;
  padding: 13px;
  border-radius: 14px;
  border: 1.6px solid #cbd5e1;
  font-size: 14px;
  transition: 0.25s;
}

.input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.25);
}

/* ===== BUTTON ===== */
.login-btn {
  width: 100%;
  padding: 14px;
  border-radius: 16px;
  border: none;
  background: linear-gradient(120deg, #2563eb, #1e40af);
  color: white;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: 0.3s;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(37,99,235,0.45);
}

/* ===== ERROR ===== */
.error-msg {
  margin-top: 12px;
  text-align: center;
  color: #dc2626;
  font-size: 13px;
  font-weight: 500;
}

/* ===== ANIMATION ===== */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== MOBILE RESPONSIVE ===== */
@media (max-width: 480px) {
  .login-card {
    padding: 25px 20px;
  }

  .shape1,
  .shape2 {
    display: none;
  }
}

</style>
<style scoped>
/* Keep your existing CSS */
/* Add below styles */

.toggle-text {
  margin-top: 16px;
  text-align: center;
  font-size: 13px;
  color: #64748b;
}

.toggle-text span {
  color: #2563eb;
  cursor: pointer;
  font-weight: 600;
  margin-left: 4px;
}

.toggle-text span:hover {
  text-decoration: underline;
}

.success-msg {
  margin-top: 12px;
  text-align: center;
  color: #16a34a;
  font-size: 13px;
  font-weight: 500;
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>