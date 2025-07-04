import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsUUID, IsEnum, IsDateString, IsArray, IsNotEmpty, IsPhoneNumber, MaxLength, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { PatientStatus } from '@rehab/database';

export class CreatePatientDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    full_name!: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsPhoneNumber('IN')
    phone!: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsDateString()
    date_of_birth!: string;

    @ApiProperty({ enum: ['M', 'F', 'OTHER'] })
    @IsNotEmpty()
    @IsEnum(['M', 'F', 'OTHER'])
    gender!: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    address?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    emergency_contact_name?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsPhoneNumber('IN')
    emergency_contact_phone?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    medical_history?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    allergies?: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    current_medications?: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    referred_by?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    insurance_provider?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    insurance_policy_number?: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    clinic_id!: string;
}

export class UpdatePatientDto extends PartialType(CreatePatientDto) {
    @ApiPropertyOptional({ enum: PatientStatus })
    @IsOptional()
    @IsEnum(PatientStatus)
    status?: PatientStatus;
}

export class PatientResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    clinic_id!: string;

    @ApiProperty()
    patient_code!: string;

    @ApiProperty()
    full_name!: string;

    @ApiProperty()
    phone!: string;

    @ApiPropertyOptional()
    email?: string;

    @ApiProperty()
    date_of_birth!: Date;

    @ApiProperty()
    gender!: string;

    @ApiPropertyOptional()
    address?: string;

    @ApiPropertyOptional()
    emergency_contact_name?: string;

    @ApiPropertyOptional()
    emergency_contact_phone?: string;

    @ApiPropertyOptional()
    medical_history?: string;

    @ApiPropertyOptional()
    allergies?: string[];

    @ApiPropertyOptional()
    current_medications?: string[];

    @ApiProperty({ enum: PatientStatus })
    status!: PatientStatus;

    @ApiPropertyOptional()
    referred_by?: string;

    @ApiPropertyOptional()
    insurance_provider?: string;

    @ApiPropertyOptional()
    insurance_policy_number?: string;

    @ApiProperty()
    created_by!: string;

    @ApiProperty()
    created_at!: Date;

    @ApiProperty()
    updated_at!: Date;

    @ApiPropertyOptional()
    clinic?: any;

    @ApiPropertyOptional()
    creator?: any;

    @ApiPropertyOptional()
    referrer?: any;

    @ApiPropertyOptional()
    visits?: any[];
}

export class PatientListQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    clinic_id?: string;

    @ApiPropertyOptional({ enum: PatientStatus })
    @IsOptional()
    @IsEnum(PatientStatus)
    status?: PatientStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    page?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    limit?: number;
}