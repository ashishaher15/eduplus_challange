
"use client"

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import adminApi from "../api/adminApi"
import authApi from "../api/authApi"
import { Store, Star, Edit, Package, Users, Lock, LogOut, Eye, EyeOff, Plus, Mail, MapPin, X } from "lucide-react"

function StoreOwnerHome() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [store, setStore] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
  })
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [ratingUsers, setRatingUsers] = useState([])
  const [loadingRatingUsers, setLoadingRatingUsers] = useState(false)
  const [showRatingUsers, setShowRatingUsers] = useState(false)
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  useEffect(() => {
    // Redirect if not logged in or not a store owner
    if (!user || user.role !== "store_owner") {
      navigate("/login")
      return
    }

    // Fetch store data for this owner
    const fetchStoreData = async () => {
      try {
        const storeData = await adminApi.getStoreByOwnerId(user.id)
        setStore(storeData)
      } catch (err) {
        console.error("Error fetching store:", err)
        setError(err.error || "Failed to load store data")
      } finally {
        setLoading(false)
      }
    }

    fetchStoreData()
  }, [user, navigate])

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

    try {
      await authApi.updatePassword({
        userId: user.id,
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      })

      setPasswordSuccess("Password updated successfully")
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
      })
    } catch (err) {
      setPasswordError(err.error || "Failed to update password")
    }
  }

  const fetchRatingUsers = async () => {
    if (!store) return

    setLoadingRatingUsers(true)
    try {
      const users = await adminApi.getStoreRatingUsers(store.id)
      setRatingUsers(users)
      setShowRatingUsers(true)
    } catch (err) {
      console.error("Error fetching rating users:", err)
    } finally {
      setLoadingRatingUsers(false)
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
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />)
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
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                <Store className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Store Owner Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user.name}!</p>
              </div>
            </div>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 animate-fade-in">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <Store className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Welcome, {user.name}!</h2>
              <p className="text-gray-600">
                You are logged in as a <span className="font-medium text-purple-600">{user.role}</span>
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center animate-fade-in">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading store information...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 animate-fade-in">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Store Found</h3>
              <p className="text-red-600 mb-6">{error}</p>
              <Link
                to="/owner/store/new"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your Store
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Store Information */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 animate-fade-in">
              <div className="flex items-center space-x-3 mb-6">
                <Store className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-900">Your Store</h2>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{store.name}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{store.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-medium text-gray-900">{store.address}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      {renderStars(Number.parseFloat(store.averageRating))}
                    </div>
                    <span className="text-lg font-semibold text-gray-900">
                      {Number.parseFloat(store.averageRating).toFixed(2)}
                    </span>
                  </div>
                  <span className="text-gray-600">({store.ratingsCount} reviews)</span>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/owner/store/edit"
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Store
                  </Link>

                  <Link
                    to="/owner/store/items"
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-sm font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Manage Items
                  </Link>

                  <button
                    onClick={fetchRatingUsers}
                    disabled={loadingRatingUsers}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingRatingUsers ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Users className="w-4 h-4 mr-2" />
                    )}
                    View Rating Users
                  </button>
                </div>
              </div>
            </div>

            {/* Rating Users Section */}
            {showRatingUsers && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8 animate-slide-down">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Users className="w-6 h-6 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Users Who Rated Your Store</h3>
                  </div>
                  <button
                    onClick={() => setShowRatingUsers(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {ratingUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No ratings yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-700">Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ratingUsers.map((user, index) => (
                          <tr
                            key={user.id}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            <td className="py-3 px-4 text-gray-900">{user.name}</td>
                            <td className="py-3 px-4 text-gray-600">{user.email}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-1">{renderStars(user.rating)}</div>
                                <span className="font-medium text-gray-900">{user.rating}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Password Update Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in">
              <div className="flex items-center space-x-3 mb-6">
                <Lock className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Update Password</h3>
              </div>

              {!showPasswordForm ? (
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg font-medium hover:from-gray-600 hover:to-gray-700 transition-all duration-200 transform hover:scale-105"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </button>
              ) : (
                <div className="animate-slide-down">
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
                            required
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
                            required
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

                    <div className="flex space-x-3">
                      <button
                        type="submit"
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:scale-105"
                      >
                        Update Password
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordForm(false)
                          setPasswordError("")
                          setPasswordSuccess("")
                          setPasswordForm({ oldPassword: "", newPassword: "" })
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default StoreOwnerHome