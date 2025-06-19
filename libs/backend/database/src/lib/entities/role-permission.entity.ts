import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Role } from './role.entity';
import { Permission } from './permission.entity';

@Entity('role_permissions')
@Index(['role_id', 'permission_id'], { unique: true })
export class RolePermission {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column('uuid')
    role_id!: string;

    @Column('uuid')
    permission_id!: string;

    @CreateDateColumn()
    created_at!: Date;

    @ManyToOne(() => Role, role => role.rolePermissions)
    @JoinColumn({ name: 'role_id' })
    role!: Role;

    @ManyToOne(() => Permission, permission => permission.rolePermissions)
    @JoinColumn({ name: 'permission_id' })
    permission!: Permission;
}