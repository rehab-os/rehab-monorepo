import { motion } from 'framer-motion'
import { Dumbbell, Activity, Zap, Brain, Heart, BookOpen } from 'lucide-react'
import { SearchResult, highlightMatches } from '@/lib/search'
import { theme, getCategoryTheme } from '@/lib/theme'

interface AnatomyCardProps {
  item: any
  category: string
  searchResult?: SearchResult<any>
  onClick: () => void
}

export default function AnatomyCard({ item, category, searchResult, onClick }: AnatomyCardProps) {
  const getIcon = () => {
    switch (category) {
      case 'muscles': return Dumbbell
      case 'joints': return Activity
      case 'ligaments': return Zap
      case 'neural': return Brain
      case 'tendons': return Heart
      case 'exercises': return BookOpen
      default: return Activity
    }
  }

  const Icon = getIcon()
  
  const getSubtitle = () => {
    if (category === 'muscles') return item.muscle_group
    if (category === 'ligaments' || category === 'tendons') return item.region
    if (category === 'joints') return item.type
    if (category === 'neural') return item.nerve_roots
    if (category === 'exercises') return item.sets
    return ''
  }

  const getHighlights = () => {
    if (category === 'muscles') {
      const bilateral = Array.isArray(item.actions?.bilateral) ? item.actions.bilateral : []
      const unilateral = Array.isArray(item.actions?.unilateral) ? item.actions.unilateral : []
      return [...bilateral, ...unilateral]
    }
    if (category === 'ligaments') {
      return Array.isArray(item.primary_function) ? item.primary_function : []
    }
    if (category === 'joints') {
      return Array.isArray(item.functions) ? item.functions : []
    }
    if (category === 'exercises') {
      const highlights = []
      if (item.frequency) highlights.push(`Frequency: ${item.frequency}`)
      if (item.sets) highlights.push(`Sets: ${item.sets}`)
      return highlights
    }
    if (category === 'tendons') {
      return Array.isArray(item.zones) ? item.zones : []
    }
    if (category === 'neural') {
      const branches = item.branches ? Object.keys(item.branches) : []
      return branches
    }
    return []
  }

  const getHighlightedText = (text: string, fieldName: string) => {
    if (!searchResult || !searchResult.matches.length) return text
    
    const match = searchResult.matches.find(m => m.field === fieldName)
    if (!match || !match.indices.length) return text
    
    return highlightMatches(text, match.indices)
  }

  const renderHighlightedText = (text: string, fieldName: string) => {
    const highlighted = getHighlightedText(text, fieldName)
    if (highlighted === text) return text
    
    return <span dangerouslySetInnerHTML={{ __html: highlighted }} />
  }

  const categoryTheme = getCategoryTheme(category)

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
      style={{
        boxShadow: `0 4px 6px -1px ${theme.colors.primary[600]}20, 0 2px 4px -1px ${theme.colors.primary[600]}10`
      }}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1" style={{ color: theme.colors.primary[900] }}>
              {renderHighlightedText(item.name, 'name')}
            </h3>
            {item.latin_name && (
              <p className="text-sm italic" style={{ color: theme.colors.gray[500] }}>
                {renderHighlightedText(item.latin_name, 'latin_name')}
              </p>
            )}
          </div>
          <div 
            className="ml-4 p-2 rounded-lg"
            style={{ backgroundColor: categoryTheme.bg }}
          >
            <Icon className="h-5 w-5" style={{ color: categoryTheme.accent }} />
          </div>
        </div>

        {getSubtitle() && (
          <p className="text-sm font-medium mb-3" style={{ color: theme.colors.primary[600] }}>
            {getSubtitle()}
          </p>
        )}

        <div className="space-y-2">
          {(getHighlights() || []).slice(0, 2).map((highlight: string, index: number) => (
            <div key={index} className="flex items-center text-sm" style={{ color: theme.colors.gray[600] }}>
              <span 
                className="w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: categoryTheme.accent }}
              ></span>
              {highlight}
            </div>
          ))}
        </div>

        {item.clinical_relevance && (
          <div 
            className="mt-4 p-3 rounded-lg"
            style={{ backgroundColor: theme.colors.warning[50] }}
          >
            <p className="text-xs line-clamp-2" style={{ color: theme.colors.warning[700] }}>
              {renderHighlightedText(item.clinical_relevance, 'clinical_relevance')}
            </p>
          </div>
        )}

        {searchResult && searchResult.score < 1 && (
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs" style={{ color: theme.colors.gray[500] }}>Search relevance:</span>
            <div className="flex items-center">
              <div 
                className="w-16 h-1 rounded-full overflow-hidden"
                style={{ backgroundColor: theme.colors.gray[200] }}
              >
                <div 
                  className="h-full transition-all duration-300"
                  style={{ 
                    backgroundColor: categoryTheme.accent,
                    width: `${Math.round(searchResult.score * 100)}%` 
                  }}
                />
              </div>
              <span className="ml-2 text-xs" style={{ color: theme.colors.gray[600] }}>
                {Math.round(searchResult.score * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}