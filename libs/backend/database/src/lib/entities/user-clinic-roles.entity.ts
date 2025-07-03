import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';
import { Clinic } from './clinic.entity';

export enum ClinicRole {
    PHYSIOTHERAPIST = 'physiotherapist',
    RECEPTIONIST = 'receptionist'
}

@Entity('user_clinic_roles')
@Index(['user_id', 'clinic_id'], { unique: true })
export class UserClinicRole {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty()
    @Column('uuid')
    user_id!: string;

    @ApiProperty()
    @Column('uuid')
    clinic_id!: string;

    @ApiProperty({ enum: ClinicRole })
    @Column({ type: 'enum', enum: ClinicRole })
    role!: ClinicRole;

    @ApiProperty()
    @Column({ type: 'boolean', default: false })
    is_admin!: boolean;

    @ApiProperty()
    @CreateDateColumn()
    created_at!: Date;

    @ApiProperty()
    @UpdateDateColumn()
    updated_at!: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @ManyToOne(() => Clinic)
    @JoinColumn({ name: 'clinic_id' })
    clinic!: Clinic;
}