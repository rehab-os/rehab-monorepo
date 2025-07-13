import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PatientsService } from '../services/patients.service';
import {
    CreatePatientDto,
    UpdatePatientDto,
    PatientResponseDto,
    PatientListQueryDto,
    CreateVisitDto,
    UpdateVisitDto,
    VisitResponseDto,
    VisitListQueryDto,
    CheckInVisitDto,
    StartVisitDto,
    CancelVisitDto,
    RescheduleVisitDto,
    PhysiotherapistAvailabilityDto,
    CreateNoteDto,
    UpdateNoteDto,
    NoteResponseDto,
    SignNoteDto,
    AuthGuard,
    PermissionsGuard,
    RequirePermissions
} from '@rehab/common';
import { Request as ExpressRequest } from 'express';

interface AuthenticatedRequest extends ExpressRequest {
    user: {
        id: string;
        phone: string;
        [key: string]: any;
    };
}

@ApiTags('Patients')
@Controller('patients')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard)
export class PatientsController {
    constructor(private readonly patientsService: PatientsService) { }

    // Patient Management Endpoints
    @Post()
    @UseGuards(PermissionsGuard)
    // @RequirePermissions('patients:create')
    @ApiOperation({ summary: 'Create a new patient' })
    @ApiResponse({ status: 201, description: 'Patient created', type: PatientResponseDto })
    createPatient(
        @Body() createPatientDto: CreatePatientDto,
        @Request() req: AuthenticatedRequest
    ): Promise<PatientResponseDto> {
        return this.patientsService.createPatient(createPatientDto, req.user.id);
    }

    @Get()
    @UseGuards(PermissionsGuard)
    // @RequirePermissions('patients:read')
    @ApiOperation({ summary: 'Get all patients' })
    @ApiResponse({ status: 200, description: 'List of patients' })
    findAllPatients(@Query() query: PatientListQueryDto): Promise<{ patients: PatientResponseDto[]; total: number }> {
        return this.patientsService.findAllPatients(query);
    }

    // Visit Management Endpoints
    @Post('visits')
    @UseGuards(PermissionsGuard)
    // @RequirePermissions('visits:create')
    @ApiOperation({ summary: 'Create a new visit' })
    @ApiResponse({ status: 201, description: 'Visit created', type: VisitResponseDto })
    createVisit(
        @Body() createVisitDto: CreateVisitDto,
        @Request() req: AuthenticatedRequest
    ): Promise<VisitResponseDto> {
        return this.patientsService.createVisit(createVisitDto, req.user.id);
    }

    @Get('visits')
    @UseGuards(PermissionsGuard)
    // @RequirePermissions('visits:read')
    @ApiOperation({ summary: 'Get all visits' })
    @ApiResponse({ status: 200, description: 'List of visits' })
    findAllVisits(@Query() query: VisitListQueryDto): Promise<{ visits: VisitResponseDto[]; total: number }> {
        return this.patientsService.findAllVisits(query);
    }

    @Get('visits/:id')
    @UseGuards(PermissionsGuard)
    // @RequirePermissions('visits:read')
    @ApiOperation({ summary: 'Get visit by ID' })
    @ApiResponse({ status: 200, description: 'Visit details', type: VisitResponseDto })
    findOneVisit(@Param('id') id: string): Promise<VisitResponseDto> {
        return this.patientsService.findOneVisit(id);
    }

    @Patch('visits/:id')
    @UseGuards(PermissionsGuard)
    // @RequirePermissions('visits:update')
    @ApiOperation({ summary: 'Update visit' })
    @ApiResponse({ status: 200, description: 'Visit updated', type: VisitResponseDto })
    updateVisit(
        @Param('id') id: string,
        @Body() updateVisitDto: UpdateVisitDto
    ): Promise<VisitResponseDto> {
        return this.patientsService.updateVisit(id, updateVisitDto);
    }

    @Post('visits/:id/check-in')
    @UseGuards(PermissionsGuard)
    // @RequirePermissions('visits:update')
    @ApiOperation({ summary: 'Check in patient for visit' })
    @ApiResponse({ status: 200, description: 'Patient checked in', type: VisitResponseDto })
    checkInVisit(
        @Param('id') id: string,
        @Body() checkInDto: CheckInVisitDto
    ): Promise<VisitResponseDto> {
        return this.patientsService.checkInVisit(id, checkInDto);
    }

    @Post('visits/:id/start')
    @UseGuards(PermissionsGuard)
    // @RequirePermissions('visits:update')
    @ApiOperation({ summary: 'Start visit' })
    @ApiResponse({ status: 200, description: 'Visit started', type: VisitResponseDto })
    startVisit(
        @Param('id') id: string,
        @Body() startDto: StartVisitDto
    ): Promise<VisitResponseDto> {
        return this.patientsService.startVisit(id, startDto);
    }

    @Post('visits/:id/complete')
    @UseGuards(PermissionsGuard)
    // @RequirePermissions('visits:update')
    @ApiOperation({ summary: 'Complete visit' })
    @ApiResponse({ status: 200, description: 'Visit completed', type: VisitResponseDto })
    completeVisit(@Param('id') id: string): Promise<VisitResponseDto> {
        return this.patientsService.completeVisit(id);
    }

    @Post('visits/:id/cancel')
    @UseGuards(PermissionsGuard)
    // @RequirePermissions('visits:update')
    @ApiOperation({ summary: 'Cancel visit' })
    @ApiResponse({ status: 200, description: 'Visit cancelled', type: VisitResponseDto })
    cancelVisit(
        @Param('id') id: string,
        @Body() cancelDto: CancelVisitDto,
        @Request() req: AuthenticatedRequest
    ): Promise<VisitResponseDto> {
        return this.patientsService.cancelVisit(id, cancelDto, req.user.id);
    }

