// Advanced fuzzy search utility with scoring and ranking

export interface SearchResult<T> {
  item: T
  score: number
  matches: SearchMatch[]
}

export interface SearchMatch {
  field: string
  value: string
  indices: number[]
  score: number
}

export interface SearchOptions {
  threshold: number // Minimum score to include in results (0-1)
  limit?: number // Maximum number of results
  includeScore: boolean
  includeMatches: boolean
  keys: SearchKey[] // Fields to search in
}

export interface SearchKey {
  name: string
  weight: number // Weight for scoring (higher = more important)
  getFn?: (obj: any) => string | string[] // Custom getter function
}

export class FuzzySearch<T> {
  private options: SearchOptions

  constructor(options: Partial<SearchOptions> = {}) {
    this.options = {
      threshold: 0.3,
      limit: 50,
      includeScore: true,
      includeMatches: true,
      keys: [],
      ...options
    }
  }

  search(items: T[], query: string): SearchResult<T>[] {
    if (!query.trim()) return items.map(item => ({ item, score: 1, matches: [] }))

    const normalizedQuery = this.normalizeString(query)
    const queryWords = normalizedQuery.split(/\s+/).filter(word => word.length > 0)

    const results: SearchResult<T>[] = []

    for (const item of items) {
      const itemResult = this.searchItem(item, queryWords, normalizedQuery)
      if (itemResult.score >= this.options.threshold) {
        results.push(itemResult)
      }
    }

    // Sort by score (descending) and take top results
    results.sort((a, b) => b.score - a.score)
    
    if (this.options.limit) {
      return results.slice(0, this.options.limit)
    }

    return results
  }

  private searchItem(item: T, queryWords: string[], fullQuery: string): SearchResult<T> {
    let totalScore = 0
    let maxScore = 0
    const matches: SearchMatch[] = []

    for (const key of this.options.keys) {
      const fieldValue = this.getFieldValue(item, key)
      if (!fieldValue) continue

      const values = Array.isArray(fieldValue) ? fieldValue : [fieldValue]
      
      for (const value of values) {
        const normalizedValue = this.normalizeString(value)
        const fieldMatch = this.matchField(normalizedValue, queryWords, fullQuery)
        
        if (fieldMatch.score > 0) {
          const weightedScore = fieldMatch.score * key.weight
          totalScore += weightedScore
          maxScore += key.weight
          
          matches.push({
            field: key.name,
            value: value,
            indices: fieldMatch.indices,
            score: fieldMatch.score
          })
        }
      }
    }

    const finalScore = maxScore > 0 ? totalScore / maxScore : 0

    return {
      item,
      score: Math.min(finalScore, 1),
      matches: matches.sort((a, b) => b.score - a.score)
    }
  }

  private matchField(fieldValue: string, queryWords: string[], fullQuery: string) {
    let bestScore = 0
    let bestIndices: number[] = []

    // 1. Exact match (highest score)
    if (fieldValue.includes(fullQuery)) {
      const startIndex = fieldValue.indexOf(fullQuery)
      return {
        score: 1.0,
        indices: Array.from({ length: fullQuery.length }, (_, i) => startIndex + i)
      }
    }

    // 2. Word-based matching
    for (const word of queryWords) {
      if (fieldValue.includes(word)) {
        const startIndex = fieldValue.indexOf(word)
        const wordScore = 0.8 * (word.length / fullQuery.length)
        if (wordScore > bestScore) {
          bestScore = wordScore
          bestIndices = Array.from({ length: word.length }, (_, i) => startIndex + i)
        }
      }
    }

    // 3. Fuzzy character matching
    const fuzzyResult = this.fuzzyMatch(fieldValue, fullQuery)
    if (fuzzyResult.score > bestScore) {
      bestScore = fuzzyResult.score
      bestIndices = fuzzyResult.indices
    }

    // 4. Substring matching with different positions
    for (const word of queryWords) {
      const substringScore = this.substringMatch(fieldValue, word)
      if (substringScore.score > bestScore) {
        bestScore = substringScore.score
        bestIndices = substringScore.indices
      }
    }

    return { score: bestScore, indices: bestIndices }
  }

