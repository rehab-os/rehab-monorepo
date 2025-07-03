import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsPhoneNumber, IsEmail, IsArray, IsUUID } from 'class-validator';
import { ClinicRole } from '@rehab/database';

export class AddTeamMemberDto {
    @ApiProperty({ example: '+919876543210' })
    @IsPhoneNumber()
    @IsNotEmpty()
    phone!: string;

    @ApiProperty({ example: 'john.doe@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @ApiProperty({ example: 'John Doe' })
    @IsString()
    @IsNotEmpty()
    full_name!: string;

    @ApiProperty({ enum: ClinicRole, example: ClinicRole.PHYSIOTHERAPIST })
    @IsEnum(ClinicRole)
    @IsNotEmpty()
    role!: ClinicRole;

    @ApiPropertyOptional({ description: 'Clinic IDs where this member will work', type: [String] })
    @IsArray()
    @IsOptional()
    @IsUUID(4, { each: true })
    clinic_ids?: string[];

    @ApiPropertyOptional({ description: 'Make this member admin of specified clinics', type: [String] })
    @IsArray()
    @IsOptional()
    @IsUUID(4, { each: true })
    admin_clinic_ids?: string[];
}

export class TeamMemberResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    full_name!: string;

    @ApiProperty()
    phone!: string;

    @ApiProperty()
    email!: string;

    @ApiProperty({ enum: ClinicRole })
    role!: ClinicRole;

    @ApiProperty()
    is_admin!: boolean;

    @ApiProperty()
    clinic_id!: string;

    @ApiProperty()
    clinic_name!: string;

    @ApiProperty()
    is_profile_complete!: boolean;

    @ApiProperty()
    profile_completed_at?: Date;

    @ApiProperty()
    created_at!: Date;

    @ApiProperty()
    user_status!: string;
}

export class BulkTeamMembersResponseDto {
    @ApiProperty({ type: [TeamMemberResponseDto] })
    members!: TeamMemberResponseDto[];

    @ApiProperty()
    total_count!: number;

    @ApiProperty()
    physiotherapists_count!: number;

    @ApiProperty()
    receptionists_count!: number;
}