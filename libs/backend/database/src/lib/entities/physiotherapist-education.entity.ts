import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { PhysiotherapistProfile } from './physiotherapist-profile.entity';

export enum EducationType {
    DEGREE = 'degree',
    DIPLOMA = 'diploma',
    CERTIFICATE = 'certificate',
    SPECIALIZATION = 'specialization'
}

export enum EducationLevel {
    BACHELOR = 'bachelor',
    MASTER = 'master',
    DOCTORATE = 'doctorate',
    POST_GRADUATE = 'post_graduate',
    CERTIFICATE = 'certificate'
}

@Entity('physiotherapist_educations')
export class PhysiotherapistEducation {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty()
    @Column('uuid')
    profile_id!: string;

    @ApiProperty()
    @Column()
    institution_name!: string;

    @ApiProperty()
    @Column()
    degree_name!: string;

    @ApiProperty({ enum: EducationType })
    @Column({ type: 'enum', enum: EducationType })
    education_type!: EducationType;

    @ApiProperty({ enum: EducationLevel })
    @Column({ type: 'enum', enum: EducationLevel })
    education_level!: EducationLevel;

    @ApiPropertyOptional()
    @Column({ nullable: true })
    specialization?: string;

    @ApiProperty()
    @Column({ type: 'date' })
    start_date!: Date;

    @ApiPropertyOptional()
    @Column({ type: 'date', nullable: true })
    end_date?: Date;

    @ApiProperty()
    @Column({ type: 'boolean', default: false })
    is_current!: boolean;

    @ApiPropertyOptional()
    @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
    grade?: number;

    @ApiPropertyOptional()
    @Column({ nullable: true })
    grade_system?: string; // CGPA, Percentage, etc.

    @ApiPropertyOptional()
    @Column({ type: 'text', nullable: true })
    description?: string;

    @ApiProperty()
    @CreateDateColumn()
    created_at!: Date;

    @ManyToOne('PhysiotherapistProfile', 'educations')
    @JoinColumn({ name: 'profile_id' })
    profile!: PhysiotherapistProfile;
}