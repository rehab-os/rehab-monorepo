export * from './lib/database.module';

// export * from './lib/entities/auth-user.entity.ts.old'
export * from './lib/entities/clinic.entity'
export * from './lib/entities/organization.entity'
export * from './lib/entities/permission.entity'
export * from './lib/entities/role-permission.entity'
export * from './lib/entities/role.entity'
export * from './lib/entities/user-clinic-roles.entity'

export * from './lib/entities/user.entity'
// export * from './lib/entities/user.entity'

export * from './lib/entities/organization-owner.entity'
export * from './lib/entities/clinic-owner.entity'

// Physiotherapist Profile Entities
export * from './lib/entities/physiotherapist-profile.entity'
export * from './lib/entities/physiotherapist-education.entity'
export * from './lib/entities/physiotherapist-technique.entity'
export * from './lib/entities/physiotherapist-workshop.entity'
export * from './lib/entities/physiotherapist-machine.entity'

// Patient Management Entities
export * from './lib/entities/patient.entity'
export * from './lib/entities/visit.entity'
export * from './lib/entities/note.entity'




export { default as databaseConfig } from './lib/config/database.config'

export { default as supabaseConfig } from './lib/config/supabase.config'

