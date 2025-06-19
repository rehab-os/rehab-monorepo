import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RolePermission } from './role-permission.entity';

@Entity('permissions')
export class Permission {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty({ example: 'clinic' })
    @Column()
    resource!: string;

    @ApiProperty({ example: 'create' })
    @Column()
    action!: string;

    @ApiProperty({ example: 'clinic:create' })
    @Column({ unique: true })
    name!: string;

    @ApiPropertyOptional()
    @Column({ type: 'text', nullable: true })
    description?: string;

    @ApiProperty()
    @CreateDateColumn()
    created_at!: Date;

    @OneToMany(() => RolePermission, (rolePermission: RolePermission) => rolePermission.permission)
    rolePermissions?: RolePermission[];
}