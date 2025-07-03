import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { PhysiotherapistProfile } from './physiotherapist-profile.entity';

export enum WorkshopType {
    TRAINING = 'training',
    CERTIFICATION = 'certification',
    CONFERENCE = 'conference',
    SEMINAR = 'seminar',
    WEBINAR = 'webinar',
    HANDS_ON = 'hands_on',
    CONTINUING_EDUCATION = 'continuing_education'
}

@Entity('physiotherapist_workshops')
export class PhysiotherapistWorkshop {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty()
    @Column('uuid')
    profile_id!: string;

    @ApiProperty()
    @Column()
    workshop_name!: string;

    @ApiProperty({ enum: WorkshopType })
    @Column({ type: 'enum', enum: WorkshopType })
    workshop_type!: WorkshopType;

    @ApiProperty()
    @Column()
    organizer_name!: string;

    @ApiPropertyOptional()
    @Column({ nullable: true })
    instructor_name?: string;

    @ApiProperty()
    @Column({ type: 'date' })
    start_date!: Date;

    @ApiProperty()
    @Column({ type: 'date' })
    end_date!: Date;

    @ApiPropertyOptional()
    @Column({ type: 'int', nullable: true })
    duration_hours?: number;

    @ApiPropertyOptional()
    @Column({ nullable: true })
    location?: string;

    @ApiProperty()
    @Column({ type: 'boolean', default: false })
    is_online!: boolean;

    @ApiPropertyOptional()
    @Column({ type: 'text', nullable: true })
    topics_covered?: string;

    @ApiPropertyOptional()
    @Column({ type: 'text', nullable: true })
    skills_learned?: string;

    @ApiPropertyOptional()
    @Column({ nullable: true })
    certificate_url?: string;

    @ApiProperty()
    @Column({ type: 'boolean', default: false })
    has_certificate!: boolean;

    @ApiPropertyOptional()
    @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
    rating?: number;

    @ApiPropertyOptional()
    @Column({ type: 'text', nullable: true })
    notes?: string;

    @ApiProperty()
    @CreateDateColumn()
    created_at!: Date;

    @ManyToOne('PhysiotherapistProfile', 'workshops')
    @JoinColumn({ name: 'profile_id' })
    profile!: PhysiotherapistProfile;
}