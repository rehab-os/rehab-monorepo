import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsNumber, IsBoolean, IsArray, IsDateString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { 
  PhysiotherapistSpecialization, 
  ExperienceLevel 
} from '@rehab/database';

export class CreatePhysiotherapistProfileDto {
  @ApiProperty()
  @IsString()
  license_number!: string;

  @ApiProperty({ enum: ExperienceLevel })
  @IsEnum(ExperienceLevel)
  experience_level!: ExperienceLevel;

  @ApiProperty()
  @IsNumber()
  years_of_experience!: number;

  @ApiProperty({ enum: PhysiotherapistSpecialization, isArray: true })
  @IsArray()
  @IsEnum(PhysiotherapistSpecialization, { each: true })
  specializations!: PhysiotherapistSpecialization[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];
}

export class UpdatePhysiotherapistProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  license_number?: string;

  @ApiPropertyOptional({ enum: ExperienceLevel })
  @IsOptional()
  @IsEnum(ExperienceLevel)
  experience_level?: ExperienceLevel;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  years_of_experience?: number;

  @ApiPropertyOptional({ enum: PhysiotherapistSpecialization, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(PhysiotherapistSpecialization, { each: true })
  specializations?: PhysiotherapistSpecialization[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_profile_complete?: boolean;
}

export class CreateEducationDto {
  @ApiProperty()
  @IsString()
  institution_name!: string;

  @ApiProperty()
  @IsString()
  degree_name!: string;

  @ApiProperty()
  @IsString()
  education_type!: string;

  @ApiProperty()
  @IsString()
  education_level!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  specialization?: string;

  @ApiProperty()
  @IsDateString()
  start_date!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiProperty()
  @IsBoolean()
  is_current!: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  grade?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  grade_system?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateTechniqueDto {
  @ApiProperty()
  @IsString()
  technique_name!: string;

  @ApiProperty()
  @IsString()
  category!: string;

  @ApiProperty()
  @IsString()
  proficiency_level!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  years_of_practice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  certification_body?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  certified_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  certification_expiry?: string;
}

export class CreateMachineDto {
  @ApiProperty()
  @IsString()
  machine_name!: string;

  @ApiProperty()
  @IsString()
  category!: string;

  @ApiProperty()
  @IsString()
  competency_level!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  years_of_experience?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  training_received?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  certification_body?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  certified_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  certification_expiry?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_certified?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateWorkshopDto {
  @ApiProperty()
  @IsString()
  workshop_name!: string;

  @ApiProperty()
  @IsString()
  workshop_type!: string;

  @ApiProperty()
  @IsString()
  organizer_name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instructor_name?: string;

  @ApiProperty()
  @IsDateString()
  start_date!: string;

  @ApiProperty()
  @IsDateString()
  end_date!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  duration_hours?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty()
  @IsBoolean()
  is_online!: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  topics_covered?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  skills_learned?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  certificate_url?: string;

  @ApiProperty()
  @IsBoolean()
  has_certificate!: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  rating?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CompletePhysiotherapistProfileDto {
  @ApiProperty()
  @ValidateNested()
  @Type(() => CreatePhysiotherapistProfileDto)
  profile!: CreatePhysiotherapistProfileDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEducationDto)
  educations?: CreateEducationDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTechniqueDto)
  techniques?: CreateTechniqueDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMachineDto)
  machines?: CreateMachineDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkshopDto)
  workshops?: CreateWorkshopDto[];
}