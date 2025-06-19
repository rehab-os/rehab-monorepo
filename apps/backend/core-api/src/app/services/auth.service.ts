import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { User, UserRole, Role, RolePermission, Permission } from '@rehab/database';
import { LoginDto, SendOtpDto, LoginResponseDto } from '@rehab/common';

// Define a type for the loaded relations
type UserRoleWithFullRelations = UserRole & {
    role: Role & {
        rolePermissions: (RolePermission & {
            permission: Permission;
        })[];
    };
    organization?: {
        id: string;
        name: string;
    };
    clinic?: {
        id: string;
        name: string;
    };
};

@Injectable()
export class AuthService {
    private supabase: SupabaseClient;

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(UserRole)
        private userRoleRepository: Repository<UserRole>,
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
            where: { phone },
            relations: ['userRoles', 'userRoles.role', 'userRoles.role.rolePermissions', 'userRoles.role.rolePermissions.permission'],
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

        // Get user roles with permissions
        const roles = await this.getUserRolesWithPermissions(user.id);

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
            user: {
                id: user.id,
                phone: user.phone,
                full_name: user.full_name,
                email: user.email,
                roles,
            },
        };
    }

    private async getUserRolesWithPermissions(userId: string): Promise<any[]> {
        const userRoles = await this.userRoleRepository.find({
            where: { user_id: userId, is_active: true },
            relations: ['role', 'role.rolePermissions', 'role.rolePermissions.permission', 'organization', 'clinic'],
        }) as UserRoleWithFullRelations[];

        return userRoles.map((userRole: UserRoleWithFullRelations) => ({
            role: userRole.role.name,
            display_name: userRole.role.display_name,
            organization_id: userRole.organization_id,
            clinic_id: userRole.clinic_id,
            permissions: userRole.role.rolePermissions?.map(rp => rp.permission.name) || [],
        }));
    }

    async validateToken(token: string): Promise<any> {
        try {
            return await this.jwtService.verifyAsync(token);
        } catch {
            throw new UnauthorizedException('Invalid token');
        }
    }
}