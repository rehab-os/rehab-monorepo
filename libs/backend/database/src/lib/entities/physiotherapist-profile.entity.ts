import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from './user.entity';
import type { PhysiotherapistEducation } from './physiotherapist-education.entity';
import type { PhysiotherapistTechnique } from './physiotherapist-technique.entity';
import type { PhysiotherapistWorkshop } from './physiotherapist-workshop.entity';
import type { PhysiotherapistMachine } from './physiotherapist-machine.entity';

export enum PhysiotherapistSpecialization {
    ORTHOPEDIC = 'orthopedic',
    NEUROLOGICAL = 'neurological',
    PEDIATRIC = 'pediatric',
    GERIATRIC = 'geriatric',
    SPORTS = 'sports',
    CARDIAC = 'cardiac',
    PULMONARY = 'pulmonary',
    WOMEN_HEALTH = 'women_health',
    PAIN_MANAGEMENT = 'pain_management',
    REHABILITATION = 'rehabilitation'
}

export enum ExperienceLevel {
    FRESHER = 'fresher',
    JUNIOR = 'junior',
    SENIOR = 'senior',
    EXPERT = 'expert'
}

@Entity('physiotherapist_profiles')
export class PhysiotherapistProfile {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty()
    @Column('uuid', { unique: true })
    user_id!: string;

    @ApiProperty()
    @Column()
    license_number!: string;

    @ApiProperty({ enum: ExperienceLevel })
    @Column({ type: 'enum', enum: ExperienceLevel, default: ExperienceLevel.FRESHER })
    experience_level!: ExperienceLevel;

    @ApiProperty()
    @Column({ type: 'int', default: 0 })
    years_of_experience!: number;

    @ApiProperty({ enum: PhysiotherapistSpecialization, isArray: true })
    @Column({ type: 'enum', enum: PhysiotherapistSpecialization, array: true, default: [] })
    specializations!: PhysiotherapistSpecialization[];

    @ApiPropertyOptional()
    @Column({ type: 'text', nullable: true })
    bio?: string;

    @ApiPropertyOptional()
    @Column({ type: 'jsonb', nullable: true })
    languages?: string[];

    @ApiProperty()
    @Column({ type: 'boolean', default: false })
    is_profile_complete!: boolean;

    @ApiPropertyOptional()
    @Column({ type: 'timestamp', nullable: true })
    profile_completed_at?: Date;

    @ApiProperty()
    @CreateDateColumn()
    created_at!: Date;

    @ApiProperty()
    @UpdateDateColumn()
    updated_at!: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @OneToMany('PhysiotherapistEducation', 'profile')
    educations?: PhysiotherapistEducation[];

    @OneToMany('PhysiotherapistTechnique', 'profile')
    techniques?: PhysiotherapistTechnique[];

    @OneToMany('PhysiotherapistWorkshop', 'profile')
    workshops?: PhysiotherapistWorkshop[];

    @OneToMany('PhysiotherapistMachine', 'profile')
    machines?: PhysiotherapistMachine[];
}