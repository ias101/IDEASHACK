import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const auth = {
  register: body => api.post('/auth/register', body),
  login:    body => api.post('/auth/login', body),
}

export const users = {
  me:           ()     => api.get('/users/me'),
  passport:     ()     => api.get('/users/me/passport'),
  update:       body   => api.put('/users/me', body),
  saveApiKey:   apiKey => api.put('/users/me/api-key', { apiKey }),
}

export const ventures = {
  list:            ()               => api.get('/ventures'),
  create:          body             => api.post('/ventures', body),
  detail:          id               => api.get(`/ventures/${id}`),
  advanceStage:    id               => api.post(`/ventures/${id}/advance-stage`),
  addMember:       (id, username)   => api.post(`/ventures/${id}/members`, { username }),
  addMilestone:    (id, title)      => api.post(`/ventures/${id}/milestones`, { title }),
  updateMilestone: (mid, status)    => api.put(`/ventures/milestones/${mid}`, { status }),
  updateIpStatus:  (id, ipStatus)   => api.put(`/ventures/${id}/ip-status`, { ipStatus }),
}

export const ledger = {
  all:        ()  => api.get('/ledger'),
  recent:     ()  => api.get('/ledger/recent'),
  byVenture:  id  => api.get(`/ledger/venture/${id}`),
}

export const audit = {
  run: (input, ventureId) => api.post('/audit/run', { input, ventureId }),
}

export default api
