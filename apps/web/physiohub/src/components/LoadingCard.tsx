import { motion } from 'framer-motion'

export default function LoadingCard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-lg shadow-md overflow-hidden"
    >
      <div className="p-6">
        {/* Header skeleton */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="h-6 bg-gray-200 rounded-md mb-2"
              style={{ width: '75%' }}
            />
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
              className="h-4 bg-gray-200 rounded-md"
              style={{ width: '60%' }}
            />
          </div>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
            className="ml-4 w-9 h-9 bg-gray-200 rounded-lg"
          />
        </div>

        {/* Subtitle skeleton */}
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          className="h-4 bg-gray-200 rounded-md mb-3"
          style={{ width: '40%' }}
        />

        {/* Highlights skeleton */}
        <div className="space-y-2 mb-4">
          {[0, 1].map((index) => (
            <div key={index} className="flex items-center">
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 + index * 0.1 }}
                className="w-2 h-2 bg-gray-200 rounded-full mr-2"
              />
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 + index * 0.1 }}
                className="h-4 bg-gray-200 rounded-md"
                style={{ width: index === 0 ? '70%' : '50%' }}
              />
            </div>
          ))}
        </div>

        {/* Clinical relevance skeleton */}
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
          className="p-3 bg-gray-100 rounded-lg"
        >
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded-md" style={{ width: '100%' }} />
            <div className="h-3 bg-gray-200 rounded-md" style={{ width: '80%' }} />
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}