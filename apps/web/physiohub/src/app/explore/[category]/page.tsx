'use client'

import { useEffect, useState, use } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, Search, Filter, ArrowLeft, BookOpen, Zap, Brain, Activity } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { loadData, AnatomyType } from '@/lib/data'
import { FuzzySearch, getSearchConfig, SearchResult } from '@/lib/search'
import AnatomyCard from '@/components/AnatomyCard'
import DetailModal from '@/components/DetailModal'
import { theme } from '@/lib/theme'

export default function ExplorePage({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = use(params)
  const searchParams = useSearchParams()
  const [data, setData] = useState<any[]>([])
  const [filteredData, setFilteredData] = useState<SearchResult<any>[]>([])
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterBy, setFilterBy] = useState('')
  const [loading, setLoading] = useState(true)
  const [searchResults, setSearchResults] = useState<SearchResult<any>[]>([])
  const [fuzzySearch, setFuzzySearch] = useState<FuzzySearch<any> | null>(null)

  const categoryTitles: Record<string, string> = {
    muscles: 'Muscles',
    joints: 'Joint Structures',
    ligaments: 'Ligaments',
    tendons: 'Tendons',
    neural: 'Neural Structures',
    exercises: 'Exercises'
  }

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const result = await loadData(resolvedParams.category as AnatomyType)
      setData(result)
      
      // Initialize fuzzy search with category-specific configuration
      const searchConfig = getSearchConfig(resolvedParams.category)
      const search = new FuzzySearch(searchConfig)
      setFuzzySearch(search)
      
      // Initial results (no search query)
      const initialResults = result.map(item => ({ item, score: 1, matches: [] }))
      setFilteredData(initialResults)
      setSearchResults(initialResults)
      setLoading(false)
    }
    fetchData()
  }, [resolvedParams.category])

  // Handle URL search parameter
  useEffect(() => {
    const urlSearch = searchParams.get('search')
    if (urlSearch) {
      setSearchQuery(urlSearch)
    }
  }, [searchParams])

  useEffect(() => {
    if (!fuzzySearch) return

    // Perform fuzzy search
    let results = searchQuery.trim() 
      ? fuzzySearch.search(data, searchQuery)
      : data.map(item => ({ item, score: 1, matches: [] }))

    // Apply category-based filters
    if (filterBy) {
      results = results.filter(result => {
        const item = result.item
        if (resolvedParams.category === 'muscles') {
          return item.muscle_group === filterBy
        } else if (resolvedParams.category === 'ligaments' || resolvedParams.category === 'tendons') {
          return item.region === filterBy
        }
        return true
      })
    }

    setSearchResults(results)
    setFilteredData(results)
  }, [searchQuery, filterBy, data, fuzzySearch, resolvedParams.category])

  const getFilterOptions = () => {
    if (resolvedParams.category === 'muscles') {
      return [...new Set(data.map(item => item.muscle_group))].filter(Boolean)
    } else if (resolvedParams.category === 'ligaments' || resolvedParams.category === 'tendons') {
      return [...new Set(data.map(item => item.region))].filter(Boolean)
    }
    return []
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: theme.colors.primary[50] }}>
      <div 
        className="sticky top-0 z-40 bg-white border-b"
        style={{ borderColor: theme.colors.primary[100] }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link 
              href="/" 
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              style={{ color: theme.colors.primary[600] }}
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </Link>
            <h1 className="text-xl font-semibold" style={{ color: theme.colors.primary[900] }}>
              {categoryTitles[resolvedParams.category]}
            </h1>
            <div className="w-20" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder={`Search ${categoryTitles[resolvedParams.category].toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{
                borderColor: theme.colors.primary[100],
                '--tw-ring-color': theme.colors.primary[600]
              } as React.CSSProperties}
            />
          </div>
          
          {getFilterOptions().length > 0 && (
            <div className="relative">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="appearance-none bg-white border rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2"
                style={{
                  borderColor: theme.colors.primary[100],
                  '--tw-ring-color': theme.colors.primary[600]
                } as React.CSSProperties}
              >
                <option value="">All {resolvedParams.category === 'muscles' ? 'Groups' : 'Regions'}</option>
                {getFilterOptions().map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
            </div>
          )}
        </div>

        {searchQuery && (
          <div 
            className="mb-6 p-4 rounded-lg border"
            style={{
              backgroundColor: theme.colors.primary[50],
              borderColor: theme.colors.primary[100]
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: theme.colors.primary[900] }}>
                  Found {filteredData.length} result{filteredData.length !== 1 ? 's' : ''} for "{searchQuery}"
                </p>
                {filteredData.length > 0 && (
                  <p className="text-xs mt-1" style={{ color: theme.colors.primary[600] }}>
                    Showing results sorted by relevance
                  </p>
                )}
              </div>
              {filteredData.length > 0 && (
                <div className="text-xs" style={{ color: theme.colors.primary[600] }}>
                  Avg. relevance: {Math.round(filteredData.reduce((acc, result) => acc + result.score, 0) / filteredData.length * 100)}%
                </div>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div 
              className="animate-spin rounded-full h-12 w-12 border-b-2"
              style={{ borderColor: theme.colors.primary[600] }}
            ></div>
          </div>
        ) : (
          <motion.div 
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {filteredData.map((result, index) => (
              <motion.div
                key={result.item.id || index}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <AnatomyCard 
                  item={result.item} 
                  category={resolvedParams.category}
                  searchResult={result}
                  onClick={() => setSelectedItem(result.item)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {filteredData.length === 0 && !loading && (
          <div className="text-center py-12">
            <p style={{ color: theme.colors.gray[500] }}>No results found for your search criteria.</p>
          </div>
        )}
      </div>

      {selectedItem && (
        <DetailModal
          item={selectedItem}
          category={resolvedParams.category}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </main>
  )
}