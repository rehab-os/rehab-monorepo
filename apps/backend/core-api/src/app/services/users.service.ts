import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, Role, UserStatus } from '@rehab/database';
import {
    CreateUserDto,
    UpdateUserDto,
    UserResponseDto,
    AssignRoleDto,
    UpdateProfileDto,
    UserListQueryDto
} from '@rehab/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
    private supabase: SupabaseClient;

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(UserRole)
        private userRoleRepository: Repository<UserRole>,
        @InjectRepository(Role)
        private roleRepository: Repository<Role>,
        private configService: ConfigService,
    ) {
        this.supabase = createClient(
            this.configService.get('supabase.url')!,
            this.configService.get('supabase.serviceKey')!
        );
    }

    async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
        // Check if user exists
        const existing = await this.userRepository.findOne({
            where: { phone: createUserDto.phone }
        });

        if (existing) {
            throw new ConflictException('User with this phone number already exists');
        }

        // Create auth user in Supabase
        const { data: authData, error } = await this.supabase.auth.admin.createUser({
            phone: createUserDto.phone,
            phone_confirm: true, // Auto-confirm for admin-created users
            user_metadata: {
                full_name: createUserDto.full_name,
            }
        });

        if (error) {
            throw new Error(`Failed to create auth user: ${error.message}`);
        }

        // Create user in our database
        const user = this.userRepository.create({
            id: authData.user!.id,
            ...createUserDto,
        });

        const saved = await this.userRepository.save(user);
        return this.toResponseDto(saved);
    }

    async findAll(query: UserListQueryDto): Promise<{ users: UserResponseDto[]; total: number }> {
        const qb = this.userRepository.createQueryBuilder('user')
            .leftJoinAndSelect('user.userRoles', 'userRole')
            .leftJoinAndSelect('userRole.role', 'role')
            .leftJoinAndSelect('userRole.organization', 'organization')
            .leftJoinAndSelect('userRole.clinic', 'clinic');

        if (query.organizationId) {
            qb.andWhere('userRole.organization_id = :organizationId', { organizationId: query.organizationId });
        }

        if (query.clinicId) {
            qb.andWhere('userRole.clinic_id = :clinicId', { clinicId: query.clinicId });
        }

        if (query.role) {
            qb.andWhere('role.name = :roleName', { roleName: query.role });
        }

        if (query.status) {
            qb.andWhere('user.user_status = :status', { status: query.status });
        }

        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;

        qb.skip(skip).take(limit);

        const [users, total] = await qb.getManyAndCount();

        return {
            users: users.map(user => this.toResponseDto(user, true)),
            total,
        };
    }

    async findOne(id: string): Promise<UserResponseDto> {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['userRoles', 'userRoles.role', 'userRoles.organization', 'userRoles.clinic', 'userRoles.role.rolePermissions',
                'userRoles.role.rolePermissions.permission',],
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return this.toResponseDto(user, true);
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
        const user = await this.userRepository.findOne({ where: { id } });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Update Supabase auth user if phone is changing
        if (updateUserDto.phone && updateUserDto.phone !== user.phone) {
            const { error } = await this.supabase.auth.admin.updateUserById(id, {
                phone: updateUserDto.phone,
            });

            if (error) {
                throw new Error(`Failed to update auth user: ${error.message}`);
            }
        }

        Object.assign(user, updateUserDto);
        const saved = await this.userRepository.save(user);
        return this.toResponseDto(saved);
    }

    async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<UserResponseDto> {
        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        Object.assign(user, updateProfileDto);

        if (!user.profile_completed_at && this.isProfileComplete(user)) {
            user.profile_completed_at = new Date();
        }

        const saved = await this.userRepository.save(user);
        return this.toResponseDto(saved);
    }

    async remove(id: string): Promise<void> {
        const user = await this.userRepository.findOne({ where: { id } });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Deactivate in Supabase
        await this.supabase.auth.admin.updateUserById(id, {
            ban_duration: 'none', // This effectively disables the user
        });

        // Soft delete - just mark as inactive
        user.user_status = UserStatus.SUSPENDED;
        await this.userRepository.save(user);
    }

    async assignRole(
        userId: string,
        assignRoleDto: AssignRoleDto,
        assignedBy: string
    ): Promise<UserResponseDto> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const role = await this.roleRepository.findOne({ where: { id: assignRoleDto.roleId } });
        if (!role) {
            throw new NotFoundException('Role not found');
        }

        // Check if user already has this role in the same context
        const existingRole = await this.userRoleRepository.findOne({
            where: {
                user_id: userId,
                role_id: assignRoleDto.roleId,
                organization_id: assignRoleDto.organizationId,
                clinic_id: assignRoleDto.clinicId,
            },
        });

        if (existingRole) {
            throw new ConflictException('User already has this role in the specified context');
        }

        // Create new user role
        const userRole = this.userRoleRepository.create({
            user_id: userId,
            role_id: assignRoleDto.roleId,
            organization_id: assignRoleDto.organizationId,
            clinic_id: assignRoleDto.clinicId,
            assigned_by: assignedBy,
        });

        await this.userRoleRepository.save(userRole);
        return this.findOne(userId);
    }

    async removeRole(userId: string, roleId: string): Promise<void> {
        const userRole = await this.userRoleRepository.findOne({
            where: {
                user_id: userId,
                role_id: roleId,
            },
        });

        if (!userRole) {
            throw new NotFoundException('User role not found');
        }

        await this.userRoleRepository.remove(userRole);
    }

    async getUserPermissions(
        userId: string,
        organizationId?: string,
        clinicId?: string
    ): Promise<string[]> {
        const query = this.userRoleRepository.createQueryBuilder('ur')
            .innerJoinAndSelect('ur.role', 'role')
            .innerJoinAndSelect('role.rolePermissions', 'rp')
            .innerJoinAndSelect('rp.permission', 'permission')
            .where('ur.user_id = :userId', { userId })
            .andWhere('ur.is_active = true');

        if (organizationId) {
            query.andWhere('(ur.organization_id = :organizationId OR ur.organization_id IS NULL)', { organizationId });
        }

        if (clinicId) {
            query.andWhere('(ur.clinic_id = :clinicId OR ur.clinic_id IS NULL)', { clinicId });
        }

        const userRoles = await query.getMany();

        const permissions = new Set<string>();
        userRoles.forEach(ur => {
            ur.role.rolePermissions?.forEach(rp => {
                permissions.add(rp.permission.name);
            });
        });

        return Array.from(permissions);
    }

    private isProfileComplete(user: User): boolean {
        return !!(
            user.full_name &&
            user.phone &&
            user.email &&
            user.date_of_birth &&
            user.gender &&
            user.address
        );
    }

    private toResponseDto(user: User, includeRoles = false): UserResponseDto {
        const dto: UserResponseDto = {
            id: user.id,
            phone: user.phone,
            full_name: user.full_name,
            email: user.email,
            date_of_birth: user.date_of_birth,
            gender: user.gender,
            profile_photo_url: user.profile_photo_url,
            blood_group: user.blood_group,
            emergency_contact: user.emergency_contact,
            address: user.address,
            user_status: user.user_status,
            profile_completed: !!user.profile_completed_at,
            created_at: user.created_at,
            updated_at: user.updated_at,
        };

        if (includeRoles && user.userRoles) {
            dto.roles = user.userRoles.map(ur => ({
                id: ur.id,
                role: {
                    id: ur.role.id,
                    name: ur.role.name,
                    display_name: ur.role.display_name,
                    permissions: ur.role.rolePermissions?.map(rp => ({
                        id: rp.permission.id,
                        name: rp.permission.name,
                        resource: rp.permission.resource,
                        action: rp.permission.action,
                        description: rp.permission.description,
                    })) || [],
                },
                organization: ur.organization ? {
                    id: ur.organization.id,
                    name: ur.organization.name,
                } : undefined,
                clinic: ur.clinic ? {
                    id: ur.clinic.id,
                    name: ur.clinic.name,
                } : undefined,
                assigned_at: ur.assigned_at,
            }));
        }

        return dto;
    }
    
}