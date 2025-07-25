// Import all JSON data files
import headAndNeckMuscles from '../../../../../database/mustles/01_head_and_neck_muscles.json'
import shoulderComplex from '../../../../../database/mustles/02_shoulder_complex.json'
import upperArm from '../../../../../database/mustles/03_upper_arm.json'
import forearmAndHand from '../../../../../database/mustles/04_forearm_and_hand.json'
import trunkAndCore from '../../../../../database/mustles/05_trunk_and_core.json'
import hipAndPelvis from '../../../../../database/mustles/06_hip_and_pelvis.json'
import thigh from '../../../../../database/mustles/07_thigh.json'
import lowerLeg from '../../../../../database/mustles/08_lower_leg.json'
import footIntrinsic from '../../../../../database/mustles/09_foot_intrinsic.json'
import jointStructures from '../../../../../database/joint_structures.json'
import ligaments from '../../../../../database/ligaments.json'
import tendons from '../../../../../database/tendons.json'
import neuralStructure from '../../../../../database/neural_structure.json'
import neckExercises from '../../../../../database/excercises/neck_excercise.json'

export interface Muscle {
  id: string
  name: string
  latin_name: string
  muscle_group: string
  origin: string[]
  insertion: string[]
  innervation: {
    nerve: string
    nerve_roots: string[]
  }
  blood_supply: string[]
  actions: {
    bilateral?: string[]
    unilateral?: string[]
  }
  synergists: string[]
  antagonists: string[]
  functional_movements: string[]
  clinical_relevance: string
  common_conditions: string[]
  palpation: string
  assessment_methods: string[]
  manual_therapy_techniques: string[]
  common_trigger_points: string[]
  referred_pain_patterns: string[]
  stretching_positions: string[]
  strengthening_exercises: string[]
  exercise_ids: string[]
  image_urls: string[]
  notes: string
}

export interface Joint {
  id: string
  name: string
  latin_name: string
  type: string
  joint: string
  components: any
  blood_supply: any
  functions: string[]
  biomechanics: any
  pathology: any
}

export interface Ligament {
  id: string
  name: string
  latin_name: string
  region: string
  attachments: {
    origin: string
    insertion: string
  }
  fiber_bundles: string[]
  blood_supply: string[]
  innervation: string[]
  primary_function: string[]
  secondary_function: string[]
  biomechanics: any
  mechanism_of_injury: string[]
  common_injuries: string[]
  associated_injuries: string[]
  clinical_tests: string[]
  special_tests_sensitivity: any
  imaging: string[]
  healing_timeframe: any
  treatment_approaches: any
  rehabilitation_protocols: string[]
  key_exercises: string[]
  precautions: string[]
  prognosis: string
}

export interface Tendon {
  id: string
  name: string
  latin_name: string
  muscle: string
  region: string
  attachment_points: any
  composition: any
  blood_supply: any
  biomechanics: any
  pathology: any
  clinical_tests: string[]
  treatment_approaches: any
  prognosis: string
}

export interface NeuralStructure {
  id: string
  name: string
  type: string
  origin: string
  pathway: any
  branches: any
  innervation: any
  clinical_relevance: string
  common_conditions: any
  assessment: any
  treatment_approaches: any
}

export interface Exercise {
  id: string
  name: string
  category: string
  muscle_groups: string[]
  equipment: string[]
  difficulty: string
  instructions: string[]
  variations: string[]
  contraindications: string[]
  clinical_applications: string[]
  progressions: string[]
  regressions: string[]
  tips: string[]
  common_errors: string[]
}

export type AnatomyType = 'muscles' | 'joints' | 'ligaments' | 'tendons' | 'neural' | 'exercises'

export async function loadData(type: AnatomyType) {
  try {
    let data: any[] = []
    
    switch(type) {
      case 'muscles':
        data = [
          ...headAndNeckMuscles,
          ...shoulderComplex,
          ...upperArm,
          ...forearmAndHand,
          ...trunkAndCore,
          ...hipAndPelvis,
          ...thigh,
          ...lowerLeg,
          ...footIntrinsic
        ]
        break
      
      case 'joints':
        data = jointStructures
        break
      
      case 'ligaments':
        data = ligaments
        break
      
      case 'tendons':
        data = tendons
        break
      
      case 'neural':
        data = neuralStructure
        break
      
      case 'exercises':
        data = neckExercises.map((exercise: any, index: number) => ({
          id: `ex${String(index + 1).padStart(3, '0')}`,
          category: 'Neck Exercise',
          difficulty: 'Beginner',
          muscle_groups: ['Neck', 'Upper Trapezius', 'Deep Neck Flexors'],
          equipment: ['No equipment needed'],
          contraindications: ['Acute neck injury', 'Recent surgery'],
          clinical_applications: ['Neck pain', 'Postural correction', 'Headaches'],
          ...exercise
        }))
        break
    }
    
    return data
  } catch (error) {
    console.error(`Error loading ${type} data:`, error)
    return []
  }
}