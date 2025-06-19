import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { ClinicsService } from '../services/clinics.service';
import { CreateClinicDto, UpdateClinicDto, ClinicResponseDto } from '@rehab/common';
import { AuthGuard, PermissionsGuard, RequirePermissions } from '@rehab/common';

@ApiTags('Clinics')
@Controller('clinics')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class ClinicsController {
    constructor(private readonly clinicsService: ClinicsService) { }

    @Post()
    // @RequirePermissions('clinics:create')
    @ApiOperation({ summary: 'Create a new clinic' })
    @ApiHeader({ name: 'x-organization-id', required: true })
    @ApiResponse({ status: 201, description: 'Clinic created', type: ClinicResponseDto })
    create(
        @Body() createClinicDto: CreateClinicDto,
        @Headers('x-organization-id') organizationId: string,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        @Request() req,
    ): Promise<ClinicResponseDto> {
        return this.clinicsService.create(organizationId, createClinicDto, req.user.id);
    }

    @Get()
    // @RequirePermissions('clinics:read')
    @ApiOperation({ summary: 'Get all clinics' })
    @ApiHeader({ name: 'x-organization-id', required: false })
    @ApiResponse({ status: 200, description: 'List of clinics', type: [ClinicResponseDto] })
    findAll(@Headers('x-organization-id') organizationId?: string): Promise<ClinicResponseDto[]> {
        return this.clinicsService.findAll(organizationId);
    }

    @Get(':id')
    // @RequirePermissions('clinics:read')
    @ApiOperation({ summary: 'Get clinic by ID' })
    @ApiResponse({ status: 200, description: 'Clinic details', type: ClinicResponseDto })
    findOne(@Param('id') id: string): Promise<ClinicResponseDto> {
        return this.clinicsService.findOne(id);
    }

    @Patch(':id')
    // @RequirePermissions('clinics:update')
    @ApiOperation({ summary: 'Update clinic' })
    @ApiResponse({ status: 200, description: 'Clinic updated', type: ClinicResponseDto })
    update(@Param('id') id: string, @Body() updateClinicDto: UpdateClinicDto): Promise<ClinicResponseDto> {
        return this.clinicsService.update(id, updateClinicDto);
    }

    @Delete(':id')
    // @RequirePermissions('clinics:delete')
    @ApiOperation({ summary: 'Deactivate clinic' })
    @ApiResponse({ status: 200, description: 'Clinic deactivated' })
    remove(@Param('id') id: string): Promise<void> {
        return this.clinicsService.remove(id);
    }
}