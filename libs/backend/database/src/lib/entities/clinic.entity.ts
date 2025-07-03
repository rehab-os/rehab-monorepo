import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Organization } from './organization.entity';

@Entity('clinics')
@Index(['organization_id', 'code'], { unique: true })
export class Clinic {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty()
    @Column('uuid')
    organization_id?: string;

    @ApiProperty()
    @Column()
    name!: string;

    @ApiProperty({ example: 'ORG001-C001' })
    @Column({ unique: true })
    code!: string;

    @ApiProperty()
    @Column('text')
    address!: string;

    @ApiProperty()
    @Column()
    city!: string;

    @ApiProperty()
    @Column()
    state!: string;

    @ApiProperty()
    @Column()
    pincode!: string;

    @ApiProperty()
    @Column()
    phone!: string;

    @ApiPropertyOptional()
    @Column({ nullable: true })
    email!: string;

    @ApiPropertyOptional()
    @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
    latitude!: number;

    @ApiPropertyOptional()
    @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
    longitude!: number;

    @ApiPropertyOptional()
    @Column({ type: 'jsonb', nullable: true })
    working_hours!: Record<string, any>;

    @ApiPropertyOptional()
    @Column({ type: 'simple-array', nullable: true })
    facilities!: string[];

    @ApiPropertyOptional()
    @Column({ nullable: true })
    total_beds!: number;

    @ApiPropertyOptional()
    @Column({ type: 'jsonb', nullable: true })
    settings!: Record<string, any>;

    @ApiProperty()
    @Column({ default: true })
    is_active!: boolean;

    @ApiProperty()
    @CreateDateColumn()
    created_at!: Date;

    @ApiProperty()
    @UpdateDateColumn()
    updated_at!: Date;

    @ManyToOne(() => Organization, organization => organization.clinics)
    @JoinColumn({ name: 'organization_id' })
    organization?: Organization;

}