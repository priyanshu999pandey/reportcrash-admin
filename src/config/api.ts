const apiBaseUrl = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')

export const apiUrls = {
  blogs: `${apiBaseUrl}/blogs`,
  helplines: `${apiBaseUrl}/helpline/`,
  nearbyHospitals: `${apiBaseUrl}/hospital/nearby?latitude=28.6139&longitude=77.2090&limit=10`,
}
