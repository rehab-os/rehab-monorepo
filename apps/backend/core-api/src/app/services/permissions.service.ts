import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '@rehab/database';
import { CreatePermissionDto, UpdatePermissionDto, PermissionResponseDto } from '@rehab/common';

@Injectable()
export class PermissionsService {
    constructor(
        @InjectRepository(Permission)
        private permissionRepository: Repository<Permission>,
    ) { }

    async create(createPermissionDto: CreatePermissionDto): Promise<PermissionResponseDto> {
        const { resource, action } = createPermissionDto;
        const name = `${resource}:${action}`;

        const existing = await this.permissionRepository.findOne({ where: { name } });
        if (existing) {
            throw new ConflictException('Permission already exists');
        }

        const permission = this.permissionRepository.create({
            ...createPermissionDto,
            name,
        });

        const saved = await this.permissionRepository.save(permission);
        return this.toResponseDto(saved);
    }

    async findAll(): Promise<PermissionResponseDto[]> {
        const permissions = await this.permissionRepository.find({
            order: { resource: 'ASC', action: 'ASC' },
        });
        return permissions.map(p => this.toResponseDto(p));
    }

    async findOne(id: string): Promise<PermissionResponseDto> {
        const permission = await this.permissionRepository.findOne({ where: { id } });
        if (!permission) {
            throw new NotFoundException('Permission not found');
        }
        return this.toResponseDto(permission);
    }

    async update(id: string, updatePermissionDto: UpdatePermissionDto): Promise<PermissionResponseDto> {
        const permission = await this.permissionRepository.findOne({ where: { id } });
        if (!permission) {
            throw new NotFoundException('Permission not found');
        }

        if (updatePermissionDto.resource || updatePermissionDto.action) {
            const resource = updatePermissionDto.resource || permission.resource;
            const action = updatePermissionDto.action || permission.action;
            permission.name = `${resource}:${action}`;
        }

        Object.assign(permission, updatePermissionDto);
        const saved = await this.permissionRepository.save(permission);
        return this.toResponseDto(saved);
    }

    async remove(id: string): Promise<void> {
        const result = await this.permissionRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException('Permission not found');
        }
    }

    async getUserPermissions(userId: string, organizationId?: string, clinicId?: string): Promise<string[]> {
        const query = this.permissionRepository.createQueryBuilder('permission')
            .innerJoin('role_permissions', 'rp', 'rp.permission_id = permission.id')
            .innerJoin('user_roles', 'ur', 'ur.role_id = rp.role_id')
            .where('ur.user_id = :userId', { userId })
            .andWhere('ur.is_active = true');

        if (organizationId) {
            query.andWhere('(ur.organization_id = :organizationId OR ur.organization_id IS NULL)', { organizationId });
        }

        if (clinicId) {
            query.andWhere('(ur.clinic_id = :clinicId OR ur.clinic_id IS NULL)', { clinicId });
        }

        const permissions = await query.getMany();
        return permissions.map(p => p.name);
      }

    private toResponseDto(permission: Permission): PermissionResponseDto {
        return {
            id: permission.id,
            resource: permission.resource,
            action: permission.action,
            name: permission.name,
            description: permission.description,
            created_at: permission.created_at,
        };
    }
}