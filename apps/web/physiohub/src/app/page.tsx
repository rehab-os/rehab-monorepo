'use client'

import { useState, useEffect } from 'react'

export const dynamic = 'force-dynamic'
import { motion } from 'framer-motion'
import { Brain, Dumbbell, Activity, Zap, BookOpen, Search, GraduationCap, Users, Award } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { theme } from '@/lib/theme'

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
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsMounted(true)
  }, [])

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
    <main className="min-h-screen overflow-x-hidden" style={{ backgroundColor: theme.colors.primary[50] }}>
      {/* Educational Header Banner */}
      <div className="text-white sticky top-0 z-40 shadow-sm" style={{ backgroundColor: theme.colors.primary[900] }}>
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-6 flex-1 min-w-0">
              <div className="flex items-center space-x-2 flex-shrink-0">
                {isMounted && <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: theme.colors.primary[100] }} />}
                <span className="text-xs sm:text-sm font-medium">Educational Platform</span>
              </div>
              <div className="hidden sm:flex items-center space-x-2 flex-shrink-0">
                {isMounted && <Users className="h-3 w-3 sm:h-4 sm:w-4" style={{ color: theme.colors.primary[100] }} />}
                <span className="text-xs sm:text-sm">For Physiotherapy Professionals</span>
              </div>
              <div className="hidden lg:flex items-center space-x-2 flex-shrink-0">
                {isMounted && <Award className="h-3 w-3 sm:h-4 sm:w-4" style={{ color: theme.colors.primary[100] }} />}
                <span className="text-xs sm:text-sm">Evidence-Based Content</span>
              </div>
            </div>
            <div className="text-xs sm:text-sm flex-shrink-0" style={{ color: theme.colors.primary[100] }}>
              <a 
                href="https://healui.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline transition-all duration-200"
              >
                <span className="hidden sm:inline">Visit healui.com</span>
                <span className="sm:hidden">healui.com</span>
              </a>
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
        <div className="relative px-4 pt-12 pb-16 mx-auto max-w-7xl sm:px-6 sm:pt-16 sm:pb-20 lg:px-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            {/* healui Logo */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              {isMounted && (
                <img 
                  src="/healui-logo.png" 
                  alt="healui" 
                  className="h-20 w-auto mx-auto sm:h-24 md:h-28"
                />
              )}
            </motion.div>

            <p 
              className="text-lg sm:text-xl md:text-2xl leading-7 sm:leading-8 max-w-3xl mx-auto px-2 font-medium"
              style={{ color: theme.colors.primary[600] }}
            >
              Interactive anatomy learning platform. Explore muscles, joints, ligaments, and more with detailed anatomical information and clinical insights.
            </p>
            
            {/* Powered by healui */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 mb-8"
            >
              <a 
                href="https://healui.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 rounded-full border border-gray-200 bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-md transition-all duration-200 text-sm"
                style={{ color: theme.colors.primary[600] }}
              >
                <span>Powered by healui</span>
                <svg className="ml-2 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </motion.div>
            
            <div className="mt-8 max-w-xl mx-auto px-4 sm:px-0">
              <form onSubmit={handleSearch} className="relative">
                {isMounted && <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />}
                <input
                  type="text"
                  placeholder="Search anatomy... (Tap to search)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-4 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent text-base shadow-sm input-enhanced"
                  style={{
                    borderColor: theme.colors.primary[100],
                    '--tw-ring-color': theme.colors.primary[600]
                  } as React.CSSProperties}
                />
                {searchQuery && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 right-0 mt-2 p-4 bg-white rounded-xl shadow-xl border z-50"
                    style={{
                      borderColor: theme.colors.primary[100],
                      boxShadow: `0 20px 25px -5px ${theme.colors.primary[600]}15, 0 10px 10px -5px ${theme.colors.primary[600]}10`
                    }}
                  >
                    <p className="text-sm sm:text-base font-medium" style={{ color: theme.colors.primary[600] }}>
                      Tap Enter to search for "{searchQuery}"
                    </p>
                    <p className="text-xs sm:text-sm mt-2 opacity-75" style={{ color: theme.colors.primary[600] }}>
                      Searches across muscles, joints, ligaments, tendons, neural structures & exercises
                    </p>
                  </motion.div>
                )}
              </form>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 sm:py-16 lg:px-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
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
                className="w-full"
              >
                <Link href={`/explore/${category.id}`}>
                  <div 
                    className="relative group cursor-pointer rounded-2xl p-6 sm:p-8 bg-white shadow-lg h-full card-interactive touch-manipulation tap-highlight-transparent"
                    style={{
                      boxShadow: `0 4px 6px -1px ${theme.colors.primary[600]}20, 0 2px 4px -1px ${theme.colors.primary[600]}10`
                    }}
                  >
                    <div 
                      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 group-active:opacity-20 transition-opacity duration-300"
                      style={{ backgroundColor: theme.colors.primary[600] }}
                    />
                    <div className="relative z-10 flex flex-col h-full">
                      <div 
                        className="inline-flex p-2.5 sm:p-3 rounded-lg text-white mb-3 sm:mb-4 self-start"
                        style={{ backgroundColor: theme.colors.primary[600] }}
                      >
                        {isMounted && <Icon className="h-5 w-5 sm:h-6 sm:w-6" />}
                      </div>
                      <h3 
                        className="text-lg sm:text-xl font-semibold mb-2 flex-shrink-0"
                        style={{ color: theme.colors.primary[900] }}
                      >
                        {category.title}
                      </h3>
                      <p className="text-sm sm:text-base flex-grow" style={{ color: theme.colors.primary[600] }}>
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
        className="text-white py-12 mt-12 sm:py-16 sm:mt-16"
        style={{ backgroundColor: theme.colors.primary[900] }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Learning Objectives */}
            <div className="lg:col-span-2">
              <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center">
                {isMounted && <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" style={{ color: theme.colors.primary[100] }} />}
                Learning Objectives
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm sm:text-base text-gray-300">
                      <strong className="text-white">Anatomical Knowledge:</strong> Learn origins, insertions, and actions of muscles
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm sm:text-base text-gray-300">
                      <strong className="text-white">Clinical Application:</strong> Understand pathology and assessment techniques
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm sm:text-base text-gray-300">
                      <strong className="text-white">Treatment Planning:</strong> Learn therapeutic exercises and interventions
                    </p>
                  </div>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm sm:text-base text-gray-300">
                      <strong className="text-white">Functional Movement:</strong> Connect anatomy to real-world activities
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm sm:text-base text-gray-300">
                      <strong className="text-white">Evidence-Based Practice:</strong> Apply current research and best practices
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm sm:text-base text-gray-300">
                      <strong className="text-white">Professional Skills:</strong> Develop assessment and reasoning abilities
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Study Tips */}
            <div className="mt-8 lg:mt-0">
              <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center">
                {isMounted && <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" style={{ color: theme.colors.primary[100] }} />}
                Study Tips
              </h3>
              <div 
                className="rounded-xl p-4 sm:p-6 space-y-4"
                style={{
                  backgroundColor: `${theme.colors.primary[900]}60`,
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div className="text-sm sm:text-base">
                  <span className="font-medium text-base sm:text-lg" style={{ color: theme.colors.primary[100] }}>💡 Active Learning:</span>
                  <p className="mt-1 sm:mt-2" style={{ color: theme.colors.primary[50] }}>Use the search function to test your knowledge by looking up structures</p>
                </div>
                <div className="text-sm sm:text-base">
                  <span className="font-medium text-base sm:text-lg" style={{ color: theme.colors.primary[100] }}>🔍 Deep Dive:</span>
                  <p className="mt-1 sm:mt-2" style={{ color: theme.colors.primary[50] }}>Click on items to explore detailed clinical information and pathology</p>
                </div>
                <div className="text-sm sm:text-base">
                  <span className="font-medium text-base sm:text-lg" style={{ color: theme.colors.primary[100] }}>🔗 Make Connections:</span>
                  <p className="mt-1 sm:mt-2" style={{ color: theme.colors.primary[50] }}>Learn how muscles, joints, and nerves work together functionally</p>
                </div>
                <div className="text-sm sm:text-base">
                  <span className="font-medium text-base sm:text-lg" style={{ color: theme.colors.primary[100] }}>📚 Apply Knowledge:</span>
                  <p className="mt-1 sm:mt-2" style={{ color: theme.colors.primary[50] }}>Review exercises and treatment approaches for each structure</p>
                </div>
              </div>
            </div>
          </div>

          <div 
            className="mt-8 sm:mt-12 pt-6 sm:pt-8 text-center border-t"
            style={{ borderColor: `${theme.colors.primary[100]}40` }}
          >
            {/* healui Logo in Footer */}
            <div className="mb-8">
              {isMounted && (
                <img 
                  src="/healui-logo-footer.png" 
                  alt="healui" 
                  className="h-16 w-auto mx-auto opacity-90 sm:h-20 md:h-24"
                />
              )}
            </div>
            
            <p className="text-sm sm:text-base mb-2 px-4" style={{ color: theme.colors.primary[100] }}>
              Free educational resource • Powered by healui
            </p>
            <p className="text-xs sm:text-sm px-4 mb-4" style={{ color: theme.colors.primary[50] }}>
              Content is regularly updated based on current evidence and clinical practice guidelines
            </p>
            
            <a 
              href="https://healui.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm hover:underline transition-all duration-200"
              style={{ color: theme.colors.primary[100] }}
            >
              <span>Visit healui.com</span>
              <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}