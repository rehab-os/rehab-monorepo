import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, ILike } from 'typeorm';
import { Patient, Visit, Note, UserClinicRole, PatientStatus, VisitStatus, VisitType, ClinicRole } from '@rehab/database';
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
    SignNoteDto
} from '@rehab/common';

@Injectable()
export class PatientsService {
    constructor(
        @InjectRepository(Patient)
        private patientRepository: Repository<Patient>,
        @InjectRepository(Visit)
        private visitRepository: Repository<Visit>,
        @InjectRepository(Note)
        private noteRepository: Repository<Note>,
        @InjectRepository(UserClinicRole)
        private userClinicRoleRepository: Repository<UserClinicRole>,
    ) { }

    // Patient CRUD Operations
    async createPatient(createPatientDto: CreatePatientDto, createdBy: string): Promise<PatientResponseDto> {
        // Check if patient with same phone already exists
        const existing = await this.patientRepository.findOne({
            where: { phone: createPatientDto.phone }
        });

        if (existing) {
            throw new ConflictException('Patient with this phone number already exists');
        }

        // Generate patient code
        const patientCount = await this.patientRepository.count({
            where: { clinic_id: createPatientDto.clinic_id }
        });
        const patientCode = `P${createPatientDto.clinic_id.substring(0, 4).toUpperCase()}-${String(patientCount + 1).padStart(5, '0')}`;

        const patient = this.patientRepository.create({
            ...createPatientDto,
            patient_code: patientCode,
            created_by: createdBy,
        });

        const saved = await this.patientRepository.save(patient);
        return this.toPatientResponseDto(saved);
    }

    async findAllPatients(query: PatientListQueryDto): Promise<{ patients: PatientResponseDto[]; total: number }> {
        const qb = this.patientRepository.createQueryBuilder('patient');

        if (query.clinic_id) {
            qb.andWhere('patient.clinic_id = :clinicId', { clinicId: query.clinic_id });
        }

        if (query.status) {
            qb.andWhere('patient.status = :status', { status: query.status });
        }

        if (query.search) {
            qb.andWhere(
                '(patient.full_name ILIKE :search OR patient.phone LIKE :search OR patient.patient_code LIKE :search)',
                { search: `%${query.search}%` }
            );
        }

        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;

        qb.leftJoinAndSelect('patient.clinic', 'clinic')
            .leftJoinAndSelect('patient.creator', 'creator')
            .skip(skip)
            .take(limit)
            .orderBy('patient.created_at', 'DESC');

        const [patients, total] = await qb.getManyAndCount();

        return {
            patients: patients.map(patient => this.toPatientResponseDto(patient)),
            total,
        };
    }

    async findOnePatient(id: string, userId?: string): Promise<PatientResponseDto> {
        const patient = await this.patientRepository.findOne({
            where: { id },
            relations: ['clinic', 'creator', 'referrer', 'visits']
        });

        if (!patient) {
            throw new NotFoundException('Patient not found');
        }

        // If userId is provided, check access
        if (userId) {
            const userClinics = await this.userClinicRoleRepository.find({
                where: { user_id: userId },
                select: ['clinic_id']
            });
            const clinicIds = userClinics.map(uc => uc.clinic_id);

            if (!clinicIds.includes(patient.clinic_id)) {
                throw new NotFoundException('Patient not found');
            }
        }

        return this.toPatientResponseDto(patient);
    }

    async findPatientVisits(patientId: string, query: VisitListQueryDto, userId: string): Promise<{ visits: VisitResponseDto[]; total: number }> {
        // First verify patient access
        const patient = await this.findOnePatient(patientId, userId);
        
        // Then get visits with patient_id filter
        const visitQuery = {
            ...query,
            patient_id: patientId,
            clinic_id: patient.clinic_id // Ensure we only get visits from the same clinic
        };
        
        return this.findAllVisits(visitQuery);
    }

