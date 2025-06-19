import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Organization, User, UserRole, Role, OrganizationOwner } from '@rehab/database';
import { CreateOrganizationDto, UpdateOrganizationDto, OrganizationResponseDto } from '@rehab/common';
import { AuthService } from './auth.service';

@Injectable()
export class OrganizationsService {
    constructor(
        @InjectRepository(Organization)
        private organizationRepository: Repository<Organization>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(UserRole)
        private userRoleRepository: Repository<UserRole>,
        @InjectRepository(Role)
        private roleRepository: Repository<Role>,
        @InjectRepository(OrganizationOwner)
        private organizationOwnerRepository: Repository<OrganizationOwner>,
        private authService: AuthService,
        private dataSource: DataSource,
    ) { }

    async create(createOrganizationDto: CreateOrganizationDto, creatorId: string): Promise<OrganizationResponseDto> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Check if admin user exists
            let adminUser = await this.userRepository.findOne({
                where: { phone: createOrganizationDto.admin_phone },
            });

            if (!adminUser) {
                // Create admin user
                adminUser = this.userRepository.create({
                    phone: createOrganizationDto.admin_phone,
                    full_name: createOrganizationDto.admin_name,
                    email: createOrganizationDto.admin_email,
                });
                adminUser = await queryRunner.manager.save(adminUser);

                // Send OTP to admin for account activation
                await this.authService.sendOtp({ phone: createOrganizationDto.admin_phone });
            }

            // Generate slug
            const slug = createOrganizationDto.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');

            // Check if slug exists
            const existingSlug = await this.organizationRepository.findOne({ where: { slug } });
            if (existingSlug) {
                throw new ConflictException('Organization name already exists');
            }

            // Create organization
            const organization = this.organizationRepository.create({
                name: createOrganizationDto.name,
                slug,
                type: createOrganizationDto.type,
                registration_no: createOrganizationDto.registration_no,
                gst_no: createOrganizationDto.gst_no,
                pan_no: createOrganizationDto.pan_no,
                bank_details: createOrganizationDto.bank_details,
                created_by: creatorId,
            });

            const savedOrg = await queryRunner.manager.save(organization);

            // Create organization owner record
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            const orgOwner = this.organizationOwnerRepository.create({
                user_id: adminUser.id,
                organization_id: savedOrg.id,
                ownership_type: 'FOUNDER',
                ownership_percentage: 100,
                effective_from: new Date(),
            });
            await queryRunner.manager.save(orgOwner);

            // Assign org_owner role to admin
            const orgOwnerRole = await this.roleRepository.findOne({ where: { name: 'org_owner' } });
            if (!orgOwnerRole) {
                throw new Error('org_owner role not found in system');
            }

            const userRole = this.userRoleRepository.create({
                user_id: adminUser.id,
                role_id: orgOwnerRole.id,
                organization_id: savedOrg.id,
                assigned_by: creatorId,
            });
            await queryRunner.manager.save(userRole);

            await queryRunner.commitTransaction();
            return this.toResponseDto(savedOrg);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async findAll(): Promise<OrganizationResponseDto[]> {
        const organizations = await this.organizationRepository.find({
            where: { is_active: true },
            order: { created_at: 'DESC' },
        });
        return organizations.map(org => this.toResponseDto(org));
    }

    async findOne(id: string): Promise<OrganizationResponseDto> {
        const organization = await this.organizationRepository.findOne({
            where: { id },
        });

        if (!organization) {
            throw new NotFoundException('Organization not found');
        }

        return this.toResponseDto(organization);
    }

    async update(id: string, updateOrganizationDto: UpdateOrganizationDto): Promise<OrganizationResponseDto> {
        const organization = await this.organizationRepository.findOne({ where: { id } });

        if (!organization) {
            throw new NotFoundException('Organization not found');
        }

        Object.assign(organization, updateOrganizationDto);
        const saved = await this.organizationRepository.save(organization);
        return this.toResponseDto(saved);
    }

    async remove(id: string): Promise<void> {
        const organization = await this.organizationRepository.findOne({ where: { id } });

        if (!organization) {
            throw new NotFoundException('Organization not found');
        }

        organization.is_active = false;
        await this.organizationRepository.save(organization);
    }

    private toResponseDto(organization: Organization): OrganizationResponseDto {
        return {
            id: organization.id,
            name: organization.name,
            slug: organization.slug,
            type: organization.type,
            registration_no: organization.registration_no,
            gst_no: organization.gst_no,
            pan_no: organization.pan_no,
            logo_url: organization.logo_url,
            created_by: organization.created_by,
            is_active: organization.is_active,
            created_at: organization.created_at,
            updated_at: organization.updated_at,
        };
    }
}