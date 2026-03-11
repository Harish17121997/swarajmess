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
// UPDATE USER STATUS (Open / Close Mess)
export const updateUserStatusApi = (statusFlag) => {
  return api.get(`/user-status?status_flag=${statusFlag}`, {
    headers: {
      Authorization: `${localStorage.getItem('token')}`
    }
  })
}

// GET CURRENT USER STATUS
export const getUserStatusApi = () => {
  return api.get('/user-status', {
    headers: {
      Authorization: `${localStorage.getItem('token')}`
    }
  })
}
// GET ALL MEALS
export const getMealsApi = () => {
  return api.get('/meals', {
    headers: {
      Authorization: `${localStorage.getItem('token')}`
    }
  })
}

// DELETE MEAL BY ID
export const deleteMealApi = (mealId) => {
  return api.delete(`/meals/${mealId}`, {
    headers: {
      Authorization: `${localStorage.getItem('token')}`
    }
  })
}

// GET CURRENT MEALS
export const getCurrentMealsApi = () => {
  return api.get('/current-meals', {
    headers: {
      Authorization: `${localStorage.getItem('token')}`
    }
  })
}

// SOFT DELETE CURRENT MEAL
export const softDeleteMealApi = (id) => {
  return api.delete(`/meals/${id}?soft_delete=1`, {
    headers: {
      Authorization: `${localStorage.getItem('token')}`
    }
  })
}

export const getVisitsApi = () => {
  return api.get('/dashboard/my-visits', {
    headers: {
      Authorization: `${localStorage.getItem('token')}`
    }
  })
}
// GET MENU FOR CUSTOMER (QR SCAN)
export const getCustomerMealsApi = (userId) => {
  return api.get(`/meals-customers`, {
    params: {
      user_id: userId
    }
  })
}

// img
// UPLOAD MEAL IMAGES
export const uploadMealImagesApi = (formData) => {
  return api.post('/upload-meals-images', formData, {
    headers: {
      Authorization: `${localStorage.getItem('token')}`,
      'Content-Type': 'multipart/form-data'
    }
  })
}

// GET USER MEAL IMAGES
export const getMealImagesApi = () => {
  return api.get('/user-meals-images', {
    headers: {
      Authorization: `${localStorage.getItem('token')}`
    }
  })
}
// DELETE MEAL IMAGES
export const deleteMealImagesApi = (data) => {
  return api.delete('/delete-meal-images', {
    headers: {
      Authorization: localStorage.getItem('token')
    },
    data: data
  })
}
export const deleteMealsByFlagApi = (flag) => {
  return api.delete(`/meals-by-flag/${flag}?soft_delete=0`, {
    headers: {
      Authorization: `${localStorage.getItem('token')}`
    }
  })
}
export const updateLocationApi = (data) => {
  return api.put('/update-location', data, {
    headers: {
      Authorization: `${localStorage.getItem('token')}`
    }
  })
}
export default api