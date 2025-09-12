'use client'
import { useState } from 'react'
import { Search, Filter, MapPin, Star, MessageCircle, Heart, Share2 } from 'lucide-react'
import Image from 'next/image'

interface Tutor {
  id: string
  name: string
  location: string
  followers: string
  category: string
  verified: boolean
  rating: number
  price: number
  image: string
  socialPlatforms: string[]
}

interface FilterState {
  search: string
  subject: string
  minBudget: number
  maxBudget: number
}

const TutorComponent = () => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    subject: '',
    minBudget: 0,
    maxBudget: 5000
  })
  
  const [sortBy, setSortBy] = useState('popular')

  // Sample tutor data matching the image design
  const tutors: Tutor[] = [
    {
      id: '1',
      name: 'Patricia West',
      location: 'Nottingham, UK',
      followers: '23k',
      category: 'Lifestyle',
      verified: true,
      rating: 4.8,
      price: 900,
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      socialPlatforms: ['instagram', 'youtube', 'twitter']
    },
    {
      id: '2',
      name: 'Tom Green',
      location: 'Nottingham, UK',
      followers: '10k',
      category: 'Tech',
      verified: true,
      rating: 4.9,
      price: 250,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      socialPlatforms: ['instagram', 'youtube', 'tiktok']
    },
    {
      id: '3',
      name: 'Glenda Hayes',
      location: 'Nottingham, UK',
      followers: '120k',
      category: 'Lifestyle',
      verified: true,
      rating: 4.7,
      price: 1800,
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
      socialPlatforms: ['instagram', 'tiktok']
    },
    {
      id: '4',
      name: 'Sarah Johnson',
      location: 'London, UK',
      followers: '45k',
      category: 'Beauty',
      verified: false,
      rating: 4.6,
      price: 650,
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
      socialPlatforms: ['instagram', 'youtube']
    },
    {
      id: '5',
      name: 'Mike Davis',
      location: 'Manchester, UK',
      followers: '78k',
      category: 'Fitness',
      verified: true,
      rating: 4.8,
      price: 420,
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      socialPlatforms: ['instagram', 'tiktok', 'youtube']
    },
    {
      id: '6',
      name: 'Emma Wilson',
      location: 'Birmingham, UK',
      followers: '92k',
      category: 'Fashion',
      verified: true,
      rating: 4.9,
      price: 1200,
      image: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=400&fit=crop&crop=face',
      socialPlatforms: ['instagram', 'youtube', 'twitter']
    }
  ]

  const subjects = [
    'All Subjects',
    'Lifestyle',
    'Tech',
    'Beauty',
    'Fitness',
    'Fashion',
    'Travel',
    'Food',
    'Education'
  ]

  const handleFilterChange = (key: keyof FilterState, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    // Filter logic would go here
    console.log('Applying filters:', filters)
  }

  const getSocialIcon = (platform: string) => {
    const iconClass = "w-4 h-4"
    switch (platform) {
      case 'instagram':
        return <div className={`${iconClass} bg-pink-500 rounded`}></div>
      case 'youtube':
        return <div className={`${iconClass} bg-red-500 rounded`}></div>
      case 'tiktok':
        return <div className={`${iconClass} bg-black rounded`}></div>
      case 'twitter':
        return <div className={`${iconClass} bg-blue-500 rounded`}></div>
      default:
        return null
    }
  }

  return (
    <div className="mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tutors</h1>
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">Sort by:</span>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
          >
            <option value="popular">Popular</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-end">
          {/* Search Bar */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name or expertise..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-b border-gray-300  focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
              />
            </div>
          </div>

          {/* Subject Dropdown */}
          <div>
            <select
              value={filters.subject}
              onChange={(e) => handleFilterChange('subject', e.target.value)}
              className="w-full px-3 py-3 border-b border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-300"
            >
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>

          {/* Budget Range */}
          <div>
            <label className="block text-sm font-medium text-center text-black mb-2">
              Budget Range: ${filters.minBudget} - ${filters.maxBudget}
            </label>
            <div className="px-2">
              <input
                type="range"
                min="0"
                max="5000"
                step="100"
                value={filters.minBudget}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value <= filters.maxBudget) {
                    handleFilterChange('minBudget', value);
                  }
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />

            </div>
          </div>

          {/* Apply Filter Button */}
          <div>
            <button
              onClick={applyFilters}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white px-6 py-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <Filter size={16} />
              <span>Apply Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tutor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutors.map((tutor) => (
          <div key={tutor.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
            {/* Tutor Image */}
            <div className="relative h-64  bg-gradient-to-br from-secondary-100 to-secondary-200">
              <Image
                src={tutor.image}
                alt={tutor.name}
                fill
                className="object-cover rounded-xl"
              />
              <div className="absolute top-4 right-4">
                <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                  <Heart size={16} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* Card Content */}
            <div className="mt-4">
              {/* Name and Verification */}
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold text-lg text-gray-900">{tutor.name}</h3>
                {tutor.verified && (
                  <div className="w-5 h-5 bg-primary-300 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>

              {/* Location and Followers */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-1 text-gray-600">
                  <MapPin size={14} />
                  <span className="text-sm">{tutor.location}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-800">Rating: {tutor.rating}</div>
                </div>
              </div>

              {/* Social Platforms */}
              <div className="flex items-center space-x-2 mb-4 text-sm">
                Subjects: 
                <span className="text-sm px-2 ml-2 bg-gray-100 py-1 font-medium text-gray-700 rounded-full">
                  {tutor.category}
                </span>
              </div>

              {/* Price */}
              <div className="mb-4">
                <div className="text-sm text-gray-600">Service starts at</div>
                <div className="text-2xl font-bold text-gray-900">${tutor.price}</div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                  Book Appointment
                </button>
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <MessageCircle size={16} className="text-gray-600" />
                </button>
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Share2 size={16} className="text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      <div className="text-center mt-8">
        <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-medium transition-colors">
          Load More Tutors
        </button>
      </div>
    </div>
  )
}

export default TutorComponent