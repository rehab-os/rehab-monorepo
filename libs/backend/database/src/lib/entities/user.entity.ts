import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
// import { AuthUser } from './auth-user.entity.ts.old';
import { UserRole } from './user-role.entity';

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED'
}


export enum Gender {
    M = 'M',
    F = 'F',
    OTHER = 'OTHER'
}

export enum BloodGroup {
    A_POSITIVE = 'A+',
    A_NEGATIVE = 'A-',
    B_POSITIVE = 'B+',
    B_NEGATIVE = 'B-',
    O_POSITIVE = 'O+',
    O_NEGATIVE = 'O-',
    AB_POSITIVE = 'AB+',
    AB_NEGATIVE = 'AB-'
}

@Entity('users')
export class User {
    @ApiProperty()
    @PrimaryColumn('uuid')
    id!: string;

    @ApiProperty()
    @Column({ unique: true })
    phone!: string;

    @ApiProperty()
    @Column()
    full_name!: string;

    @ApiPropertyOptional()
    @Column({ nullable: true })
    email?: string;

    @ApiPropertyOptional()
    @Column({ type: 'date', nullable: true })
    date_of_birth?: Date;

    @ApiPropertyOptional({ enum: Gender })
    @Column({ type: 'enum', enum: Gender, nullable: true })
    gender?: Gender;

    @ApiPropertyOptional()
    @Column({ nullable: true })
    profile_photo_url?: string;

    @ApiPropertyOptional({ enum: BloodGroup })
    @Column({ type: 'enum', enum: BloodGroup, nullable: true })
    blood_group?: BloodGroup;

    @ApiPropertyOptional()
    @Column({ nullable: true })
    emergency_contact?: string;

    @ApiPropertyOptional()
    @Column({ type: 'text', nullable: true })
    address?: string;

    @ApiProperty({ enum: UserStatus })
    @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
    user_status!: UserStatus;

    @ApiPropertyOptional()
    @Column({ type: 'timestamp', nullable: true })
    profile_completed_at?: Date;

    @ApiProperty()
    @CreateDateColumn()
    created_at!: Date;

    @ApiProperty()
    @UpdateDateColumn()
    updated_at!: Date;

    // @OneToOne(() => AuthUser, (authUser: AuthUser) => authUser.user)
    // @JoinColumn({ name: 'id' })
    // authUser?: AuthUser;

    @OneToMany(() => UserRole, (userRole: UserRole) => userRole.user)
    userRoles?: UserRole[];
}