  private fuzzyMatch(text: string, pattern: string) {
    const textLen = text.length
    const patternLen = pattern.length
    
    if (patternLen === 0) return { score: 1, indices: [] }
    if (textLen === 0) return { score: 0, indices: [] }

    // Dynamic programming approach for fuzzy matching
    const dp: number[][] = Array(patternLen + 1).fill(null).map(() => Array(textLen + 1).fill(0))
    const matches: boolean[][] = Array(patternLen + 1).fill(null).map(() => Array(textLen + 1).fill(false))

    // Initialize first row
    for (let j = 0; j <= textLen; j++) {
      dp[0][j] = 1
    }

    for (let i = 1; i <= patternLen; i++) {
      for (let j = 1; j <= textLen; j++) {
        if (pattern[i - 1].toLowerCase() === text[j - 1].toLowerCase()) {
          dp[i][j] = dp[i - 1][j - 1]
          matches[i][j] = true
        } else {
          dp[i][j] = Math.max(
            dp[i - 1][j] * 0.9, // Skip character in pattern
            dp[i][j - 1] * 0.9  // Skip character in text
          )
        }
      }
    }

    // Backtrack to find matching indices
    const indices: number[] = []
    let i = patternLen, j = textLen
    while (i > 0 && j > 0) {
      if (matches[i][j]) {
        indices.unshift(j - 1)
        i--
        j--
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        i--
      } else {
        j--
      }
    }

    const score = dp[patternLen][textLen] * (indices.length / patternLen)
    return { score: Math.min(score, 1), indices }
  }

  private substringMatch(text: string, pattern: string) {
    const index = text.indexOf(pattern)
    if (index === -1) return { score: 0, indices: [] }

    // Higher score for matches at the beginning
    const positionScore = index === 0 ? 1 : 0.7
    const lengthScore = pattern.length / text.length
    const score = positionScore * lengthScore * 0.6

    return {
      score,
      indices: Array.from({ length: pattern.length }, (_, i) => index + i)
    }
  }

  private getFieldValue(item: any, key: SearchKey): string | string[] | null {
    if (key.getFn) {
      return key.getFn(item)
    }

    const value = this.getNestedValue(item, key.name)
    if (value == null) return null
    
    if (typeof value === 'string') return value
    if (Array.isArray(value)) return value.map(String)
    
    return String(value)
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  private normalizeString(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^\w\s]/g, ' ') // Replace special chars with spaces
      .replace(/\s+/g, ' ') // Collapse multiple spaces
      .trim()
  }
}

