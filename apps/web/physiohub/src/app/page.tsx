'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, Dumbbell, Activity, Zap, BookOpen, Search, GraduationCap, Users, Award } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { theme, getCategoryTheme } from '@/lib/theme'

const categories = [
  {
    id: 'muscles',
    title: 'Muscles',
    icon: Dumbbell,
    description: 'Explore muscle anatomy, origins, insertions, and functions'
  },
  {
    id: 'joints',
    title: 'Joints',
    icon: Activity,
    description: 'Learn about joint structures, biomechanics, and movements'
  },
  {
    id: 'ligaments',
    title: 'Ligaments',
    icon: Zap,
    description: 'Understand ligament anatomy and clinical relevance'
  },
  {
    id: 'tendons',
    title: 'Tendons',
    icon: Activity,
    description: 'Study tendon structures, attachments, and pathology'
  },
  {
    id: 'neural',
    title: 'Neural Structures',
    icon: Brain,
    description: 'Explore nerve pathways and innervation patterns'
  },
  {
    id: 'exercises',
    title: 'Exercises',
    icon: BookOpen,
    description: 'Discover therapeutic exercises and rehabilitation protocols'
  }
]

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Redirect to global search page that searches all categories
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e as any)
    }
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: theme.colors.primary[50] }}>
      {/* Educational Header Banner */}
      <div className="text-white" style={{ backgroundColor: theme.colors.primary[900] }}>
        <div className="max-w-7xl mx-auto px-6 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5" style={{ color: theme.colors.primary[100] }} />
                <span className="text-sm font-medium">Educational Platform</span>
              </div>
              <div className="hidden md:flex items-center space-x-2">
                <Users className="h-4 w-4" style={{ color: theme.colors.primary[100] }} />
                <span className="text-sm">For Students & Professionals</span>
              </div>
              <div className="hidden lg:flex items-center space-x-2">
                <Award className="h-4 w-4" style={{ color: theme.colors.primary[100] }} />
                <span className="text-sm">Evidence-Based Content</span>
              </div>
            </div>
            <div className="text-xs" style={{ color: theme.colors.primary[100] }}>
              Free • Open Access • No Registration Required
            </div>
          </div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden bg-white"
      >
        <div 
          className="absolute inset-0 opacity-70"
          style={{ backgroundColor: theme.colors.primary[50] }}
        />
        <div className="relative px-6 pt-16 pb-20 mx-auto max-w-7xl lg:px-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <h1 
              className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl"
              style={{ color: theme.colors.primary[900] }}
            >
              PhysioHub
            </h1>
            <p 
              className="mt-6 text-lg leading-8 max-w-2xl mx-auto"
              style={{ color: theme.colors.primary[600] }}
            >
              Your interactive anatomy learning platform. Explore muscles, joints, ligaments, and more with detailed anatomical information and clinical insights.
            </p>
            
            <div className="mt-10 max-w-xl mx-auto">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search all anatomy categories... (Press Enter)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{
                    borderColor: theme.colors.primary[100],
                    '--tw-ring-color': theme.colors.primary[600]
                  } as React.CSSProperties}
                />
                {searchQuery && (
                  <div 
                    className="absolute top-full left-0 right-0 mt-2 p-3 bg-white rounded-lg shadow-lg border"
                    style={{
                      borderColor: theme.colors.primary[100],
                      boxShadow: `0 10px 15px -3px ${theme.colors.primary[600]}20, 0 4px 6px -2px ${theme.colors.primary[600]}10`
                    }}
                  >
                    <p className="text-sm" style={{ color: theme.colors.primary[600] }}>
                      Press Enter to search for "{searchQuery}" across all anatomy categories
                    </p>
                    <p className="text-xs mt-1" style={{ color: theme.colors.gray[500] }}>
                      Searches muscles, joints, ligaments, tendons, neural structures & exercises
                    </p>
                  </div>
                )}
              </form>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="px-6 py-16 mx-auto max-w-7xl lg:px-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {categories.map((category, index) => {
            const Icon = category.icon
            return (
              <motion.div
                key={category.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 * (index + 1) }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href={`/explore/${category.id}`}>
                  <div 
                    className="relative group cursor-pointer rounded-2xl p-8 bg-white shadow-lg hover:shadow-xl transition-all duration-300"
                    style={{
                      boxShadow: `0 4px 6px -1px ${theme.colors.primary[600]}20, 0 2px 4px -1px ${theme.colors.primary[600]}10`
                    }}
                  >
                    <div 
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                      style={{ backgroundColor: theme.colors.primary[600] }}
                    />
                    <div className="relative z-10">
                      <div 
                        className="inline-flex p-3 rounded-lg text-white mb-4"
                        style={{ backgroundColor: theme.colors.primary[600] }}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 
                        className="text-xl font-semibold mb-2"
                        style={{ color: theme.colors.primary[900] }}
                      >
                        {category.title}
                      </h3>
                      <p style={{ color: theme.colors.primary[600] }}>
                        {category.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      {/* Learning Objectives & Tips Section */}
      <div 
        className="text-white py-16 mt-16"
        style={{ backgroundColor: theme.colors.primary[900] }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Learning Objectives */}
            <div className="lg:col-span-2">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <BookOpen className="h-6 w-6 mr-3" style={{ color: theme.colors.primary[100] }} />
                Learning Objectives
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-300">
                      <strong className="text-white">Anatomical Knowledge:</strong> Learn origins, insertions, and actions of muscles
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-300">
                      <strong className="text-white">Clinical Application:</strong> Understand pathology and assessment techniques
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-300">
                      <strong className="text-white">Treatment Planning:</strong> Learn therapeutic exercises and interventions
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-300">
                      <strong className="text-white">Functional Movement:</strong> Connect anatomy to real-world activities
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-300">
                      <strong className="text-white">Evidence-Based Practice:</strong> Apply current research and best practices
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-300">
                      <strong className="text-white">Professional Skills:</strong> Develop assessment and reasoning abilities
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Study Tips */}
            <div>
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <GraduationCap className="h-6 w-6 mr-3" style={{ color: theme.colors.primary[100] }} />
                Study Tips
              </h3>
              <div 
                className="rounded-lg p-4 space-y-3"
                style={{
                  backgroundColor: `${theme.colors.primary[900]}80`
                }}
              >
                <div className="text-sm">
                  <span className="font-medium" style={{ color: theme.colors.primary[100] }}>💡 Active Learning:</span>
                  <p className="mt-1" style={{ color: theme.colors.primary[50] }}>Use the search function to test your knowledge by looking up structures</p>
                </div>
                <div className="text-sm">
                  <span className="font-medium" style={{ color: theme.colors.primary[100] }}>🔍 Deep Dive:</span>
                  <p className="mt-1" style={{ color: theme.colors.primary[50] }}>Click on items to explore detailed clinical information and pathology</p>
                </div>
                <div className="text-sm">
                  <span className="font-medium" style={{ color: theme.colors.primary[100] }}>🔗 Make Connections:</span>
                  <p className="mt-1" style={{ color: theme.colors.primary[50] }}>Learn how muscles, joints, and nerves work together functionally</p>
                </div>
                <div className="text-sm">
                  <span className="font-medium" style={{ color: theme.colors.primary[100] }}>📚 Apply Knowledge:</span>
                  <p className="mt-1" style={{ color: theme.colors.primary[50] }}>Review exercises and treatment approaches for each structure</p>
                </div>
              </div>
            </div>
          </div>

          <div 
            className="mt-12 pt-8 text-center border-t"
            style={{ borderColor: `${theme.colors.primary[100]}40` }}
          >
            <p className="text-sm mb-2" style={{ color: theme.colors.primary[100] }}>
              Free educational resource for physiotherapy students and professionals
            </p>
            <p className="text-xs" style={{ color: theme.colors.primary[50] }}>
              Content is regularly updated based on current evidence and clinical practice guidelines
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}