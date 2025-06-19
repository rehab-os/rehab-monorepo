import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsEmail, IsEnum, IsDateString, IsOptional, IsUUID, IsPhoneNumber, IsNotEmpty } from 'class-validator';
import { Gender, BloodGroup, UserStatus } from '@rehab/database';

export class CreateUserDto {
    @ApiProperty({ example: '+1234567890' })
    @IsPhoneNumber()
    @IsNotEmpty()
    phone!: string;

    @ApiProperty({ example: 'John Doe' })
    @IsString()
    @IsNotEmpty()
    full_name!: string;

    @ApiPropertyOptional({ example: 'john@example.com' })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiPropertyOptional({ example: '1990-01-01' })
    @IsDateString()
    @IsOptional()
    date_of_birth?: string;

    @ApiPropertyOptional({ enum: Gender })
    @IsEnum(Gender)
    @IsOptional()
    gender?: Gender;

    @ApiPropertyOptional({ enum: BloodGroup })
    @IsEnum(BloodGroup)
    @IsOptional()
    blood_group?: BloodGroup;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    emergency_contact?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    address?: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @ApiPropertyOptional({ enum: UserStatus })
    @IsEnum(UserStatus)
    @IsOptional()
    user_status?: UserStatus;
}

export class UpdateProfileDto {
    @ApiPropertyOptional({ example: 'John Doe' })
    @IsString()
    @IsOptional()
    full_name?: string;

    @ApiPropertyOptional({ example: 'john@example.com' })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiPropertyOptional({ example: '1990-01-01' })
    @IsDateString()
    @IsOptional()
    date_of_birth?: string;

    @ApiPropertyOptional({ enum: Gender })
    @IsEnum(Gender)
    @IsOptional()
    gender?: Gender;

    @ApiPropertyOptional({ enum: BloodGroup })
    @IsEnum(BloodGroup)
    @IsOptional()
    blood_group?: BloodGroup;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    emergency_contact?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    address?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    profile_photo_url?: string;
}

export class AssignRoleDto {
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    roleId!: string;

    @ApiPropertyOptional()
    @IsUUID()
    @IsOptional()
    organizationId?: string;

    @ApiPropertyOptional()
    @IsUUID()
    @IsOptional()
    clinicId?: string;
}

export class UserListQueryDto {
    @ApiPropertyOptional()
    @IsUUID()
    @IsOptional()
    organizationId?: string;

    @ApiPropertyOptional()
    @IsUUID()
    @IsOptional()
    clinicId?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    role?: string;

    @ApiPropertyOptional({ enum: UserStatus })
    @IsEnum(UserStatus)
    @IsOptional()
    status?: UserStatus;

    @ApiPropertyOptional({ default: 1 })
    @IsOptional()
    page?: number;

    @ApiPropertyOptional({ default: 10 })
    @IsOptional()
    limit?: number;
}

export class UserResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    phone!: string;

    @ApiProperty()
    full_name!: string;

    @ApiPropertyOptional()
    email?: string;

    @ApiPropertyOptional()
    date_of_birth?: Date;

    @ApiPropertyOptional()
    gender?: Gender;

    @ApiPropertyOptional()
    profile_photo_url?: string;

    @ApiPropertyOptional()
    blood_group?: BloodGroup;

    @ApiPropertyOptional()
    emergency_contact?: string;

    @ApiPropertyOptional()
    address?: string;

    @ApiProperty()
    user_status!: UserStatus;

    @ApiProperty()
    profile_completed!: boolean;

    @ApiProperty()
    created_at!: Date;

    @ApiProperty()
    updated_at!: Date;

    @ApiPropertyOptional()
    roles?: Array<{
        id: string;
        role: {
            id: string;
            name: string;
            display_name: string;
        };
        organization?: {
            id: string;
            name: string;
        };
        clinic?: {
            id: string;
            name: string;
        };
        assigned_at: Date;
    }>;
}