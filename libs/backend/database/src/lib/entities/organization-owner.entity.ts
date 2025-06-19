import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from './user.entity';
import { Organization } from './organization.entity';

export enum OwnershipType {
    FOUNDER = 'FOUNDER',
    PARTNER = 'PARTNER',
    INVESTOR = 'INVESTOR'
}

@Entity('organization_owners')
@Index(['user_id', 'organization_id'], { unique: true })
export class OrganizationOwner {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty()
    @Column('uuid')
    user_id!: string;

    @ApiProperty()
    @Column('uuid')
    organization_id!: string;

    @ApiProperty({ enum: OwnershipType })
    @Column({ type: 'enum', enum: OwnershipType })
    ownership_type!: OwnershipType;

    @ApiPropertyOptional()
    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    ownership_percentage?: number;

    @ApiProperty()
    @Column({ type: 'date' })
    effective_from!: Date;

    @ApiPropertyOptional()
    @Column({ type: 'date', nullable: true })
    effective_until?: Date;

    @ApiProperty()
    @Column({ default: true })
    is_active!: boolean;

    @ApiProperty()
    @CreateDateColumn()
    created_at!: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user?: User;

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'organization_id' })
    organization?: Organization;
}