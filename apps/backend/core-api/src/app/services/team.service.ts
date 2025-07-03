import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { 
    User, 
    UserClinicRole, 
    Clinic, 
    PhysiotherapistProfile,
    ClinicRole
} from '@rehab/database';
import { 
    AddTeamMemberDto, 
    TeamMemberResponseDto, 
    BulkTeamMembersResponseDto 
} from '@rehab/common';

@Injectable()
export class TeamService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(UserClinicRole)
        private userClinicRoleRepository: Repository<UserClinicRole>,
        @InjectRepository(Clinic)
        private clinicRepository: Repository<Clinic>,
        @InjectRepository(PhysiotherapistProfile)
        private physiotherapistProfileRepository: Repository<PhysiotherapistProfile>,
        private dataSource: DataSource,
    ) { }

    async addTeamMember(
        organizationId: string,
        addTeamMemberDto: AddTeamMemberDto,
        addedBy: string
    ): Promise<TeamMemberResponseDto[]> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Check if user already exists
            let user = await this.userRepository.findOne({
                where: { phone: addTeamMemberDto.phone }
            });

            if (!user) {
                // Create new user
                user = this.userRepository.create({
                    phone: addTeamMemberDto.phone,
                    email: addTeamMemberDto.email,
                    full_name: addTeamMemberDto.full_name,
                });
                user = await queryRunner.manager.save(user);
            } else {
                // Update existing user info if needed
                if (!user.email && addTeamMemberDto.email) {
                    user.email = addTeamMemberDto.email;
                }
                if (!user.full_name && addTeamMemberDto.full_name) {
                    user.full_name = addTeamMemberDto.full_name;
                }
                user = await queryRunner.manager.save(user);
            }

            // Determine clinics to assign
            let clinicIds = addTeamMemberDto.clinic_ids || [];
            
            // If no specific clinics provided, get all clinics in organization
            if (clinicIds.length === 0) {
                const orgClinics = await this.clinicRepository.find({
                    where: { organization_id: organizationId, is_active: true },
                    select: ['id']
                });
                clinicIds = orgClinics.map(clinic => clinic.id);
            }

            // Validate clinics belong to organization
            const validClinics = await this.clinicRepository.find({
                where: { 
                    id: In(clinicIds), 
                    organization_id: organizationId,
                    is_active: true 
                }
            });

            if (validClinics.length !== clinicIds.length) {
                throw new BadRequestException('Some clinics do not belong to your organization');
            }

            const teamMemberResponses: TeamMemberResponseDto[] = [];

            // Create user clinic roles
            for (const clinic of validClinics) {
                // Check if user already has role in this clinic
                const existingRole = await this.userClinicRoleRepository.findOne({
                    where: { 
                        user_id: user.id, 
                        clinic_id: clinic.id 
                    }
                });

                if (existingRole) {
                    // Update existing role
                    existingRole.role = addTeamMemberDto.role;
                    existingRole.is_admin = addTeamMemberDto.admin_clinic_ids?.includes(clinic.id) || false;
                    await queryRunner.manager.save(existingRole);
                } else {
                    // Create new role
                    const userClinicRole = this.userClinicRoleRepository.create({
                        user_id: user.id,
                        clinic_id: clinic.id,
                        role: addTeamMemberDto.role,
                        is_admin: addTeamMemberDto.admin_clinic_ids?.includes(clinic.id) || false,
                    });
                    await queryRunner.manager.save(userClinicRole);
                }

                teamMemberResponses.push({
                    id: user.id,
                    full_name: user.full_name,
                    phone: user.phone,
                    email: user.email || '',
                    role: addTeamMemberDto.role,
                    is_admin: addTeamMemberDto.admin_clinic_ids?.includes(clinic.id) || false,
                    clinic_id: clinic.id,
                    clinic_name: clinic.name,
                    is_profile_complete: user.profile_completed_at ? true : false,
                    profile_completed_at: user.profile_completed_at,
                    created_at: user.created_at,
                    user_status: user.status
                });
            }

            // Create physiotherapist profile if role is physiotherapist
            if (addTeamMemberDto.role === ClinicRole.PHYSIOTHERAPIST) {
                const existingProfile = await this.physiotherapistProfileRepository.findOne({
                    where: { user_id: user.id }
                });

                if (!existingProfile) {
                    const profile = this.physiotherapistProfileRepository.create({
                        user_id: user.id,
                        license_number: '', // To be filled by physiotherapist
                        experience_level: 'fresher',
                        years_of_experience: 0,
                        specializations: [],
                        is_profile_complete: false
                    });
                    await queryRunner.manager.save(profile);
                }
            }

            await queryRunner.commitTransaction();
            return teamMemberResponses;

        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async getTeamMembers(
        organizationId: string,
        clinicId?: string
    ): Promise<BulkTeamMembersResponseDto> {
        const queryBuilder = this.userClinicRoleRepository
            .createQueryBuilder('ucr')
            .leftJoinAndSelect('ucr.user', 'user')
            .leftJoinAndSelect('ucr.clinic', 'clinic')
            .where('clinic.organization_id = :organizationId', { organizationId })
            .andWhere('clinic.is_active = :isActive', { isActive: true });

        if (clinicId) {
            queryBuilder.andWhere('ucr.clinic_id = :clinicId', { clinicId });
        }

        const userClinicRoles = await queryBuilder
            .orderBy('user.created_at', 'DESC')
            .getMany();

        const members: TeamMemberResponseDto[] = userClinicRoles.map(ucr => ({
            id: ucr.user.id,
            full_name: ucr.user.full_name,
            phone: ucr.user.phone,
            email: ucr.user.email || '',
            role: ucr.role,
            is_admin: ucr.is_admin,
            clinic_id: ucr.clinic.id,
            clinic_name: ucr.clinic.name,
            is_profile_complete: ucr.user.profile_completed_at ? true : false,
            profile_completed_at: ucr.user.profile_completed_at,
            created_at: ucr.user.created_at,
            user_status: ucr.user.status
        }));

        const physiotherapists = members.filter(m => m.role === ClinicRole.PHYSIOTHERAPIST);
        const receptionists = members.filter(m => m.role === ClinicRole.RECEPTIONIST);

        return {
            members,
            total_count: members.length,
            physiotherapists_count: physiotherapists.length,
            receptionists_count: receptionists.length
        };
    }

    async removeTeamMember(
        organizationId: string,
        userId: string,
        clinicId?: string
    ): Promise<void> {
        const queryBuilder = this.userClinicRoleRepository
            .createQueryBuilder('ucr')
            .leftJoinAndSelect('ucr.clinic', 'clinic')
            .where('ucr.user_id = :userId', { userId })
            .andWhere('clinic.organization_id = :organizationId', { organizationId });

        if (clinicId) {
            queryBuilder.andWhere('ucr.clinic_id = :clinicId', { clinicId });
        }

        const userClinicRoles = await queryBuilder.getMany();

        if (userClinicRoles.length === 0) {
            throw new NotFoundException('Team member not found in this organization/clinic');
        }

        await this.userClinicRoleRepository.remove(userClinicRoles);
    }

    async updateTeamMemberRole(
        organizationId: string,
        userId: string,
        clinicId: string,
        role: ClinicRole,
        isAdmin: boolean
    ): Promise<TeamMemberResponseDto> {
        // Verify clinic belongs to organization
        const clinic = await this.clinicRepository.findOne({
            where: { 
                id: clinicId, 
                organization_id: organizationId,
                is_active: true 
            }
        });

        if (!clinic) {
            throw new NotFoundException('Clinic not found in your organization');
        }

        const userClinicRole = await this.userClinicRoleRepository.findOne({
            where: { 
                user_id: userId, 
                clinic_id: clinicId 
            },
            relations: ['user', 'clinic']
        });

        if (!userClinicRole) {
            throw new NotFoundException('Team member not found in this clinic');
        }

        userClinicRole.role = role;
        userClinicRole.is_admin = isAdmin;
        
        const saved = await this.userClinicRoleRepository.save(userClinicRole);

        return {
            id: saved.user.id,
            full_name: saved.user.full_name,
            phone: saved.user.phone,
            email: saved.user.email || '',
            role: saved.role,
            is_admin: saved.is_admin,
            clinic_id: saved.clinic.id,
            clinic_name: saved.clinic.name,
            is_profile_complete: saved.user.profile_completed_at ? true : false,
            profile_completed_at: saved.user.profile_completed_at,
            created_at: saved.user.created_at,
            user_status: saved.user.status
        };
    }
}