import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';

// Configuration imports
import { databaseConfig, supabaseConfig } from '@rehab/database';

// Common library imports (interfaces, guards, interceptors)
import {
  AuthGuard,
  PermissionsGuard,
  ResponseInterceptor,
  AllExceptionsFilter,
  PERMISSIONS_SERVICE_TOKEN
} from '@rehab/common';

// All your controllers
import { AuthController } from './controllers/auth.controller';
import { PermissionsController } from './controllers/permissions.controller';
import { RolesController } from './controllers/roles.controller';
import { OrganizationsController } from './controllers/organizations.controller';
import { ClinicsController } from './controllers/clinics.controller';
import { UsersController } from './controllers/users.controller';
import { TeamController } from './controllers/team.controller';
import { PatientsController } from './controllers/patients.controller';
import { PhysiotherapistProfileController } from './controllers/physiotherapist-profile.controller';
import { AudioController } from './controllers/audio.controller';
import { NotesController } from './controllers/notes.controller';
import { NutritionController } from './controllers/nutrition.controller';
// import { AppointmentsController } from './controllers/appointments.controller';

// All your services
import { AuthService } from './services/auth.service';
import { PermissionsService } from './services/permissions.service';
import { RolesService } from './services/roles.service';
import { OrganizationsService } from './services/organizations.service';
import { ClinicsService } from './services/clinics.service';
import { UsersService } from './services/users.service';
import { TeamService } from './services/team.service';
import { PatientsService } from './services/patients.service';
import { PhysiotherapistProfileService } from './services/physiotherapist-profile.service';
import { AudioService } from './services/audio.service';
import { NotesService } from './services/notes.service';
import { NutritionService } from './services/nutrition.service';
// import { AppointmentsService } from './services/appointments.service';

// Import all entities from database library
import {
  User,
  // AuthUser,
  Role,
  Permission,
  RolePermission,
  UserClinicRole,
  Organization,
  OrganizationOwner,
  Clinic,
  ClinicOwner,
  PhysiotherapistProfile,
  PhysiotherapistEducation,
  PhysiotherapistTechnique,
  PhysiotherapistWorkshop,
  PhysiotherapistMachine,
  Patient,
  Visit,
  Note,
  // PatientClinicAccess,
  // Appointment,
  // PractitionerProfile,
  // PractitionerSlot,
  // ... other entities
} from '@rehab/database';

// JWT Module for authentication
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    // 1. Global configuration module
    ConfigModule.forRoot({
      isGlobal: true, // Makes config available everywhere
      load: [databaseConfig, supabaseConfig],
    }),

    // 2. Database connection with TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [
          User,
          // AuthUser,
          Role,
          Permission,
          RolePermission,
          UserClinicRole,
          Organization,
          OrganizationOwner,
          Clinic,
          ClinicOwner,
          PhysiotherapistProfile,
          PhysiotherapistEducation,
          PhysiotherapistTechnique,
          PhysiotherapistWorkshop,
          PhysiotherapistMachine,
          Patient,
          Visit,
          Note,
          // PatientClinicAccess,
          // Appointment,
          // PractitionerProfile,
          // PractitionerSlot,
          // ... add all entities
        ],
        synchronize: process.env.NODE_ENV === 'development', // Auto-sync in dev only
        logging: process.env.NODE_ENV === 'development',
      }),
      inject: [ConfigService],
    }),

    // 3. Feature-specific entity repositories
    TypeOrmModule.forFeature([
      User,
      // AuthUser,
      Role,
      Permission,
      RolePermission,
      UserClinicRole,
      Organization,
      OrganizationOwner,
      Clinic,
      ClinicOwner,
      PhysiotherapistProfile,
      PhysiotherapistEducation,
      PhysiotherapistTechnique,
      PhysiotherapistWorkshop,
      PhysiotherapistMachine,
      Patient,
      Visit,
      Note,
      // PatientClinicAccess,
      // Appointment,
      // PractitionerProfile,
      // PractitionerSlot,
    ]),

    // 4. JWT configuration for authentication
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'your-secret-key',
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],

  controllers: [
    // All your controllers go here
    AuthController,
    PermissionsController,
    RolesController,
    OrganizationsController,
    ClinicsController,
    UsersController,
    TeamController,
    PatientsController,
    PhysiotherapistProfileController,
    AudioController,
    NotesController,
    NutritionController,
    // AppointmentsController,
  ],

  providers: [
    // ========== SERVICES ==========
    // All your business logic services
    AuthService,
    PermissionsService,
    RolesService,
    OrganizationsService,
    ClinicsService,
    UsersService,
    TeamService,
    PatientsService,
    PhysiotherapistProfileService,
    AudioService,
    NotesService,
    NutritionService,
    // AppointmentsService,

    // ========== DEPENDENCY INJECTION ==========
    // This tells NestJS: "When someone asks for PERMISSIONS_SERVICE_TOKEN, give them PermissionsService"
    {
      provide: PERMISSIONS_SERVICE_TOKEN,
      useClass: PermissionsService,
    },

    // ========== GLOBAL GUARDS ==========
    // Applied to EVERY route in your application
    {
      provide: APP_GUARD,
      useClass: AuthGuard, // Checks JWT token on all routes (except @Public() ones)
    },

    // ========== GLOBAL INTERCEPTORS ==========
    // Transforms all responses to standard format
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },

    // ========== GLOBAL EXCEPTION FILTERS ==========
    // Catches all errors and formats them consistently
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],

  exports: [
    // Export services that other modules might need
    JwtModule,
    AuthService,
    PermissionsService,
  ],
})
export class AppModule { }