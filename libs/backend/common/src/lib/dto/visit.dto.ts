import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsEnum, IsDateString, IsInt, Min, Max, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { VisitStatus, VisitType } from '@rehab/database';

class VitalSignsDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    blood_pressure?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    heart_rate?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    temperature?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    respiratory_rate?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    oxygen_saturation?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    weight?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    height?: number;
}

export class CreateVisitDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    patient_id!: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    clinic_id!: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    physiotherapist_id!: string;

    @ApiProperty({ enum: VisitType })
    @IsNotEmpty()
    @IsEnum(VisitType)
    visit_type!: VisitType;

    @ApiProperty()
    @IsNotEmpty()
    @IsDateString()
    scheduled_date!: string;

    @ApiProperty({ example: '14:30' })
    @IsNotEmpty()
    @IsString()
    scheduled_time!: string;

    @ApiProperty({ default: 30 })
    @IsOptional()
    @IsInt()
    @Min(15)
    @Max(120)
    duration_minutes?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    chief_complaint?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    parent_visit_id?: string;
}

export class UpdateVisitDto extends PartialType(CreateVisitDto) {
    @ApiPropertyOptional({ enum: VisitStatus })
    @IsOptional()
    @IsEnum(VisitStatus)
    status?: VisitStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @ValidateNested()
    @Type(() => VitalSignsDto)
    vital_signs?: VitalSignsDto;
}

export class CheckInVisitDto {
    @ApiPropertyOptional()
    @IsOptional()
    @ValidateNested()
    @Type(() => VitalSignsDto)
    vital_signs?: VitalSignsDto;
}

export class StartVisitDto {
    @ApiPropertyOptional()
    @IsOptional()
    @ValidateNested()
    @Type(() => VitalSignsDto)
    vital_signs?: VitalSignsDto;
}

export class CancelVisitDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    cancellation_reason!: string;
}

export class RescheduleVisitDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsDateString()
    scheduled_date!: string;

    @ApiProperty({ example: '14:30' })
    @IsNotEmpty()
    @IsString()
    scheduled_time!: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    @Min(15)
    @Max(120)
    duration_minutes?: number;
}

export class VisitResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    patient_id!: string;

    @ApiProperty()
    clinic_id!: string;

    @ApiProperty()
    physiotherapist_id!: string;

    @ApiProperty({ enum: VisitType })
    visit_type!: VisitType;

    @ApiProperty()
    scheduled_date!: Date;

    @ApiProperty()
    scheduled_time!: string;

    @ApiProperty()
    duration_minutes!: number;

    @ApiProperty({ enum: VisitStatus })
    status!: VisitStatus;

    @ApiPropertyOptional()
    chief_complaint?: string;

    @ApiPropertyOptional()
    check_in_time?: Date;

    @ApiPropertyOptional()
    start_time?: Date;

    @ApiPropertyOptional()
    end_time?: Date;

    @ApiPropertyOptional()
    cancellation_reason?: string;

    @ApiPropertyOptional()
    cancelled_by?: string;

    @ApiPropertyOptional()
    cancelled_at?: Date;

    @ApiPropertyOptional()
    parent_visit_id?: string;

    @ApiPropertyOptional()
    vital_signs?: any;

    @ApiProperty()
    created_by!: string;

    @ApiProperty()
    created_at!: Date;

    @ApiProperty()
    updated_at!: Date;

    @ApiPropertyOptional()
    patient?: any;

    @ApiPropertyOptional()
    clinic?: any;

    @ApiPropertyOptional()
    physiotherapist?: any;

    @ApiPropertyOptional()
    note?: any;
}

export class VisitListQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    clinic_id?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    patient_id?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    physiotherapist_id?: string;

    @ApiPropertyOptional({ enum: VisitStatus })
    @IsOptional()
    @IsEnum(VisitStatus)
    status?: VisitStatus;

    @ApiPropertyOptional({ enum: VisitType })
    @IsOptional()
    @IsEnum(VisitType)
    visit_type?: VisitType;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    date_from?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    date_to?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    page?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    limit?: number;
}

export class PhysiotherapistAvailabilityDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    clinic_id!: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsDateString()
    date!: string;

    @ApiProperty({ example: '14:30' })
    @IsNotEmpty()
    @IsString()
    time!: string;

    @ApiProperty({ default: 30 })
    @IsOptional()
    @IsInt()
    @Min(15)
    @Max(120)
    duration_minutes?: number;
}