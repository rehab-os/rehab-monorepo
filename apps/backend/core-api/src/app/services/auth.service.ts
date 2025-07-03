import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { User, UserClinicRole, Organization, Clinic } from '@rehab/database';
import { LoginDto, SendOtpDto, LoginResponseDto } from '@rehab/common';

// Define a type for the loaded relations
type UserClinicRoleWithRelations = UserClinicRole & {
    clinic: Clinic & {
        organization: Organization;
    };
};

@Injectable()
export class AuthService {
    private supabase: SupabaseClient;

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(UserClinicRole)
        private userClinicRoleRepository: Repository<UserClinicRole>,
        @InjectRepository(Organization)
        private organizationRepository: Repository<Organization>,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {
        const supabaseUrl = this.configService.get<string>('supabase.url');
        const supabaseKey = this.configService.get<string>('supabase.serviceKey');

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase configuration is missing');
        }

        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    async sendOtp(sendOtpDto: SendOtpDto): Promise<{ message: string }> {
        const { phone } = sendOtpDto;

        // Send OTP via Supabase
        const { error } = await this.supabase.auth.signInWithOtp({
            phone,
        });

        if (error) {
            throw new BadRequestException(error.message);
        }

        return { message: 'OTP sent successfully' };
    }

    async login(loginDto: LoginDto): Promise<LoginResponseDto> {
        const { phone, otp } = loginDto;

        // Verify OTP with Supabase
        const { data: authData, error } = await this.supabase.auth.verifyOtp({
            phone,
            token: otp,
            type: 'sms',
        });

        if (error || !authData.user) {
            throw new UnauthorizedException('Invalid OTP');
        }

        // Get or create user
        let user = await this.userRepository.findOne({
            where: { phone }
        });

        if (!user) {


            // Create new user
            user = this.userRepository.create({
                id: authData.user.id,
                phone,
                full_name: 'New User', // Will be updated in profile completion
            });
            await this.userRepository.save(user);
        }

        // Get user organization and clinic data
        const userData = await this.getUserWithOrganizationData(user.id);

        const payload = {
            id: user.id,
            phone: user.phone,
            sub: user.id,
        };

        const access_token = await this.jwtService.signAsync(payload);
        const refresh_token = await this.jwtService.signAsync(payload, {
            expiresIn: '7d',
        });

        return {
            access_token,
            refresh_token,
            user: userData,
        };
    }

    async getUserWithOrganizationData(userId: string): Promise<any> {
        // Get user basic info
        const user = await this.userRepository.findOne({
            where: { id: userId }
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // Get user's clinic roles
        const userClinicRoles = await this.userClinicRoleRepository.find({
            where: { user_id: userId },
            relations: ['clinic', 'clinic.organization']
        }) as UserClinicRoleWithRelations[];

        // Check if user owns any organization
        const ownedOrganization = await this.organizationRepository.findOne({
            where: { owner_user_id: userId },
            relations: ['clinics']
        });

        if (ownedOrganization) {
            // User is an organization owner
            const clinics = userClinicRoles
                .filter(ucr => ucr.clinic.organization.id === ownedOrganization.id)
                .map(ucr => ({
                    id: ucr.clinic.id,
                    name: ucr.clinic.name,
                    role: ucr.role,
                    is_admin: ucr.is_admin
                }));

            return {
                user_id: user.id,
                name: user.full_name,
                organization: {
                    id: ownedOrganization.id,
                    name: ownedOrganization.name,
                    is_owner: true,
                    clinics
                }
            };
        } else if (userClinicRoles.length > 0) {
            // User has clinic roles but doesn't own organization
            const organization = userClinicRoles[0].clinic.organization;
            const clinics = userClinicRoles.map(ucr => ({
                id: ucr.clinic.id,
                name: ucr.clinic.name,
                role: ucr.role,
                is_admin: ucr.is_admin
            }));

            return {
                user_id: user.id,
                name: user.full_name,
                organization: {
                    id: organization.id,
                    name: organization.name,
                    is_owner: false,
                    clinics
                }
            };
        } else {
            // User has no organization/clinic association
            return {
                user_id: user.id,
                name: user.full_name,
                organization: null
            };
        }
    }

    async validateToken(token: string): Promise<any> {
        try {
            return await this.jwtService.verifyAsync(token);
        } catch {
            throw new UnauthorizedException('Invalid token');
        }
    }
}