    async getPatientVisitHistory(patientId: string, userId: string): Promise<any> {
        try {
            // Verify patient access
            const patient = await this.findOnePatient(patientId, userId);
            
            // Get all visits for this patient
            const visits = await this.visitRepository.find({
                where: { 
                    patient_id: patientId,
                    clinic_id: patient.clinic_id 
                },
                relations: ['physiotherapist', 'note'],
                order: { scheduled_date: 'DESC', scheduled_time: 'DESC' }
            });

            // Calculate statistics
            const totalVisits = visits.length;
            const completedVisits = visits.filter(v => v.status === VisitStatus.COMPLETED).length;
            const cancelledVisits = visits.filter(v => v.status === VisitStatus.CANCELLED).length;
            const upcomingVisits = visits.filter(v => v.status === VisitStatus.SCHEDULED).length;
            const notesCount = visits.filter(v => v.note).length;

            // Group visits by month for history
            const visitsByMonth = visits.reduce((acc, visit) => {
                try {
                    // Convert scheduled_date to Date object if it's a string
                    const visitDate = visit.scheduled_date instanceof Date 
                        ? visit.scheduled_date 
                        : new Date(visit.scheduled_date);
                    
                    // Check if date is valid
                    if (isNaN(visitDate.getTime())) {
                        console.error('Invalid date for visit:', visit.id, visit.scheduled_date);
                        return acc;
                    }
                    
                    const monthKey = `${visitDate.getFullYear()}-${String(visitDate.getMonth() + 1).padStart(2, '0')}`;
                    if (!acc[monthKey]) {
                        acc[monthKey] = {
                            month: monthKey,
                            count: 0,
                            completed: 0,
                            cancelled: 0
                        };
                    }
                    acc[monthKey].count++;
                    if (visit.status === VisitStatus.COMPLETED) acc[monthKey].completed++;
                    if (visit.status === VisitStatus.CANCELLED) acc[monthKey].cancelled++;
                } catch (error) {
                    console.error('Error processing visit date:', visit.id, error);
                }
                return acc;
            }, {} as Record<string, any>);

            // Calculate attendance rate safely
            const pastVisits = totalVisits - upcomingVisits;
            const attendanceRate = pastVisits > 0 ? ((completedVisits / pastVisits) * 100).toFixed(1) : '0';

            return {
                patient: this.toPatientResponseDto(patient),
                statistics: {
                    totalVisits,
                    completedVisits,
                    cancelledVisits,
                    upcomingVisits,
                    notesCount,
                    attendanceRate
                },
                visitsByMonth: Object.values(visitsByMonth).sort((a, b) => b.month.localeCompare(a.month)),
                recentVisits: visits.slice(0, 10).map(v => this.toVisitResponseDto(v))
            };
        } catch (error) {
            console.error('Error in getPatientVisitHistory:', error);
            throw error;
        }
    }

    async updatePatient(id: string, updatePatientDto: UpdatePatientDto): Promise<PatientResponseDto> {
        const patient = await this.patientRepository.findOne({ where: { id } });

        if (!patient) {
            throw new NotFoundException('Patient not found');
        }

        Object.assign(patient, updatePatientDto);
        const saved = await this.patientRepository.save(patient);
        return this.toPatientResponseDto(saved);
    }

    async deletePatient(id: string): Promise<void> {
        const patient = await this.patientRepository.findOne({ where: { id } });

        if (!patient) {
            throw new NotFoundException('Patient not found');
        }

        // Soft delete - just mark as inactive
        patient.status = PatientStatus.INACTIVE;
        await this.patientRepository.save(patient);
    }