// Predefined search configurations for different anatomy types
export const getSearchConfig = (category: string): SearchOptions => {
  const baseConfig = {
    threshold: 0.2,
    limit: 100,
    includeScore: true,
    includeMatches: true
  }

  switch (category) {
    case 'muscles':
      return {
        ...baseConfig,
        keys: [
          { name: 'name', weight: 3.0 },
          { name: 'latin_name', weight: 2.5 },
          { name: 'muscle_group', weight: 2.0 },
          { name: 'clinical_relevance', weight: 1.5 },
          { name: 'origin', weight: 1.2, getFn: (item) => Array.isArray(item.origin) ? item.origin.join(' ') : item.origin },
          { name: 'insertion', weight: 1.2, getFn: (item) => Array.isArray(item.insertion) ? item.insertion.join(' ') : item.insertion },
          { name: 'actions.bilateral', weight: 1.0, getFn: (item) => item.actions?.bilateral?.join(' ') || '' },
          { name: 'actions.unilateral', weight: 1.0, getFn: (item) => item.actions?.unilateral?.join(' ') || '' },
          { name: 'innervation.nerve', weight: 1.0 },
          { name: 'common_conditions', weight: 1.0, getFn: (item) => item.common_conditions?.join(' ') || '' }
        ]
      }

    case 'ligaments':
      return {
        ...baseConfig,
        keys: [
          { name: 'name', weight: 3.0 },
          { name: 'latin_name', weight: 2.5 },
          { name: 'region', weight: 2.0 },
          { name: 'attachments.origin', weight: 1.5 },
          { name: 'attachments.insertion', weight: 1.5 },
          { name: 'primary_function', weight: 1.2, getFn: (item) => item.primary_function?.join(' ') || '' },
          { name: 'common_injuries', weight: 1.0, getFn: (item) => item.common_injuries?.join(' ') || '' },
          { name: 'clinical_tests', weight: 1.0, getFn: (item) => item.clinical_tests?.join(' ') || '' }
        ]
      }

    case 'joints':
      return {
        ...baseConfig,
        keys: [
          { name: 'name', weight: 3.0 },
          { name: 'latin_name', weight: 2.5 },
          { name: 'type', weight: 2.0 },
          { name: 'joint', weight: 2.0 },
          { name: 'functions', weight: 1.5, getFn: (item) => item.functions?.join(' ') || '' }
        ]
      }

    case 'tendons':
      return {
        ...baseConfig,
        keys: [
          { name: 'name', weight: 3.0 },
          { name: 'latin_name', weight: 2.5 },
          { name: 'region', weight: 2.0 },
          { name: 'muscles_involved', weight: 1.8, getFn: (item) => item.muscles_involved?.join(' ') || '' },
          { name: 'insertion', weight: 1.5 },
          { name: 'clinical_tests', weight: 1.0, getFn: (item) => item.clinical_tests?.join(' ') || '' }
        ]
      }

    case 'neural':
      return {
        ...baseConfig,
        keys: [
          { name: 'name', weight: 3.0 },
          { name: 'latin_name', weight: 2.5 },
          { name: 'nerve_roots', weight: 2.0 },
          { name: 'origin', weight: 1.8 },
          { name: 'course', weight: 1.5, getFn: (item) => item.course?.join(' ') || '' },
          { name: 'sensory_innervation', weight: 1.2, getFn: (item) => item.sensory_innervation?.join(' ') || '' },
          { name: 'common_compression_sites', weight: 1.0, getFn: (item) => item.common_compression_sites?.join(' ') || '' }
        ]
      }

    case 'exercises':
      return {
        ...baseConfig,
        keys: [
          { name: 'name', weight: 3.0 },
          { name: 'description', weight: 2.0 },
          { name: 'category', weight: 1.8 },
          { name: 'muscle_groups', weight: 1.5, getFn: (item) => item.muscle_groups?.join(' ') || '' },
          { name: 'clinical_applications', weight: 1.2, getFn: (item) => item.clinical_applications?.join(' ') || '' },
          { name: 'equipment', weight: 0.8, getFn: (item) => item.equipment?.join(' ') || '' }
        ]
      }

    default:
      return {
        ...baseConfig,
        keys: [
          { name: 'name', weight: 3.0 },
          { name: 'latin_name', weight: 2.0 },
          { name: 'description', weight: 1.5 }
        ]
      }
  }
}

// Helper function for highlighting search matches
export const highlightMatches = (text: string, indices: number[]): string => {
  if (!indices.length) return text

  let result = ''
  let lastIndex = 0

  // Sort indices to ensure proper highlighting
  const sortedIndices = [...indices].sort((a, b) => a - b)
  
  for (const index of sortedIndices) {
    if (index >= lastIndex) {
      result += text.slice(lastIndex, index)
      result += `<mark class="bg-yellow-200 px-1 rounded">${text[index]}</mark>`
      lastIndex = index + 1
    }
  }
  
  result += text.slice(lastIndex)
  return result
}