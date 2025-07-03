import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { PhysiotherapistProfile } from './physiotherapist-profile.entity';

export enum MachineCategory {
    ELECTROTHERAPY = 'electrotherapy',
    ULTRASOUND = 'ultrasound',
    LASER_THERAPY = 'laser_therapy',
    TENS_UNIT = 'tens_unit',
    EMS_UNIT = 'ems_unit',
    INTERFERENTIAL = 'interferential',
    SHORTWAVE_DIATHERMY = 'shortwave_diathermy',
    MICROWAVE_DIATHERMY = 'microwave_diathermy',
    PARAFFIN_BATH = 'paraffin_bath',
    ICE_MACHINE = 'ice_machine',
    EXERCISE_EQUIPMENT = 'exercise_equipment',
    TREADMILL = 'treadmill',
    EXERCISE_BIKE = 'exercise_bike',
    WEIGHT_TRAINING = 'weight_training',
    BALANCE_TRAINER = 'balance_trainer',
    TRACTION_UNIT = 'traction_unit',
    CPM_MACHINE = 'cpm_machine',
    BIOFEEDBACK = 'biofeedback',
    GAIT_TRAINER = 'gait_trainer',
    PARALLEL_BARS = 'parallel_bars'
}

export enum CompetencyLevel {
    BASIC = 'basic',
    INTERMEDIATE = 'intermediate',
    ADVANCED = 'advanced',
    CERTIFIED = 'certified'
}

@Entity('physiotherapist_machines')
export class PhysiotherapistMachine {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty()
    @Column('uuid')
    profile_id!: string;

    @ApiProperty()
    @Column()
    machine_name!: string;

    @ApiProperty({ enum: MachineCategory })
    @Column({ type: 'enum', enum: MachineCategory })
    category!: MachineCategory;

    @ApiProperty({ enum: CompetencyLevel })
    @Column({ type: 'enum', enum: CompetencyLevel, default: CompetencyLevel.BASIC })
    competency_level!: CompetencyLevel;

    @ApiPropertyOptional()
    @Column({ nullable: true })
    manufacturer?: string;

    @ApiPropertyOptional()
    @Column({ nullable: true })
    model?: string;

    @ApiPropertyOptional()
    @Column({ type: 'int', default: 0 })
    years_of_experience?: number;

    @ApiPropertyOptional()
    @Column({ type: 'text', nullable: true })
    training_received?: string;

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
    @Column({ type: 'boolean', default: false })
    is_certified!: boolean;

    @ApiPropertyOptional()
    @Column({ type: 'text', nullable: true })
    notes?: string;

    @ApiProperty()
    @CreateDateColumn()
    created_at!: Date;

    @ManyToOne('PhysiotherapistProfile', 'machines')
    @JoinColumn({ name: 'profile_id' })
    profile!: PhysiotherapistProfile;
}