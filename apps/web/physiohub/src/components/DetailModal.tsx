'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Zap, Activity, Heart, Brain, AlertCircle, Dumbbell, BookOpen } from 'lucide-react'
import { useEffect } from 'react'
import { theme, getCategoryTheme } from '@/lib/theme'

interface DetailModalProps {
  item: any
  category: string
  onClose: () => void
}

export default function DetailModal({ item, category, onClose }: DetailModalProps) {
  const categoryTheme = getCategoryTheme(category)
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const renderMuscleDetails = () => (
    <>
      <Section title="Origin & Insertion" icon={MapPin}>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2" style={{ color: theme.colors.primary[600] }}>Origin</h4>
            <ul className="space-y-1">
              {item.origin?.map((o: string, i: number) => (
                <li key={i} className="text-sm flex items-start" style={{ color: theme.colors.gray[600] }}>
                  <span className="mr-2" style={{ color: categoryTheme.accent }}>•</span>
                  {o}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2" style={{ color: theme.colors.primary[600] }}>Insertion</h4>
            <ul className="space-y-1">
              {item.insertion?.map((i: string, idx: number) => (
                <li key={idx} className="text-sm flex items-start" style={{ color: theme.colors.gray[600] }}>
                  <span className="mr-2" style={{ color: categoryTheme.accent }}>•</span>
                  {i}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section title="Actions" icon={Activity}>
        <div className="grid md:grid-cols-2 gap-4">
          {item.actions?.bilateral && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Bilateral</h4>
              <ul className="space-y-1">
                {item.actions.bilateral.map((a: string, i: number) => (
                  <li key={i} className="text-sm text-gray-600">• {a}</li>
                ))}
              </ul>
            </div>
          )}
          {item.actions?.unilateral && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Unilateral</h4>
              <ul className="space-y-1">
                {item.actions.unilateral.map((a: string, i: number) => (
                  <li key={i} className="text-sm text-gray-600">• {a}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Section>

      <Section title="Innervation" icon={Brain}>
        <p className="font-medium" style={{ color: theme.colors.primary[600] }}>{item.innervation?.nerve}</p>
        <p className="text-sm" style={{ color: theme.colors.gray[600] }}>
          Nerve roots: {item.innervation?.nerve_roots?.join(', ')}
        </p>
      </Section>

      {item.clinical_relevance && (
        <Section title="Clinical Relevance" icon={AlertCircle}>
          <p style={{ color: theme.colors.primary[600] }}>{item.clinical_relevance}</p>
          {item.common_conditions && (
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700 mb-1">Common Conditions:</p>
              <div className="flex flex-wrap gap-2">
                {item.common_conditions.map((c: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Section>
      )}
    </>
  )

  const renderLigamentDetails = () => (
    <>
      <Section title="Attachments" icon={MapPin}>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-700 mb-1">Origin</h4>
            <p className="text-sm text-gray-600">{item.attachments?.origin}</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-1">Insertion</h4>
            <p className="text-sm text-gray-600">{item.attachments?.insertion}</p>
          </div>
        </div>
      </Section>

      <Section title="Function" icon={Zap}>
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Primary Function</h4>
            <ul className="space-y-1">
              {item.primary_function?.map((f: string, i: number) => (
                <li key={i} className="text-sm text-gray-600">• {f}</li>
              ))}
            </ul>
          </div>
          {item.secondary_function && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Secondary Function</h4>
              <ul className="space-y-1">
                {item.secondary_function.map((f: string, i: number) => (
                  <li key={i} className="text-sm text-gray-600">• {f}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Section>

      {item.biomechanics && (
        <Section title="Biomechanics" icon={Activity}>
          <div className="grid gap-2">
            {Object.entries(item.biomechanics).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                <span className="font-medium text-gray-800">{String(value)}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {item.clinical_tests && (
        <Section title="Clinical Tests" icon={AlertCircle}>
          <ul className="space-y-2">
            {item.clinical_tests.map((test: string, i: number) => (
              <li key={i} className="text-gray-700 flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                {test}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  )

  const renderExerciseDetails = () => (
    <>
      <Section title="Exercise Information" icon={Dumbbell}>
        <div className="grid md:grid-cols-3 gap-4">
          {item.category && (
            <div className="text-center">
              <h4 className="font-medium text-gray-700 mb-1">Category</h4>
              <span 
                className="px-3 py-1 text-sm rounded-full"
                style={{
                  backgroundColor: categoryTheme.bg,
                  color: categoryTheme.text
                }}
              >
                {item.category}
              </span>
            </div>
          )}
          {item.difficulty && (
            <div className="text-center">
              <h4 className="font-medium text-gray-700 mb-1">Difficulty</h4>
              <span className={`px-3 py-1 text-sm rounded-full ${
                item.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                item.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {item.difficulty}
              </span>
            </div>
          )}
          {item.equipment && (
            <div className="text-center">
              <h4 className="font-medium text-gray-700 mb-1">Equipment</h4>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                {Array.isArray(item.equipment) ? item.equipment[0] : item.equipment}
              </span>
            </div>
          )}
        </div>
      </Section>

      <Section title="Exercise Description" icon={BookOpen}>
        <p className="text-gray-700 leading-relaxed">{item.description}</p>
      </Section>

      <Section title="Exercise Protocol" icon={Activity}>
        <div className="grid md:grid-cols-2 gap-4">
          {item.sets && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Sets & Repetitions</h4>
              <p className="text-blue-800">{item.sets}</p>
            </div>
          )}
          {item.frequency && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Frequency</h4>
              <p className="text-green-800">{item.frequency}</p>
            </div>
          )}
        </div>
      </Section>

      {item.muscle_groups && (
        <Section title="Target Muscles" icon={Dumbbell}>
          <div className="flex flex-wrap gap-2">
            {item.muscle_groups.map((muscle: string, i: number) => (
              <span key={i} className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full">
                {muscle}
              </span>
            ))}
          </div>
        </Section>
      )}

      {item.clinical_applications && (
        <Section title="Clinical Applications" icon={Heart}>
          <div className="flex flex-wrap gap-2">
            {item.clinical_applications.map((application: string, i: number) => (
              <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                {application}
              </span>
            ))}
          </div>
        </Section>
      )}

      {item.contraindications && (
        <Section title="Contraindications" icon={AlertCircle}>
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <ul className="space-y-1">
                  {item.contraindications.map((contraindication: string, i: number) => (
                    <li key={i} className="text-red-800">• {contraindication}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Section>
      )}

      <Section title="Exercise Tips" icon={Zap}>
        <div className="bg-gray-50 p-4 rounded-lg">
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-500 mr-2 mt-1">•</span>
              Move slowly and controlled throughout the exercise
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2 mt-1">•</span>
              Stop if you experience sharp pain or discomfort
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2 mt-1">•</span>
              Breathe normally during the exercise
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2 mt-1">•</span>
              Consistency is key for best results
            </li>
          </ul>
        </div>
      </Section>
    </>
  )

  const renderTendonDetails = () => (
    <>
      <Section title="Anatomical Information" icon={MapPin}>
        <div className="space-y-3">
          {item.muscles_involved && (
            <div>
              <h4 className="font-medium text-gray-700 mb-1">Muscles Involved</h4>
              <p className="text-gray-600">{item.muscles_involved.join(', ')}</p>
            </div>
          )}
          <div>
            <h4 className="font-medium text-gray-700 mb-1">Region</h4>
            <p className="text-gray-600">{item.region}</p>
          </div>
          {item.insertion && (
            <div>
              <h4 className="font-medium text-gray-700 mb-1">Insertion</h4>
              <p className="text-gray-600">{item.insertion}</p>
            </div>
          )}
        </div>
      </Section>

      {item.attachment_points && (
        <Section title="Attachment Points" icon={MapPin}>
          <div className="space-y-2">
            {Object.entries(item.attachment_points).map(([key, value]) => (
              <div key={key}>
                <h4 className="font-medium text-gray-700 mb-1 capitalize">{key.replace(/_/g, ' ')}</h4>
                <p className="text-sm text-gray-600">{String(value)}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {item.biomechanics && (
        <Section title="Biomechanics" icon={Activity}>
          <div className="space-y-2">
            {Object.entries(item.biomechanics).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                <span className="font-medium text-gray-800">{String(value)}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {item.common_pathologies && (
        <Section title="Common Pathologies" icon={AlertCircle}>
          <div className="space-y-3">
            {Object.entries(item.common_pathologies).map(([key, value]: [string, any]) => (
              <div key={key}>
                <h4 className="font-medium text-gray-700 mb-2 capitalize">{key.replace(/_/g, ' ')}</h4>
                {typeof value === 'object' && !Array.isArray(value) ? (
                  <div className="pl-4 space-y-1">
                    {Object.entries(value).map(([k, v]) => (
                      <div key={k} className="text-sm">
                        <span className="text-gray-600 capitalize">{k.replace(/_/g, ' ')}:</span>
                        <span className="text-gray-700 ml-2">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                ) : Array.isArray(value) ? (
                  <ul className="space-y-1">
                    {value.map((v: any, i: number) => (
                      <li key={i} className="text-sm text-gray-600">• {v}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-600">{String(value)}</p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {item.clinical_tests && (
        <Section title="Clinical Tests" icon={Activity}>
          <ul className="space-y-2">
            {item.clinical_tests.map((test: string, i: number) => (
              <li key={i} className="text-gray-700 flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                {test}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  )

  const renderJointDetails = () => (
    <>
      <Section title="Joint Information" icon={Activity}>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Type:</span>
            <span className="font-medium">{item.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Joint:</span>
            <span className="font-medium">{item.joint}</span>
          </div>
        </div>
      </Section>

      {item.functions && (
        <Section title="Functions" icon={Zap}>
          <ul className="space-y-2">
            {item.functions.map((func: string, i: number) => (
              <li key={i} className="text-gray-700 flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                {func}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {item.components && (
        <Section title="Components" icon={Activity}>
          <div className="space-y-3">
            {Object.entries(item.components).map(([key, value]) => (
              <div key={key}>
                <h4 className="font-medium text-gray-700 mb-2 capitalize">{key.replace(/_/g, ' ')}</h4>
                {typeof value === 'object' && value !== null ? (
                  <div className="pl-4 space-y-1">
                    {Object.entries(value).map(([k, v]) => (
                      <div key={k} className="text-sm">
                        <span className="text-gray-600 capitalize">{k.replace(/_/g, ' ')}:</span>
                        {Array.isArray(v) ? (
                          <ul className="mt-1">
                            {v.map((item: any, i: number) => (
                              <li key={i} className="text-gray-700 ml-4">• {item}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-gray-700 ml-2">{String(v)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">{String(value)}</p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}
    </>
  )

  const renderNeuralDetails = () => (
    <>
      <Section title="Neural Structure Information" icon={Brain}>
        <div className="space-y-2">
          {item.nerve_roots && (
            <div className="flex justify-between">
              <span className="text-gray-600">Nerve Roots:</span>
              <span className="font-medium">{item.nerve_roots}</span>
            </div>
          )}
          {item.origin && (
            <div className="flex justify-between">
              <span className="text-gray-600">Origin:</span>
              <span className="font-medium">{item.origin}</span>
            </div>
          )}
        </div>
      </Section>

      {item.course && (
        <Section title="Course" icon={Activity}>
          <ul className="space-y-2">
            {item.course.map((courseItem: string, i: number) => (
              <li key={i} className="text-gray-700 flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                {courseItem}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {item.motor_innervation && (
        <Section title="Motor Innervation" icon={Zap}>
          <div className="space-y-3">
            {Object.entries(item.motor_innervation).map(([region, muscles]: [string, any]) => (
              <div key={region}>
                <h4 className="font-medium text-gray-700 mb-2 capitalize">{region}</h4>
                <ul className="space-y-1">
                  {Array.isArray(muscles) ? muscles.map((muscle: string, i: number) => (
                    <li key={i} className="text-sm text-gray-600">• {muscle}</li>
                  )) : <li className="text-sm text-gray-600">{String(muscles)}</li>}
                </ul>
              </div>
            ))}
          </div>
        </Section>
      )}

      {item.sensory_innervation && (
        <Section title="Sensory Innervation" icon={Activity}>
          <ul className="space-y-2">
            {item.sensory_innervation.map((area: string, i: number) => (
              <li key={i} className="text-gray-700 flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                {area}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {item.common_compression_sites && (
        <Section title="Common Compression Sites" icon={AlertCircle}>
          <ul className="space-y-2">
            {item.common_compression_sites.map((site: string, i: number) => (
              <li key={i} className="text-gray-700 flex items-start">
                <span className="text-red-500 mr-2">•</span>
                {site}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {item.clinical_conditions && (
        <Section title="Clinical Conditions" icon={AlertCircle}>
          <div className="space-y-4">
            {Object.entries(item.clinical_conditions).map(([condition, details]: [string, any]) => (
              <div key={condition} className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2 capitalize">{condition.replace(/_/g, ' ')}</h4>
                <div className="space-y-2">
                  {Object.entries(details).map(([key, value]: [string, any]) => (
                    <div key={key}>
                      <span className="text-sm font-medium text-gray-700 capitalize">{key.replace(/_/g, ' ')}:</span>
                      {Array.isArray(value) ? (
                        <ul className="mt-1 ml-4">
                          {value.map((item: any, i: number) => (
                            <li key={i} className="text-sm text-gray-600">• {item}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-sm text-gray-600 ml-2">{String(value)}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {item.treatment_approaches && (
        <Section title="Treatment Approaches" icon={Heart}>
          <div className="space-y-3">
            {Object.entries(item.treatment_approaches).map(([approach, details]: [string, any]) => (
              <div key={approach} className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-medium text-gray-700 mb-2 capitalize">{approach.replace(/_/g, ' ')}</h4>
                {typeof details === 'object' ? (
                  <div className="space-y-2">
                    {Object.entries(details).map(([key, value]: [string, any]) => (
                      <div key={key}>
                        <span className="text-sm font-medium text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                        {Array.isArray(value) ? (
                          <ul className="mt-1 ml-4">
                            {value.map((item: any, i: number) => (
                              <li key={i} className="text-sm text-gray-600">• {item}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-sm text-gray-600 ml-2">{String(value)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">{String(details)}</p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}
    </>
  )

  const renderContent = () => {
    switch (category) {
      case 'muscles':
        return renderMuscleDetails()
      case 'ligaments':
        return renderLigamentDetails()
      case 'tendons':
        return renderTendonDetails()
      case 'joints':
        return renderJointDetails()
      case 'neural':
        return renderNeuralDetails()
      case 'exercises':
        return renderExerciseDetails()
      default:
        return <div>Content for {category} coming soon...</div>
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          <div 
            className="sticky top-0 bg-white px-6 py-4 flex items-center justify-between border-b"
            style={{ borderColor: theme.colors.primary[100] }}
          >
            <div>
              <h2 className="text-2xl font-bold" style={{ color: theme.colors.primary[900] }}>
                {item.name}
              </h2>
              {item.latin_name && (
                <p className="text-sm italic" style={{ color: theme.colors.gray[500] }}>
                  {item.latin_name}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full transition-colors"
              style={{}}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.gray[100]}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <X className="h-5 w-5" style={{ color: theme.colors.gray[500] }} />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            <div className="p-6 space-y-6">
              {renderContent()}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div 
      className="rounded-lg p-4"
      style={{ backgroundColor: theme.colors.primary[50] }}
    >
      <div className="flex items-center mb-3">
        <Icon className="h-5 w-5 mr-2" style={{ color: theme.colors.primary[600] }} />
        <h3 className="text-lg font-semibold" style={{ color: theme.colors.primary[900] }}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  )
}