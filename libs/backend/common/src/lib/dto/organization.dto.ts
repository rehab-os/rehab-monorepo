import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsObject, IsPhoneNumber } from 'class-validator';

export class CreateOrganizationDto {
    @ApiProperty({ example: 'HealthCare Chain' })
    @IsString()
    @IsNotEmpty()
    name!: string;


    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    registration_no?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    gst_no?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    pan_no?: string;

    @ApiPropertyOptional()
    @IsObject()
    @IsOptional()
    bank_details?: Record<string, any>;

    @ApiProperty({ description: 'Admin phone number', example: '+1234567890' })
    @IsPhoneNumber()
    @IsNotEmpty()
    admin_phone!: string;

    @ApiProperty({ description: 'Admin full name', example: 'John Doe' })
    @IsString()
    @IsNotEmpty()
    admin_name!: string;

    @ApiPropertyOptional({ description: 'Admin email' })
    @IsString()
    @IsOptional()
    admin_email?: string;
}

export class UpdateOrganizationDto extends PartialType(CreateOrganizationDto) { }

export class OrganizationResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    name!: string;

    @ApiProperty()
    slug!: string;

    @ApiProperty()
    type!: string;

    @ApiProperty()
    registration_no?: string;

    @ApiProperty()
    gst_no?: string;

    @ApiProperty()
    pan_no?: string;

    @ApiProperty()
    logo_url?: string;

    @ApiProperty()
    owner_user_id!: string;

    @ApiProperty()
    is_active!: boolean;

    @ApiProperty()
    created_at!: Date;

    @ApiProperty()
    updated_at!: Date;
}