    // Visit Management
    async createVisit(createVisitDto: CreateVisitDto, createdBy: string): Promise<VisitResponseDto> {
        // Validate patient exists
        const patient = await this.patientRepository.findOne({
            where: { id: createVisitDto.patient_id }
        });

        if (!patient) {
            throw new NotFoundException('Patient not found');
        }

        // Check if physiotherapist is available at the requested time
        const isAvailable = await this.checkPhysiotherapistAvailability(
            createVisitDto.physiotherapist_id,
            createVisitDto.clinic_id,
            createVisitDto.scheduled_date,
            createVisitDto.scheduled_time,
            createVisitDto.duration_minutes || 30
        );

        if (!isAvailable) {
            throw new ConflictException('Physiotherapist is not available at the requested time');
        }

        const visit = this.visitRepository.create({
            ...createVisitDto,
            duration_minutes: createVisitDto.duration_minutes || 30,
            created_by: createdBy,
        });

        const saved = await this.visitRepository.save(visit);
        return this.toVisitResponseDto(saved);
    }

    async findAllVisits(query: VisitListQueryDto): Promise<{ visits: VisitResponseDto[]; total: number }> {
        const qb = this.visitRepository.createQueryBuilder('visit');

        if (query.clinic_id) {
            qb.andWhere('visit.clinic_id = :clinicId', { clinicId: query.clinic_id });
        }

        if (query.patient_id) {
            qb.andWhere('visit.patient_id = :patientId', { patientId: query.patient_id });
        }

        if (query.physiotherapist_id) {
            qb.andWhere('visit.physiotherapist_id = :physiotherapistId', { physiotherapistId: query.physiotherapist_id });
        }

        if (query.status) {
            qb.andWhere('visit.status = :status', { status: query.status });
        }

        if (query.visit_type) {
            qb.andWhere('visit.visit_type = :visitType', { visitType: query.visit_type });
        }

        if (query.date_from && query.date_to) {
            qb.andWhere('visit.scheduled_date BETWEEN :dateFrom AND :dateTo', {
                dateFrom: query.date_from,
                dateTo: query.date_to
            });
        }

        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;

        qb.leftJoinAndSelect('visit.patient', 'patient')
            .leftJoinAndSelect('visit.clinic', 'clinic')
            .leftJoinAndSelect('visit.physiotherapist', 'physiotherapist')
            .leftJoinAndSelect('visit.note', 'note')
            .skip(skip)
            .take(limit)
            .orderBy('visit.scheduled_date', 'DESC')
            .addOrderBy('visit.scheduled_time', 'DESC');

        const [visits, total] = await qb.getManyAndCount();

        return {
            visits: visits.map(visit => this.toVisitResponseDto(visit)),
            total,
        };
    }

    async findOneVisit(id: string): Promise<VisitResponseDto> {
        const visit = await this.visitRepository.findOne({
            where: { id },
            relations: ['patient', 'clinic', 'physiotherapist', 'note']
        });

        if (!visit) {
            throw new NotFoundException('Visit not found');
        }

        return this.toVisitResponseDto(visit);
    }

    async updateVisit(id: string, updateVisitDto: UpdateVisitDto): Promise<VisitResponseDto> {
        const visit = await this.visitRepository.findOne({ where: { id } });

        if (!visit) {
            throw new NotFoundException('Visit not found');
        }

        // If rescheduling, check availability
        if (updateVisitDto.scheduled_date || updateVisitDto.scheduled_time) {
            const isAvailable = await this.checkPhysiotherapistAvailability(
                updateVisitDto.physiotherapist_id || visit.physiotherapist_id,
                visit.clinic_id,
                updateVisitDto.scheduled_date || visit.scheduled_date.toString(),
                updateVisitDto.scheduled_time || visit.scheduled_time,
                updateVisitDto.duration_minutes || visit.duration_minutes,
                id // Exclude current visit from check
            );

            if (!isAvailable) {
                throw new ConflictException('Physiotherapist is not available at the requested time');
            }
        }

        Object.assign(visit, updateVisitDto);
        const saved = await this.visitRepository.save(visit);
        return this.toVisitResponseDto(saved);
    }

