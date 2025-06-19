"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import userApi from "../api/userApi"
import authApi from "../api/authApi"
import { Search, Star, StarOff, User, Lock, LogOut, Settings, Store, MapPin, Eye, EyeOff } from "lucide-react"

function UserHome() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stores, setStores] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchName, setSearchName] = useState("")
  const [searchAddress, setSearchAddress] = useState("")
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
  })
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  useEffect(() => {
    // Redirect if not logged in or not a user
    if (!user || user.role !== "user") {
      navigate("/login")
      return
    }

    fetchStores()
  }, [user, navigate])

  const fetchStores = async (name = searchName, address = searchAddress) => {
    if (!user) return

    setIsLoading(true)
    try {
      const data = await userApi.fetchStores({
        userId: user.id,
        name,
        address,
      })
      setStores(data)
    } catch (error) {
      console.error("Error fetching stores:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchStores(searchName, searchAddress)
  }

  const handleRatingChange = async (storeId, rating) => {
    if (!user) return

    try {
      const updatedStore = await userApi.submitRating({
        userId: user.id,
        storeId,
        rating: Number.parseInt(rating),
      })

      // Update the store in the list
      setStores(stores.map((store) => (store.id === updatedStore.id ? updatedStore : store)))
    } catch (error) {
      console.error("Error submitting rating:", error)
    }
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordError("")
    setPasswordSuccess("")

    if (!passwordForm.oldPassword || !passwordForm.newPassword) {
      setPasswordError("Both fields are required")
      return
    }

    if (passwordForm.newPassword.length < 4) {
      setPasswordError("New password must be at least 4 characters")
      return
    }

    try {
      await authApi.updatePassword({
        userId: user.id,
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      })

      setPasswordSuccess("Password updated successfully")
      setPasswordForm({ oldPassword: "", newPassword: "" })
    } catch (error) {
      setPasswordError(error.error || "Failed to update password")
    }
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400 opacity-50" />)
      } else {
        stars.push(<StarOff key={i} className="w-4 h-4 text-gray-300" />)
      }
    }
    return stars
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user.name}!</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </button>
              <button
                onClick={logout}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 animate-fade-in">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Welcome, {user.name}!</h2>
              <p className="text-gray-600">
                You are logged in as a <span className="font-medium text-purple-600">{user.role}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Password Update Form */}
        {showPasswordForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 animate-slide-down">
            <div className="flex items-center space-x-3 mb-6">
              <Lock className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Update Password</h3>
            </div>

            {passwordError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 animate-shake">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 animate-fade-in">
                {passwordSuccess}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showOldPassword ? "text" : "password"}
                      name="oldPassword"
                      value={passwordForm.oldPassword}
                      onChange={handlePasswordChange}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
              >
                Update Password
              </button>
            </form>
          </div>
        )}

        {/* Store Listings */}
        <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in">
          <div className="flex items-center space-x-3 mb-6">
            <Store className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Store Listings</h2>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search by Name</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter store name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search by Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchAddress}
                    onChange={(e) => setSearchAddress(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter store address"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
            >
              <Search className="w-4 h-4 mr-2 inline" />
              Search Stores
            </button>
          </form>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600">Loading stores...</span>
            </div>
          ) : stores.length === 0 ? (
            <div className="text-center py-12">
              <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No stores found.</p>
              <p className="text-gray-400">Try adjusting your search criteria.</p>
            </div>
          ) : (
            /* Stores Grid */
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {stores.map((store, index) => (
                <div
                  key={store.id}
                  className="bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{store.name}</h3>
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="text-sm">{store.address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Overall Rating</span>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          {renderStars(Number.parseFloat(store.averageRating))}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {Number.parseFloat(store.averageRating).toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Your Rating</span>
                      <div className="flex items-center space-x-2">
                        {store.userRating ? (
                          <>
                            <div className="flex items-center space-x-1">
                              {renderStars(Number.parseFloat(store.userRating))}
                            </div>
                            <span className="text-sm font-medium text-purple-600">
                              {Number.parseFloat(store.userRating).toFixed(1)}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-gray-500">Not rated</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rate this store</label>
                      <select
                        value={store.userRating || ""}
                        onChange={(e) => handleRatingChange(store.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                      >
                        <option value="">Select Rating</option>
                        <option value="1">⭐ 1 - Poor</option>
                        <option value="2">⭐⭐ 2 - Fair</option>
                        <option value="3">⭐⭐⭐ 3 - Good</option>
                        <option value="4">⭐⭐⭐⭐ 4 - Very Good</option>
                        <option value="5">⭐⭐⭐⭐⭐ 5 - Excellent</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserHome