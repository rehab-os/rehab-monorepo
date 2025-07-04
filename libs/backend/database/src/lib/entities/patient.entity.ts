import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Clinic } from './clinic.entity';
import { User } from './user.entity';
import type { Visit } from './visit.entity';

export enum PatientStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    DISCHARGED = 'DISCHARGED'
}

@Entity('patients')
@Index(['clinic_id', 'patient_code'], { unique: true })
export class Patient {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty()
    @Column('uuid')
    clinic_id!: string;

    @ApiProperty()
    @Column({ unique: true })
    patient_code!: string;

    @ApiProperty()
    @Column()
    full_name!: string;

    @ApiProperty()
    @Column({ unique: true })
    phone!: string;

    @ApiPropertyOptional()
    @Column({ nullable: true })
    email?: string;

    @ApiProperty()
    @Column({ type: 'date' })
    date_of_birth!: Date;

    @ApiProperty()
    @Column({ type: 'enum', enum: ['M', 'F', 'OTHER'] })
    gender!: string;

    @ApiPropertyOptional()
    @Column({ type: 'text', nullable: true })
    address?: string;

    @ApiPropertyOptional()
    @Column({ nullable: true })
    emergency_contact_name?: string;

    @ApiPropertyOptional()
    @Column({ nullable: true })
    emergency_contact_phone?: string;

    @ApiPropertyOptional()
    @Column({ type: 'text', nullable: true })
    medical_history?: string;

    @ApiPropertyOptional()
    @Column({ type: 'simple-array', nullable: true })
    allergies?: string[];

    @ApiPropertyOptional()
    @Column({ type: 'simple-array', nullable: true })
    current_medications?: string[];

    @ApiProperty()
    @Column({ type: 'enum', enum: PatientStatus, default: PatientStatus.ACTIVE })
    status!: PatientStatus;

    @ApiPropertyOptional()
    @Column('uuid', { nullable: true })
    referred_by?: string;

    @ApiPropertyOptional()
    @Column({ nullable: true })
    insurance_provider?: string;

    @ApiPropertyOptional()
    @Column({ nullable: true })
    insurance_policy_number?: string;

    @ApiProperty()
    @Column('uuid')
    created_by!: string;

    @ApiProperty()
    @CreateDateColumn()
    created_at!: Date;

    @ApiProperty()
    @UpdateDateColumn()
    updated_at!: Date;

    @ManyToOne(() => Clinic)
    @JoinColumn({ name: 'clinic_id' })
    clinic!: Clinic;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by' })
    creator!: User;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'referred_by' })
    referrer?: User;

    @OneToMany('Visit', 'patient')
    visits?: Visit[];
}