import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserClinicRole, UserStatus } from '@rehab/database';
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
        @InjectRepository(UserClinicRole)
        private userClinicRoleRepository: Repository<UserClinicRole>,
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
        const qb = this.userRepository.createQueryBuilder('user');

        if (query.status) {
            qb.andWhere('user.user_status = :status', { status: query.status });
        }

        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;

        qb.skip(skip).take(limit);

        const [users, total] = await qb.getManyAndCount();

        return {
            users: users.map(user => this.toResponseDto(user, false)),
            total,
        };
    }

    async findOne(id: string): Promise<UserResponseDto> {
        const user = await this.userRepository.findOne({
            where: { id }
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return this.toResponseDto(user, false);
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

        // Check if user already has a role in this clinic
        const existingRole = await this.userClinicRoleRepository.findOne({
            where: {
                user_id: userId,
                clinic_id: assignRoleDto.clinicId,
            },
        });

        if (existingRole) {
            throw new ConflictException('User already has a role in this clinic');
        }

        // Create new user clinic role
        const userClinicRole = this.userClinicRoleRepository.create({
            user_id: userId,
            clinic_id: assignRoleDto.clinicId,
            role: assignRoleDto.role, // Should be 'physiotherapist' or 'receptionist'
            is_admin: assignRoleDto.is_admin || false,
        });

        await this.userClinicRoleRepository.save(userClinicRole);
        return this.findOne(userId);
    }

    async removeRole(userId: string, clinicId: string): Promise<void> {
        const userClinicRole = await this.userClinicRoleRepository.findOne({
            where: {
                user_id: userId,
                clinic_id: clinicId,
            },
        });

        if (!userClinicRole) {
            throw new NotFoundException('User clinic role not found');
        }

        await this.userClinicRoleRepository.remove(userClinicRole);
    }

    async getUserPermissions(
        userId: string,
        clinicId?: string
    ): Promise<string[]> {
        const userClinicRoles = await this.userClinicRoleRepository.find({
            where: {
                user_id: userId,
                ...(clinicId && { clinic_id: clinicId })
            }
        });

        const permissions = new Set<string>();
        
        userClinicRoles.forEach(ucr => {
            // Basic permissions based on role
            if (ucr.role === 'physiotherapist') {
                permissions.add('view_patients');
                permissions.add('create_treatments');
                permissions.add('view_treatments');
                permissions.add('update_treatments');
            } else if (ucr.role === 'receptionist') {
                permissions.add('view_patients');
                permissions.add('create_appointments');
                permissions.add('view_appointments');
                permissions.add('update_appointments');
            }
            
            // Admin permissions
            if (ucr.is_admin) {
                permissions.add('manage_clinic');
                permissions.add('manage_users');
                permissions.add('view_reports');
            }
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

        // Note: Roles are now managed through UserClinicRole entity
        // This can be extended later if needed

        return dto;
    }
    
}