import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role, RolePermission, Permission } from '@rehab/database';
import { CreateRoleDto, UpdateRoleDto, AssignPermissionsDto, RoleResponseDto } from '@rehab/common';

// Define a type for Role with loaded relations
type RoleWithFullPermissions = Role & {
    rolePermissions: (RolePermission & {
        permission: Permission;
    })[];
};

@Injectable()
export class RolesService {
    constructor(
        @InjectRepository(Role)
        private roleRepository: Repository<Role>,
        @InjectRepository(RolePermission)
        private rolePermissionRepository: Repository<RolePermission>,
        @InjectRepository(Permission)
        private permissionRepository: Repository<Permission>,
    ) { }

    async create(createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
        const existing = await this.roleRepository.findOne({
            where: { name: createRoleDto.name },
        });

        if (existing) {
            throw new ConflictException('Role name already exists');
        }

        const role = this.roleRepository.create(createRoleDto);
        const saved = await this.roleRepository.save(role);
        return this.toResponseDto(saved);
    }

    async findAll(): Promise<RoleResponseDto[]> {
        const roles = await this.roleRepository.find({
            relations: ['rolePermissions', 'rolePermissions.permission'],
            order: { name: 'ASC' },
        }) as RoleWithFullPermissions[];

        return roles.map((r: RoleWithFullPermissions) => this.toResponseDto(r, true));
    }

    async findOne(id: string): Promise<RoleResponseDto> {
        const role = await this.roleRepository.findOne({
            where: { id },
            relations: ['rolePermissions', 'rolePermissions.permission'],
        }) as RoleWithFullPermissions | null;

        if (!role) {
            throw new NotFoundException('Role not found');
        }

        return this.toResponseDto(role, true);
    }

    async update(id: string, updateRoleDto: UpdateRoleDto): Promise<RoleResponseDto> {
        const role = await this.roleRepository.findOne({ where: { id } });

        if (!role) {
            throw new NotFoundException('Role not found');
        }

        if (role.is_system_role) {
            throw new BadRequestException('System roles cannot be modified');
        }

        Object.assign(role, updateRoleDto);
        const saved = await this.roleRepository.save(role);
        return this.toResponseDto(saved);
    }

    async remove(id: string): Promise<void> {
        const role = await this.roleRepository.findOne({ where: { id } });

        if (!role) {
            throw new NotFoundException('Role not found');
        }

        if (role.is_system_role) {
            throw new BadRequestException('System roles cannot be deleted');
        }

        await this.roleRepository.delete(id);
    }

    async assignPermissions(roleId: string, assignPermissionsDto: AssignPermissionsDto): Promise<RoleResponseDto> {
        const role = await this.roleRepository.findOne({ where: { id: roleId } });

        if (!role) {
            throw new NotFoundException('Role not found');
        }

        // Validate permissions exist
        const permissions = await this.permissionRepository.find({
            where: { id: In(assignPermissionsDto.permission_ids) },
        });

        if (permissions.length !== assignPermissionsDto.permission_ids.length) {
            throw new BadRequestException('Some permissions do not exist');
        }

        // Remove existing permissions
        await this.rolePermissionRepository.delete({ role_id: roleId });

        // Add new permissions
        const rolePermissions = assignPermissionsDto.permission_ids.map(permissionId =>
            this.rolePermissionRepository.create({
                role_id: roleId,
                permission_id: permissionId,
            }),
        );

        await this.rolePermissionRepository.save(rolePermissions);

        return this.findOne(roleId);
    }

    async unassignPermissions(roleId: string, permissionIds: string[]): Promise<RoleResponseDto> {
        const role = await this.roleRepository.findOne({ where: { id: roleId } });

        if (!role) {
            throw new NotFoundException('Role not found');
        }

        await this.rolePermissionRepository.delete({
            role_id: roleId,
            permission_id: In(permissionIds),
        });

        return this.findOne(roleId);
    }

    private toResponseDto(role: Role | RoleWithFullPermissions, includePermissions = false): RoleResponseDto {
        const dto: RoleResponseDto = {
            id: role.id,
            name: role.name,
            display_name: role.display_name,
            description: role.description,
            is_system_role: role.is_system_role,
            created_at: role.created_at,
        };

        if (includePermissions && 'rolePermissions' in role && role.rolePermissions) {
            dto.permissions = role.rolePermissions.map(rp => ({
                id: rp.permission.id,
                resource: rp.permission.resource,
                action: rp.permission.action,
                name: rp.permission.name,
                description: rp.permission.description,
                created_at: rp.permission.created_at,
            }));
        }

        return dto;
    }
}