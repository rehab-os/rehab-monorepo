import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, IsObject, IsPhoneNumber, Min, Max } from 'class-validator';

export class CreateClinicDto {
    @ApiProperty({ example: 'Main Branch Clinic' })
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    address!: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    city!: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    state!: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    pincode!: string;

    @ApiProperty()
    @IsPhoneNumber()
    @IsNotEmpty()
    phone!: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    email?: string;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    @Min(-90)
    @Max(90)
    latitude?: number;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    @Min(-180)
    @Max(180)
    longitude?: number;

    @ApiPropertyOptional()
    @IsObject()
    @IsOptional()
    working_hours?: Record<string, any>;

    @ApiPropertyOptional()
    @IsArray()
    @IsOptional()
    facilities?: string[];

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    total_beds?: number;

    @ApiProperty({ description: 'Clinic admin phone number' })
    @IsPhoneNumber()
    @IsNotEmpty()
    admin_phone!: string;
}

export class UpdateClinicDto extends PartialType(CreateClinicDto) { }

export class ClinicResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    organization_id!: string;

    @ApiProperty()
    name!: string;

    @ApiProperty()
    code!: string;

    @ApiProperty()
    address!: string;

    @ApiProperty()
    city!: string;

    @ApiProperty()
    state!: string;

    @ApiProperty()
    pincode!: string;

    @ApiProperty()
    phone!: string;

    @ApiProperty()
    email?: string;

    @ApiProperty()
    latitude?: number;

    @ApiProperty()
    longitude?: number;

    @ApiProperty()
    working_hours?: Record<string, any>;

    @ApiProperty()
    facilities?: string[];

    @ApiProperty()
    total_beds?: number;

    @ApiProperty()
    is_active!: boolean;

    @ApiProperty()
    created_at!: Date;

    @ApiProperty()
    updated_at!: Date;
}