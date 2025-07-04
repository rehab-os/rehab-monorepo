import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsEnum, IsArray, IsNotEmpty, ValidateNested, IsObject, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { NoteType } from '@rehab/database';

class SOAPNoteDataDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    subjective!: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    objective!: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    assessment!: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    plan!: string;
}

class DAPNoteDataDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    data!: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    assessment!: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    plan!: string;
}

class ProgressNoteDataDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    progress!: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    interventions!: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    response!: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    plan!: string;
}

class TreatmentDetailsDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    modalities?: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    exercises?: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    manual_therapy?: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    education?: string[];
}

class GoalsDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    short_term?: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    long_term?: string[];
}

export class CreateNoteDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    visit_id!: string;

    @ApiProperty({ enum: NoteType })
    @IsNotEmpty()
    @IsEnum(NoteType)
    note_type!: NoteType;

    @ApiProperty({ description: 'Note data based on note_type' })
    @IsNotEmpty()
    @IsObject()
    note_data!: SOAPNoteDataDto | DAPNoteDataDto | ProgressNoteDataDto;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    additional_notes?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    treatment_codes?: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @ValidateNested()
    @Type(() => TreatmentDetailsDto)
    treatment_details?: TreatmentDetailsDto;

    @ApiPropertyOptional()
    @IsOptional()
    @ValidateNested()
    @Type(() => GoalsDto)
    goals?: GoalsDto;

    @ApiPropertyOptional()
    @IsOptional()
    @IsObject()
    outcome_measures?: Record<string, any>;

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    attachments?: string[];
}

export class UpdateNoteDto extends PartialType(CreateNoteDto) {}

export class SignNoteDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsBoolean()
    is_signed!: boolean;
}

export class NoteResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    visit_id!: string;

    @ApiProperty({ enum: NoteType })
    note_type!: NoteType;

    @ApiProperty()
    note_data!: any;

    @ApiPropertyOptional()
    additional_notes?: string;

    @ApiPropertyOptional()
    treatment_codes?: string[];

    @ApiPropertyOptional()
    treatment_details?: any;

    @ApiPropertyOptional()
    goals?: any;

    @ApiPropertyOptional()
    outcome_measures?: Record<string, any>;

    @ApiPropertyOptional()
    attachments?: string[];

    @ApiProperty()
    is_signed!: boolean;

    @ApiPropertyOptional()
    signed_by?: string;

    @ApiPropertyOptional()
    signed_at?: Date;

    @ApiProperty()
    created_by!: string;

    @ApiProperty()
    created_at!: Date;

    @ApiProperty()
    updated_at!: Date;

    @ApiPropertyOptional()
    visit?: any;

    @ApiPropertyOptional()
    creator?: any;

    @ApiPropertyOptional()
    signer?: any;
}

export class NoteListQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    patient_id?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    clinic_id?: string;

    @ApiPropertyOptional({ enum: NoteType })
    @IsOptional()
    @IsEnum(NoteType)
    note_type?: NoteType;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    is_signed?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    page?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    limit?: number;
}