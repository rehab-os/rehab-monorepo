import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePermissionDto {
    @ApiProperty({ example: 'clinic' })
    @IsString()
    @IsNotEmpty()
    resource!: string;

    @ApiProperty({ example: 'create' })
    @IsString()
    @IsNotEmpty()
    action!: string;

    @ApiPropertyOptional({ example: 'Allows creation of clinics' })
    @IsString()
    @IsOptional()
    description?: string;
}

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) { }

export class PermissionResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    resource!: string;

    @ApiProperty()
    action!: string;

    @ApiProperty()
    name!: string;

    @ApiProperty()
    description?: string;

    @ApiProperty()
    created_at!: Date;
}