    @Put('visits/:id/reschedule')
    @UseGuards(PermissionsGuard)
    // @RequirePermissions('visits:update')
    @ApiOperation({ summary: 'Reschedule visit' })
    @ApiResponse({ status: 200, description: 'Visit rescheduled', type: VisitResponseDto })
    rescheduleVisit(
        @Param('id') id: string,
        @Body() rescheduleDto: RescheduleVisitDto
    ): Promise<VisitResponseDto> {
        return this.patientsService.rescheduleVisit(id, rescheduleDto);
    }

    @Post('physiotherapists/availability')
    @UseGuards(PermissionsGuard)
    // @RequirePermissions('visits:read')
    @ApiOperation({ summary: 'Get available physiotherapists for a time slot' })
    @ApiResponse({ status: 200, description: 'List of available physiotherapists' })
    getAvailablePhysiotherapists(@Body() availabilityDto: PhysiotherapistAvailabilityDto): Promise<any[]> {
        return this.patientsService.getAvailablePhysiotherapists(availabilityDto);
    }

    // Note Management Endpoints
    @Post('notes')
    @UseGuards(PermissionsGuard)
    // @RequirePermissions('notes:create')
    @ApiOperation({ summary: 'Create a new note for a visit' })
    @ApiResponse({ status: 201, description: 'Note created', type: NoteResponseDto })
    createNote(
        @Body() createNoteDto: CreateNoteDto,
        @Request() req: AuthenticatedRequest
    ): Promise<NoteResponseDto> {
        return this.patientsService.createNote(createNoteDto, req.user.id);
    }

    @Get('notes/:id')
    @UseGuards(PermissionsGuard)
    // @RequirePermissions('notes:read')
    @ApiOperation({ summary: 'Get note by ID' })
    @ApiResponse({ status: 200, description: 'Note details', type: NoteResponseDto })
    findOneNote(@Param('id') id: string): Promise<NoteResponseDto> {
        return this.patientsService.findOneNote(id);
    }

    @Patch('notes/:id')
    @UseGuards(PermissionsGuard)
    // @RequirePermissions('notes:update')
    @ApiOperation({ summary: 'Update note' })
    @ApiResponse({ status: 200, description: 'Note updated', type: NoteResponseDto })
    updateNote(
        @Param('id') id: string,
        @Body() updateNoteDto: UpdateNoteDto
    ): Promise<NoteResponseDto> {
        return this.patientsService.updateNote(id, updateNoteDto);
    }

    @Post('notes/:id/sign')
    @UseGuards(PermissionsGuard)
    // @RequirePermissions('notes:sign')
    @ApiOperation({ summary: 'Sign note' })
    @ApiResponse({ status: 200, description: 'Note signed', type: NoteResponseDto })
    signNote(
        @Param('id') id: string,
        @Body() signDto: SignNoteDto,
        @Request() req: AuthenticatedRequest
    ): Promise<NoteResponseDto> {
        return this.patientsService.signNote(id, signDto, req.user.id);
    }

    // Patient-specific endpoints with :id parameter (must come after all other routes)
    @Get(':id')
    @UseGuards(PermissionsGuard)
    // @RequirePermissions('patients:read')
    @ApiOperation({ summary: 'Get patient by ID' })
    @ApiResponse({ status: 200, description: 'Patient details', type: PatientResponseDto })
    findOnePatient(@Param('id') id: string, @Request() req: AuthenticatedRequest): Promise<PatientResponseDto> {
        return this.patientsService.findOnePatient(id, req.user.id);
    }

    @Get(':id/visits')
    @UseGuards(PermissionsGuard)
    // @RequirePermissions('visits:read')
    @ApiOperation({ summary: 'Get all visits for a specific patient' })
    @ApiResponse({ status: 200, description: 'List of patient visits' })
    findPatientVisits(
        @Param('id') id: string,
        @Query() query: VisitListQueryDto,
        @Request() req: AuthenticatedRequest
    ): Promise<{ visits: VisitResponseDto[]; total: number }> {
        return this.patientsService.findPatientVisits(id, query, req.user.id);
    }

    @Get(':id/visit-history')
    @UseGuards(PermissionsGuard)
    // @RequirePermissions('visits:read')
    @ApiOperation({ summary: 'Get visit history and statistics for a patient' })
    @ApiResponse({ status: 200, description: 'Patient visit history and statistics' })
    getPatientVisitHistory(
        @Param('id') id: string,
        @Request() req: AuthenticatedRequest
    ): Promise<any> {
        return this.patientsService.getPatientVisitHistory(id, req.user.id);
    }

    @Patch(':id')
    @UseGuards(PermissionsGuard)
    // @RequirePermissions('patients:update')
    @ApiOperation({ summary: 'Update patient' })
    @ApiResponse({ status: 200, description: 'Patient updated', type: PatientResponseDto })
    updatePatient(
        @Param('id') id: string,
        @Body() updatePatientDto: UpdatePatientDto
    ): Promise<PatientResponseDto> {
        return this.patientsService.updatePatient(id, updatePatientDto);
    }

    @Delete(':id')
    @UseGuards(PermissionsGuard)
    // @RequirePermissions('patients:delete')
    @ApiOperation({ summary: 'Delete patient' })
    @ApiResponse({ status: 200, description: 'Patient deleted' })
    removePatient(@Param('id') id: string): Promise<void> {
        return this.patientsService.deletePatient(id);
    }
}