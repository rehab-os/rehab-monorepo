import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { PhysiotherapistProfile } from './physiotherapist-profile.entity';

export enum TechniqueCategory {
    MANUAL_THERAPY = 'manual_therapy',
    EXERCISE_THERAPY = 'exercise_therapy',
    ELECTROTHERAPY = 'electrotherapy',
    HYDROTHERAPY = 'hydrotherapy',
    THERMOTHERAPY = 'thermotherapy',
    CRYOTHERAPY = 'cryotherapy',
    ACUPUNCTURE = 'acupuncture',
    DRY_NEEDLING = 'dry_needling',
    MASSAGE_THERAPY = 'massage_therapy',
    MOBILIZATION = 'mobilization',
    MANIPULATION = 'manipulation',
    SOFT_TISSUE = 'soft_tissue',
    TRIGGER_POINT = 'trigger_point',
    MYOFASCIAL_RELEASE = 'myofascial_release',
    CRANIOSACRAL = 'craniosacral',
    NEURAL_MOBILIZATION = 'neural_mobilization'
}

export enum ProficiencyLevel {
    BEGINNER = 'beginner',
    INTERMEDIATE = 'intermediate',
    ADVANCED = 'advanced',
    EXPERT = 'expert'
}

@Entity('physiotherapist_techniques')
export class PhysiotherapistTechnique {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty()
    @Column('uuid')
    profile_id!: string;

    @ApiProperty()
    @Column()
    technique_name!: string;

    @ApiProperty({ enum: TechniqueCategory })
    @Column({ type: 'enum', enum: TechniqueCategory })
    category!: TechniqueCategory;

    @ApiProperty({ enum: ProficiencyLevel })
    @Column({ type: 'enum', enum: ProficiencyLevel, default: ProficiencyLevel.BEGINNER })
    proficiency_level!: ProficiencyLevel;

    @ApiPropertyOptional()
    @Column({ type: 'int', default: 0 })
    years_of_practice?: number;

    @ApiPropertyOptional()
    @Column({ type: 'text', nullable: true })
    description?: string;

    @ApiPropertyOptional()
    @Column({ nullable: true })
    certification_body?: string;

    @ApiPropertyOptional()
    @Column({ type: 'date', nullable: true })
    certified_date?: Date;

    @ApiPropertyOptional()
    @Column({ type: 'date', nullable: true })
    certification_expiry?: Date;

    @ApiProperty()
    @CreateDateColumn()
    created_at!: Date;

    @ManyToOne('PhysiotherapistProfile', 'techniques')
    @JoinColumn({ name: 'profile_id' })
    profile!: PhysiotherapistProfile;
}