    async checkInVisit(id: string, checkInDto: CheckInVisitDto): Promise<VisitResponseDto> {
        const visit = await this.visitRepository.findOne({ where: { id } });

        if (!visit) {
            throw new NotFoundException('Visit not found');
        }

        if (visit.status !== VisitStatus.SCHEDULED) {
            throw new BadRequestException('Visit is not in scheduled status');
        }

        visit.check_in_time = new Date();
        if (checkInDto.vital_signs) {
            visit.vital_signs = checkInDto.vital_signs;
        }

        const saved = await this.visitRepository.save(visit);
        return this.toVisitResponseDto(saved);
    }

    async startVisit(id: string, startDto: StartVisitDto): Promise<VisitResponseDto> {
        const visit = await this.visitRepository.findOne({ where: { id } });

        if (!visit) {
            throw new NotFoundException('Visit not found');
        }

        if (!visit.check_in_time) {
            throw new BadRequestException('Patient must check in before starting visit');
        }

        visit.status = VisitStatus.IN_PROGRESS;
        visit.start_time = new Date();
        if (startDto.vital_signs) {
            visit.vital_signs = { ...visit.vital_signs, ...startDto.vital_signs };
        }

        const saved = await this.visitRepository.save(visit);
        return this.toVisitResponseDto(saved);
    }

    async completeVisit(id: string): Promise<VisitResponseDto> {
        const visit = await this.visitRepository.findOne({ where: { id } });

        if (!visit) {
            throw new NotFoundException('Visit not found');
        }

        if (visit.status !== VisitStatus.IN_PROGRESS) {
            throw new BadRequestException('Visit must be in progress to complete');
        }

        visit.status = VisitStatus.COMPLETED;
        visit.end_time = new Date();

        const saved = await this.visitRepository.save(visit);
        return this.toVisitResponseDto(saved);
    }

    async cancelVisit(id: string, cancelDto: CancelVisitDto, cancelledBy: string): Promise<VisitResponseDto> {
        const visit = await this.visitRepository.findOne({ where: { id } });

        if (!visit) {
            throw new NotFoundException('Visit not found');
        }

        if (visit.status === VisitStatus.COMPLETED) {
            throw new BadRequestException('Cannot cancel a completed visit');
        }

        visit.status = VisitStatus.CANCELLED;
        visit.cancellation_reason = cancelDto.cancellation_reason;
        visit.cancelled_by = cancelledBy;
        visit.cancelled_at = new Date();

        const saved = await this.visitRepository.save(visit);
        return this.toVisitResponseDto(saved);
    }

    async rescheduleVisit(id: string, rescheduleDto: RescheduleVisitDto): Promise<VisitResponseDto> {
        const visit = await this.visitRepository.findOne({ where: { id } });

        if (!visit) {
            throw new NotFoundException('Visit not found');
        }

        if (visit.status === VisitStatus.COMPLETED || visit.status === VisitStatus.CANCELLED) {
            throw new BadRequestException('Cannot reschedule a completed or cancelled visit');
        }

        const isAvailable = await this.checkPhysiotherapistAvailability(
            visit.physiotherapist_id,
            visit.clinic_id,
            rescheduleDto.scheduled_date,
            rescheduleDto.scheduled_time,
            rescheduleDto.duration_minutes || visit.duration_minutes,
            id
        );

        if (!isAvailable) {
            throw new ConflictException('Physiotherapist is not available at the requested time');
        }

        visit.scheduled_date = new Date(rescheduleDto.scheduled_date);
        visit.scheduled_time = rescheduleDto.scheduled_time;
        if (rescheduleDto.duration_minutes) {
            visit.duration_minutes = rescheduleDto.duration_minutes;
        }

        const saved = await this.visitRepository.save(visit);
        return this.toVisitResponseDto(saved);
    }

