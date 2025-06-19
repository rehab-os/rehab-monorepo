import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from './user.entity';
import { Role } from './role.entity';
import { Organization } from './organization.entity';
import { Clinic } from './clinic.entity';

@Entity('user_roles')
@Index(['user_id', 'role_id', 'organization_id', 'clinic_id'], { unique: true })
export class UserRole {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty()
    @Column('uuid')
    user_id!: string;

    @ApiProperty()
    @Column('uuid')
    role_id!: string;

    @ApiPropertyOptional()
    @Column('uuid', { nullable: true })
    organization_id!: string;

    @ApiPropertyOptional()
    @Column('uuid', { nullable: true })
    clinic_id!: string;

    @ApiProperty()
    @CreateDateColumn()
    assigned_at!: Date;

    @ApiPropertyOptional()
    @Column({ type: 'timestamp', nullable: true })
    expires_at!: Date;

    @ApiPropertyOptional()
    @Column('uuid', { nullable: true })
    assigned_by!: string;

    @ApiProperty()
    @Column({ default: true })
    is_active!: boolean;

    @ManyToOne(() => User, (user: any) => user.userRoles)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @ManyToOne(() => Role, role => role.userRoles)
    @JoinColumn({ name: 'role_id' })
    role!: Role;

    @ManyToOne(() => Organization, { nullable: true })
    @JoinColumn({ name: 'organization_id' })
    organization?: Organization;

    @ManyToOne(() => Clinic, { nullable: true })
    @JoinColumn({ name: 'clinic_id' })
    clinic?: Clinic;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'assigned_by' })
    assignedBy!: User;
}