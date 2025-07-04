import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, ManyToOne, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Visit } from './visit.entity';
import { User } from './user.entity';

export enum NoteType {
    SOAP = 'SOAP',
    DAP = 'DAP',
    PROGRESS = 'PROGRESS'
}

interface SOAPNote {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
}

interface DAPNote {
    data: string;
    assessment: string;
    plan: string;
}

interface ProgressNote {
    progress: string;
    interventions: string;
    response: string;
    plan: string;
}

@Entity('notes')
@Index(['visit_id'], { unique: true })
export class Note {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty()
    @Column('uuid', { unique: true })
    visit_id!: string;

    @ApiProperty()
    @Column({ type: 'enum', enum: NoteType })
    note_type!: NoteType;

    @ApiProperty()
    @Column({ type: 'jsonb' })
    note_data!: SOAPNote | DAPNote | ProgressNote;

    @ApiPropertyOptional()
    @Column({ type: 'text', nullable: true })
    additional_notes?: string;

    @ApiPropertyOptional()
    @Column({ type: 'simple-array', nullable: true })
    treatment_codes?: string[];

    @ApiPropertyOptional()
    @Column({ type: 'jsonb', nullable: true })
    treatment_details?: {
        modalities?: string[];
        exercises?: string[];
        manual_therapy?: string[];
        education?: string[];
    };

    @ApiPropertyOptional()
    @Column({ type: 'jsonb', nullable: true })
    goals?: {
        short_term?: string[];
        long_term?: string[];
    };

    @ApiPropertyOptional()
    @Column({ type: 'jsonb', nullable: true })
    outcome_measures?: Record<string, any>;

    @ApiPropertyOptional()
    @Column({ type: 'simple-array', nullable: true })
    attachments?: string[];

    @ApiProperty()
    @Column({ default: false })
    is_signed!: boolean;

    @ApiPropertyOptional()
    @Column('uuid', { nullable: true })
    signed_by?: string;

    @ApiPropertyOptional()
    @Column({ type: 'timestamp', nullable: true })
    signed_at?: Date;

    @ApiProperty()
    @Column('uuid')
    created_by!: string;

    @ApiProperty()
    @CreateDateColumn()
    created_at!: Date;

    @ApiProperty()
    @UpdateDateColumn()
    updated_at!: Date;

    @OneToOne(() => Visit, visit => visit.note)
    @JoinColumn({ name: 'visit_id' })
    visit!: Visit;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by' })
    creator!: User;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'signed_by' })
    signer?: User;
}