    async getAvailablePhysiotherapists(availabilityDto: PhysiotherapistAvailabilityDto): Promise<any[]> {
        // Get all physiotherapists in the clinic
        const physiotherapists = await this.userClinicRoleRepository.find({
            where: {
                clinic_id: availabilityDto.clinic_id,
                role: ClinicRole.PHYSIOTHERAPIST
            },
            relations: ['user']
        });

        const availablePhysiotherapists = [];

        for (const physio of physiotherapists) {
            const isAvailable = await this.checkPhysiotherapistAvailability(
                physio.user_id,
                availabilityDto.clinic_id,
                availabilityDto.date,
                availabilityDto.time,
                availabilityDto.duration_minutes || 30
            );

            if (isAvailable) {
                availablePhysiotherapists.push({
                    id: physio.user_id,
                    name: physio.user.full_name,
                    is_admin: physio.is_admin
                });
            }
        }

        return availablePhysiotherapists;
    }

    // Note Management
    async createNote(createNoteDto: CreateNoteDto, createdBy: string): Promise<NoteResponseDto> {
        // Check if visit exists and doesn't already have a note
        const visit = await this.visitRepository.findOne({
            where: { id: createNoteDto.visit_id },
            relations: ['note', 'patient', 'clinic']
        });

        if (!visit) {
            throw new NotFoundException('Visit not found');
        }

        // Verify user has access to this clinic
        const userClinicRole = await this.userClinicRoleRepository.findOne({
            where: { 
                user_id: createdBy,
                clinic_id: visit.clinic_id
            }
        });

        if (!userClinicRole) {
            throw new NotFoundException('Visit not found');
        }

        if (visit.note) {
            throw new ConflictException('Visit already has a note');
        }

        const note = this.noteRepository.create({
            ...createNoteDto,
            created_by: createdBy,
        });

        const saved = await this.noteRepository.save(note);
        return this.toNoteResponseDto(saved);
    }

    async updateNote(id: string, updateNoteDto: UpdateNoteDto): Promise<NoteResponseDto> {
        const note = await this.noteRepository.findOne({ where: { id } });

        if (!note) {
            throw new NotFoundException('Note not found');
        }

        if (note.is_signed) {
            throw new BadRequestException('Cannot update a signed note');
        }

        Object.assign(note, updateNoteDto);
        const saved = await this.noteRepository.save(note);
        return this.toNoteResponseDto(saved);
    }

    async signNote(id: string, signDto: SignNoteDto, signedBy: string): Promise<NoteResponseDto> {
        const note = await this.noteRepository.findOne({ where: { id } });

        if (!note) {
            throw new NotFoundException('Note not found');
        }

        if (note.is_signed) {
            throw new BadRequestException('Note is already signed');
        }

        note.is_signed = signDto.is_signed;
        note.signed_by = signedBy;
        note.signed_at = new Date();

        const saved = await this.noteRepository.save(note);
        return this.toNoteResponseDto(saved);
    }

    async findOneNote(id: string): Promise<NoteResponseDto> {
        const note = await this.noteRepository.findOne({
            where: { id },
            relations: ['visit', 'creator', 'signer']
        });

        if (!note) {
            throw new NotFoundException('Note not found');
        }

        return this.toNoteResponseDto(note);
    }

