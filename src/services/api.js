import axios from 'axios'

const api = axios.create({
  baseURL: 'https://mess-mangement-backend.vercel.app',
  headers: {
    'Content-Type': 'application/json'
  }
})

// LOGIN API
export const loginApi = (data) => {
  return api.post('/login', data)
}

// REGISTER API
export const registerApi = (data) => {
  return api.post('/register', data) 
}
// ADD MEAL API
export const addMealApi = (data) => {
  return api.post('/add-meal', data, {
    headers: {
      Authorization: `${localStorage.getItem('token')}`
    }
  })
}

export default api