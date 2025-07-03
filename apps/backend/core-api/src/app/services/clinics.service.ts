import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Clinic, User, UserClinicRole, ClinicOwner, Role } from '@rehab/database';
import { CreateClinicDto, UpdateClinicDto, ClinicResponseDto } from '@rehab/common';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ClinicsService {
    constructor(
        @InjectRepository(Clinic)
        private clinicRepository: Repository<Clinic>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(UserClinicRole)
        private userClinicRoleRepository: Repository<UserClinicRole>,
        @InjectRepository(ClinicOwner)
        private clinicOwnerRepository: Repository<ClinicOwner>,
        @InjectRepository(Role)
        private roleRepository: Repository<Role>,
        private authService: AuthService,
        private dataSource: DataSource,
    ) { }

    async create(
        organizationId: string,
        createClinicDto: CreateClinicDto,
        creatorId: string,
    ): Promise<ClinicResponseDto> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Check if admin user exists
            const adminUser = await this.userRepository.findOne({
                where: { phone: createClinicDto.admin_phone },
            });

            if (!adminUser) {
                throw new BadRequestException(
                    'Admin user must be registered first. Please ensure the admin completes registration.',
                );
            }

            // Generate clinic code
            const clinicCount = await this.clinicRepository.count({
                where: { organization_id: organizationId },
            });
            const code = `ORG${organizationId.substring(0, 3).toUpperCase()}-C${String(clinicCount + 1).padStart(3, '0')}`;

            // Create clinic
            const clinic = this.clinicRepository.create({
                ...createClinicDto,
                organization_id: organizationId,
                code,
            });

            const savedClinic = await queryRunner.manager.save(clinic);

            // Create clinic owner record
            const clinicOwner = this.clinicOwnerRepository.create({
                user_id: adminUser.id,
                clinic_id: savedClinic.id,
                ownership_percentage: 100,
                effective_from: new Date(),
                is_primary_owner: true,
            });
            await queryRunner.manager.save(clinicOwner);

            // Create user clinic role with admin privileges
            const userClinicRole = this.userClinicRoleRepository.create({
                user_id: adminUser.id,
                clinic_id: savedClinic.id,
                role: 'physiotherapist', // Default role
                is_admin: true, // Make them admin of this clinic
            });
            await queryRunner.manager.save(userClinicRole);

            await queryRunner.commitTransaction();
            return this.toResponseDto(savedClinic);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async findAll(organizationId?: string): Promise<ClinicResponseDto[]> {
        const where: any = { is_active: true };
        if (organizationId) {
            where.organization_id = organizationId;
        }

        const clinics = await this.clinicRepository.find({
            where,
            order: { created_at: 'DESC' },
        });

        return clinics.map(clinic => this.toResponseDto(clinic));
    }

    async findOne(id: string): Promise<ClinicResponseDto> {
        const clinic = await this.clinicRepository.findOne({
            where: { id },
            relations: ['organization'],
        });

        if (!clinic) {
            throw new NotFoundException('Clinic not found');
        }

        return this.toResponseDto(clinic);
    }

    async update(id: string, updateClinicDto: UpdateClinicDto): Promise<ClinicResponseDto> {
        const clinic = await this.clinicRepository.findOne({ where: { id } });

        if (!clinic) {
            throw new NotFoundException('Clinic not found');
        }

        Object.assign(clinic, updateClinicDto);
        const saved = await this.clinicRepository.save(clinic);
        return this.toResponseDto(saved);
    }

    async remove(id: string): Promise<void> {
        const clinic = await this.clinicRepository.findOne({ where: { id } });

        if (!clinic) {
            throw new NotFoundException('Clinic not found');
        }

        clinic.is_active = false;
        await this.clinicRepository.save(clinic);
    }

    private toResponseDto(clinic: Clinic): ClinicResponseDto {
        return {
            id: clinic.id,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            organization_id: clinic.organization_id,
            name: clinic.name,
            code: clinic.code,
            address: clinic.address,
            city: clinic.city,
            state: clinic.state,
            pincode: clinic.pincode,
            phone: clinic.phone,
            email: clinic.email,
            latitude: clinic.latitude,
            longitude: clinic.longitude,
            working_hours: clinic.working_hours,
            facilities: clinic.facilities,
            total_beds: clinic.total_beds,
            is_active: clinic.is_active,
            created_at: clinic.created_at,
            updated_at: clinic.updated_at,
        };
    }
}