    // Helper Methods
    private async checkPhysiotherapistAvailability(
        physiotherapistId: string,
        clinicId: string,
        date: string,
        time: string,
        durationMinutes: number,
        excludeVisitId?: string
    ): Promise<boolean> {
        const scheduledDate = new Date(date);
        const [hours, minutes] = time.split(':').map(Number);
        const startTime = new Date(scheduledDate);
        startTime.setHours(hours, minutes, 0, 0);
        const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

        const qb = this.visitRepository.createQueryBuilder('visit')
            .where('visit.physiotherapist_id = :physiotherapistId', { physiotherapistId })
            .andWhere('visit.clinic_id = :clinicId', { clinicId })
            .andWhere('visit.scheduled_date = :date', { date: scheduledDate })
            .andWhere('visit.status NOT IN (:...statuses)', { statuses: [VisitStatus.CANCELLED, VisitStatus.NO_SHOW] });

        if (excludeVisitId) {
            qb.andWhere('visit.id != :excludeId', { excludeId: excludeVisitId });
        }

        const visits = await qb.getMany();

        for (const visit of visits) {
            const [visitHours, visitMinutes] = visit.scheduled_time.split(':').map(Number);
            const visitStartTime = new Date(visit.scheduled_date);
            visitStartTime.setHours(visitHours, visitMinutes, 0, 0);
            const visitEndTime = new Date(visitStartTime.getTime() + visit.duration_minutes * 60000);

            // Check for overlap
            if (
                (startTime >= visitStartTime && startTime < visitEndTime) ||
                (endTime > visitStartTime && endTime <= visitEndTime) ||
                (startTime <= visitStartTime && endTime >= visitEndTime)
            ) {
                return false;
            }
        }

        return true;
    }

    private toPatientResponseDto(patient: Patient): PatientResponseDto {
        return {
            id: patient.id,
            clinic_id: patient.clinic_id,
            patient_code: patient.patient_code,
            full_name: patient.full_name,
            phone: patient.phone,
            email: patient.email,
            date_of_birth: patient.date_of_birth,
            gender: patient.gender,
            address: patient.address,
            emergency_contact_name: patient.emergency_contact_name,
            emergency_contact_phone: patient.emergency_contact_phone,
            medical_history: patient.medical_history,
            allergies: patient.allergies,
            current_medications: patient.current_medications,
            status: patient.status,
            referred_by: patient.referred_by,
            insurance_provider: patient.insurance_provider,
            insurance_policy_number: patient.insurance_policy_number,
            created_by: patient.created_by,
            created_at: patient.created_at,
            updated_at: patient.updated_at,
            clinic: patient.clinic,
            creator: patient.creator,
            referrer: patient.referrer,
            visits: patient.visits
        };
    }

    private toVisitResponseDto(visit: Visit): VisitResponseDto {
        return {
            id: visit.id,
            patient_id: visit.patient_id,
            clinic_id: visit.clinic_id,
            physiotherapist_id: visit.physiotherapist_id,
            visit_type: visit.visit_type,
            scheduled_date: visit.scheduled_date instanceof Date ? visit.scheduled_date : new Date(visit.scheduled_date),
            scheduled_time: visit.scheduled_time,
            duration_minutes: visit.duration_minutes,
            status: visit.status,
            chief_complaint: visit.chief_complaint,
            check_in_time: visit.check_in_time,
            start_time: visit.start_time,
            end_time: visit.end_time,
            cancellation_reason: visit.cancellation_reason,
            cancelled_by: visit.cancelled_by,
            cancelled_at: visit.cancelled_at,
            parent_visit_id: visit.parent_visit_id,
            vital_signs: visit.vital_signs,
            created_by: visit.created_by,
            created_at: visit.created_at,
            updated_at: visit.updated_at,
            patient: visit.patient,
            clinic: visit.clinic,
            physiotherapist: visit.physiotherapist,
            note: visit.note
        };
    }

    private toNoteResponseDto(note: Note): NoteResponseDto {
        return {
            id: note.id,
            visit_id: note.visit_id,
            note_type: note.note_type,
            note_data: note.note_data,
            additional_notes: note.additional_notes,
            treatment_codes: note.treatment_codes,
            treatment_details: note.treatment_details,
            goals: note.goals,
            outcome_measures: note.outcome_measures,
            attachments: note.attachments,
            is_signed: note.is_signed,
            signed_by: note.signed_by,
            signed_at: note.signed_at,
            created_by: note.created_by,
            created_at: note.created_at,
            updated_at: note.updated_at,
            visit: note.visit,
            creator: note.creator,
            signer: note.signer
        };
    }
}