import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from './user.entity';
import { Clinic } from './clinic.entity';

export enum OrganizationType {
    CHAIN = 'CHAIN',
    SINGLE_CLINIC = 'SINGLE_CLINIC'
}

@Entity('organizations')
export class Organization {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty()
    @Column({ unique: true })
    name!: string;

    @ApiProperty()
    @Column({ unique: true })
    slug!: string;

    @ApiProperty({ enum: OrganizationType })
    @Column({ type: 'enum', enum: OrganizationType })
    type!: OrganizationType;

    @ApiPropertyOptional()
    @Column({ nullable: true })
    registration_no?: string;

    @ApiPropertyOptional()
    @Column({ nullable: true })
    gst_no?: string;

    @ApiPropertyOptional()
    @Column({ nullable: true })
    pan_no?: string;

    @ApiPropertyOptional()
    @Column({ type: 'jsonb', nullable: true })
    bank_details?: Record<string, any>;

    @ApiPropertyOptional()
    @Column({ nullable: true })
    logo_url?: string;

    @ApiProperty()
    @Column('uuid')
    created_by!: string;

    @ApiPropertyOptional()
    @Column({ type: 'jsonb', nullable: true })
    settings?: Record<string, any>;

    @ApiProperty()
    @Column({ default: true })
    is_active!: boolean;

    @ApiProperty()
    @CreateDateColumn()
    created_at!: Date;

    @ApiProperty()
    @UpdateDateColumn()
    updated_at!: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by' })
    creator?: User;

    @OneToMany(() => Clinic, (clinic: Clinic) => clinic.organization)
    clinics?: Clinic[];
}