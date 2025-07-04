import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Patient } from './patient.entity';
import { User } from './user.entity';
import { Clinic } from './clinic.entity';
import type { Note } from './note.entity';

export enum VisitStatus {
    SCHEDULED = 'SCHEDULED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    NO_SHOW = 'NO_SHOW'
}

export enum VisitType {
    INITIAL_CONSULTATION = 'INITIAL_CONSULTATION',
    FOLLOW_UP = 'FOLLOW_UP',
    REVIEW = 'REVIEW',
    EMERGENCY = 'EMERGENCY'
}

@Entity('visits')
@Index(['clinic_id', 'physiotherapist_id', 'scheduled_date', 'scheduled_time'])
@Index(['patient_id', 'scheduled_date'])
export class Visit {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty()
    @Column('uuid')
    patient_id!: string;

    @ApiProperty()
    @Column('uuid')
    clinic_id!: string;

    @ApiProperty()
    @Column('uuid')
    physiotherapist_id!: string;

    @ApiProperty()
    @Column({ type: 'enum', enum: VisitType })
    visit_type!: VisitType;

    @ApiProperty()
    @Column({ type: 'date' })
    scheduled_date!: Date;

    @ApiProperty()
    @Column({ type: 'time' })
    scheduled_time!: string;

    @ApiProperty()
    @Column({ type: 'int', default: 30 })
    duration_minutes!: number;

    @ApiProperty()
    @Column({ type: 'enum', enum: VisitStatus, default: VisitStatus.SCHEDULED })
    status!: VisitStatus;

    @ApiPropertyOptional()
    @Column({ type: 'text', nullable: true })
    chief_complaint?: string;

    @ApiPropertyOptional()
    @Column({ type: 'timestamp', nullable: true })
    check_in_time?: Date;

    @ApiPropertyOptional()
    @Column({ type: 'timestamp', nullable: true })
    start_time?: Date;

    @ApiPropertyOptional()
    @Column({ type: 'timestamp', nullable: true })
    end_time?: Date;

    @ApiPropertyOptional()
    @Column({ type: 'text', nullable: true })
    cancellation_reason?: string;

    @ApiPropertyOptional()
    @Column('uuid', { nullable: true })
    cancelled_by?: string;

    @ApiPropertyOptional()
    @Column({ type: 'timestamp', nullable: true })
    cancelled_at?: Date;

    @ApiPropertyOptional()
    @Column('uuid', { nullable: true })
    parent_visit_id?: string;

    @ApiPropertyOptional()
    @Column({ type: 'jsonb', nullable: true })
    vital_signs?: {
        blood_pressure?: string;
        heart_rate?: number;
        temperature?: number;
        respiratory_rate?: number;
        oxygen_saturation?: number;
        weight?: number;
        height?: number;
    };

    @ApiProperty()
    @Column('uuid')
    created_by!: string;

    @ApiProperty()
    @CreateDateColumn()
    created_at!: Date;

    @ApiProperty()
    @UpdateDateColumn()
    updated_at!: Date;

    @ManyToOne(() => Patient, patient => patient.visits)
    @JoinColumn({ name: 'patient_id' })
    patient!: Patient;

    @ManyToOne(() => Clinic)
    @JoinColumn({ name: 'clinic_id' })
    clinic!: Clinic;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'physiotherapist_id' })
    physiotherapist!: User;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by' })
    creator!: User;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'cancelled_by' })
    canceller?: User;

    @ManyToOne(() => Visit, { nullable: true })
    @JoinColumn({ name: 'parent_visit_id' })
    parentVisit?: Visit;

    @OneToOne('Note', 'visit')
    note?: Note;
}