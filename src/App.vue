<template>
  <router-view />
</template>

<script setup>
</script>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'Segoe UI', sans-serif;
  background: linear-gradient(135deg, #0f172a, #1e293b);
}

.page {
  min-height: 100vh;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.card {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.25);
}
h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #0f172a;
}
.field {
  width: 100%;
  padding: 14px;
  margin-bottom: 15px;
  border-radius: 12px;
  border: 1.5px solid #cbd5e1;
  font-size: 15px;
  transition: 0.3s;
}
.field:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59,130,246,0.2);
}
.btn {
  width: 100%;
  padding: 14px;
  border-radius: 14px;
  border: none;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  background: linear-gradient(120deg, #2563eb, #1e40af);
  color: white;
  transition: 0.3s;
}
.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(37,99,235,0.4);
}
.error {
  color: #dc2626;
  text-align: center;
  margin-top: 10px;
}
.success {
  text-align: center;
  color: #16a34a;
  margin-top: 10px;
}
@media (max-width: 500px) {
  .card {
    padding: 22px;
  }
}
</style>