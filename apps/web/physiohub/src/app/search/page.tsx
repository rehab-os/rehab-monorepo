'use client'

import { useEffect, useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Search, ArrowLeft, Filter, BookOpen, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { loadData, AnatomyType } from '@/lib/data'
import { FuzzySearch, getSearchConfig, SearchResult } from '@/lib/search'
import AnatomyCard from '@/components/AnatomyCard'
import DetailModal from '@/components/DetailModal'
import { theme } from '@/lib/theme'

interface GlobalSearchResult extends SearchResult<any> {
  category: string
  categoryTitle: string
}

const categories = [
  { id: 'muscles', title: 'Muscles' },
  { id: 'joints', title: 'Joints' },
  { id: 'ligaments', title: 'Ligaments' },
  { id: 'tendons', title: 'Tendons' },
  { id: 'neural', title: 'Neural Structures' },
  { id: 'exercises', title: 'Exercises' }
]

function SearchPageContent() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [allData, setAllData] = useState<Record<string, any[]>>({})
  const [searchResults, setSearchResults] = useState<GlobalSearchResult[]>([])
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [searchByCategory, setSearchByCategory] = useState<Record<string, GlobalSearchResult[]>>({})

  useEffect(() => {
    const query = searchParams.get('q')
    if (query) {
      setSearchQuery(query)
    }
  }, [searchParams])

  useEffect(() => {
    async function loadAllData() {
      setLoading(true)
      const data: Record<string, any[]> = {}
      
      for (const category of categories) {
        try {
          const categoryData = await loadData(category.id as AnatomyType)
          data[category.id] = categoryData
        } catch (error) {
          console.error(`Error loading ${category.id}:`, error)
          data[category.id] = []
        }
      }
      
      setAllData(data)
      setLoading(false)
    }
    
    loadAllData()
  }, [])

  useEffect(() => {
    if (!searchQuery.trim() || loading) {
      setSearchResults([])
      setSearchByCategory({})
      return
    }

    const allResults: GlobalSearchResult[] = []
    const resultsByCategory: Record<string, GlobalSearchResult[]> = {}

    for (const category of categories) {
      const categoryData = allData[category.id] || []
      if (categoryData.length === 0) continue

      const searchConfig = getSearchConfig(category.id)
      const fuzzySearch = new FuzzySearch(searchConfig)
      const results = fuzzySearch.search(categoryData, searchQuery)

      const categoryResults = results.map(result => ({
        ...result,
        category: category.id,
        categoryTitle: category.title
      }))

      allResults.push(...categoryResults)
      resultsByCategory[category.id] = categoryResults
    }

    // Sort all results by score
    allResults.sort((a, b) => b.score - a.score)
    
    setSearchResults(allResults.slice(0, 50)) // Limit to top 50 results
    setSearchByCategory(resultsByCategory)
  }, [searchQuery, allData, loading])

  const getCategoryStyle = (categoryId: keyof typeof theme.categories) => {
    return theme.categories[categoryId] || theme.categories.joints
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: theme.colors.primary[50] }}>
      {/* Educational Header */}
      <div 
        className="text-white"
        style={{ backgroundColor: theme.colors.primary[900] }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <BookOpen className="h-8 w-8" style={{ color: theme.colors.primary[100] }} />
                <h1 className="text-2xl font-bold">Global Anatomy Search</h1>
              </div>
              <p className="max-w-2xl" style={{ color: theme.colors.primary[100] }}>
                Search across all anatomy categories simultaneously. Use specific terms like "biceps", "ACL", or "median nerve" for best results.
              </p>
            </div>
            <div className="hidden lg:block">
              <div 
                className="rounded-lg p-4 backdrop-blur-sm"
                style={{ backgroundColor: `${theme.colors.primary[100]}20` }}
              >
                <div className="flex items-center space-x-2 mb-2" style={{ color: theme.colors.primary[100] }}>
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">Search Tips</span>
                </div>
                <ul className="text-xs space-y-1" style={{ color: theme.colors.primary[100] }}>
                  <li>• Try partial matches: "sterno" finds "sternocleidomastoid"</li>
                  <li>• Use medical terms: "carpal tunnel", "rotator cuff"</li>
                  <li>• Search functions: "knee flexion", "shoulder abduction"</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search all anatomy categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    borderColor: theme.colors.primary[100],
                    '--tw-ring-color': theme.colors.primary[600]
                  } as React.CSSProperties}
                />
              </div>
            </div>
            <div className="w-32" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Results Summary */}
        {searchQuery && !loading && (
          <div className="mb-8">
            <div 
              className="bg-white p-6 rounded-lg shadow-sm border"
              style={{ borderColor: theme.colors.primary[100] }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold" style={{ color: theme.colors.primary[900] }}>
                  Search Results for "{searchQuery}"
                </h2>
                <span className="text-sm" style={{ color: theme.colors.gray[500] }}>
                  {searchResults.length} total results
                </span>
              </div>
              
              {/* Category breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {categories.map(category => {
                  const categoryResults = searchByCategory[category.id] || []
                  const style = getCategoryStyle(category.id as keyof typeof theme.categories)
                  
                  return (
                    <div 
                      key={category.id}
                      className="p-3 rounded-lg border text-center"
                      style={{
                        backgroundColor: style.bg,
                        borderColor: style.border
                      }}
                    >
                      <div className="text-lg font-semibold" style={{ color: style.text }}>
                        {categoryResults.length}
                      </div>
                      <div className="text-xs mt-1" style={{ color: theme.colors.gray[600] }}>
                        {category.title}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div 
              className="animate-spin rounded-full h-12 w-12 border-b-2"
              style={{ borderColor: theme.colors.primary[600] }}
            ></div>
          </div>
        )}

        {/* Search Results */}
        {!loading && searchQuery && (
          <>
            {searchResults.length > 0 ? (
              <motion.div 
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {searchResults.map((result, index) => {
                  const style = getCategoryStyle(result.category as keyof typeof theme.categories)
                  
                  return (
                    <motion.div
                      key={`${result.category}-${result.item.id || index}`}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative"
                    >
                      {/* Category Badge */}
                      <div 
                        className="absolute -top-2 -right-2 z-10 px-2 py-1 text-xs font-medium rounded-full border"
                        style={{
                          backgroundColor: style.bg,
                          color: style.text,
                          borderColor: style.border
                        }}
                      >
                        {result.categoryTitle}
                      </div>
                      
                      <AnatomyCard 
                        item={result.item} 
                        category={result.category}
                        searchResult={result}
                        onClick={() => {
                          setSelectedItem(result.item)
                          setSelectedCategory(result.category)
                        }}
                      />
                    </motion.div>
                  )
                })}
              </motion.div>
            ) : (
              <div className="text-center py-12">
                <Search className="h-16 w-16 mx-auto mb-4" style={{ color: theme.colors.gray[300] }} />
                <h3 className="text-lg font-medium mb-2" style={{ color: theme.colors.primary[900] }}>No results found</h3>
                <p className="max-w-md mx-auto" style={{ color: theme.colors.gray[500] }}>
                  Try different keywords or check your spelling. You can search for muscle names, 
                  anatomical terms, or functional descriptions.
                </p>
              </div>
            )}
          </>
        )}

        {/* Welcome State */}
        {!loading && !searchQuery && (
          <div className="text-center py-16">
            <Search className="h-20 w-20 mx-auto mb-6" style={{ color: theme.colors.gray[300] }} />
            <h2 className="text-2xl font-bold mb-4" style={{ color: theme.colors.primary[900] }}>
              Search All Anatomy Categories
            </h2>
            <p className="max-w-2xl mx-auto mb-8" style={{ color: theme.colors.primary[600] }}>
              Enter your search term above to find information across muscles, joints, ligaments, 
              tendons, neural structures, and exercises all at once.
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {categories.map(category => {
                const style = getCategoryStyle(category.id as keyof typeof theme.categories)
                return (
                  <Link
                    key={category.id}
                    href={`/explore/${category.id}`}
                    className="p-4 rounded-lg border-2 border-dashed hover:border-solid transition-all hover:shadow-md"
                    style={{
                      borderColor: style.border,
                      backgroundColor: style.bg
                    }}
                  >
                    <h3 className="font-semibold" style={{ color: style.text }}>{category.title}</h3>
                    <p className="text-sm mt-1" style={{ color: theme.colors.gray[600] }}>
                      Browse {category.title.toLowerCase()} specifically
                    </p>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <DetailModal
          item={selectedItem}
          category={selectedCategory}
          onClose={() => {
            setSelectedItem(null)
            setSelectedCategory('')
          }}
        />
      )}
    </main>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">
      <div 
        className="animate-spin rounded-full h-12 w-12 border-b-2"
        style={{ borderColor: theme.colors.primary[600] }}
      ></div>
    </div>}>
      <SearchPageContent />
    </Suspense>
  )
}