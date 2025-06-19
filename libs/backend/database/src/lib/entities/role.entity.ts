import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RolePermission } from './role-permission.entity';
import { UserRole } from './user-role.entity';

@Entity('roles')
export class Role {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty({ example: 'clinic_owner' })
    @Column({ unique: true })
    name!: string;

    @ApiProperty({ example: 'Clinic Owner' })
    @Column()
    display_name!: string;

    @ApiPropertyOptional()
    @Column({ type: 'text', nullable: true })
    description?: string;

    @ApiProperty()
    @Column({ default: false })
    is_system_role!: boolean;

    @ApiProperty()
    @CreateDateColumn()
    created_at!: Date;

    @OneToMany(() => RolePermission, (rolePermission: RolePermission) => rolePermission.role)
    rolePermissions?: RolePermission[];

    @OneToMany(() => UserRole, (userRole: UserRole) => userRole.role)
    userRoles?: UserRole[];
}