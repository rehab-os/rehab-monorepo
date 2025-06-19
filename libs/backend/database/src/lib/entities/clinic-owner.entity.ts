import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from './user.entity';
import { Clinic } from './clinic.entity';

@Entity('clinic_owners')
@Index(['user_id', 'clinic_id'], { unique: true })
export class ClinicOwner {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ApiProperty()
    @Column('uuid')
    user_id!: string;

    @ApiProperty()
    @Column('uuid')
    clinic_id!: string;

    @ApiPropertyOptional()
    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    ownership_percentage?: number;

    @ApiProperty()
    @Column({ type: 'date' })
    effective_from!: Date;

    @ApiPropertyOptional()
    @Column({ type: 'date', nullable: true })
    effective_until?: Date;

    @ApiProperty()
    @Column({ default: false })
    is_primary_owner!: boolean;

    @ApiProperty()
    @Column({ default: true })
    is_active!: boolean;

    @ApiProperty()
    @CreateDateColumn()
    created_at!: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user?: User;

    @ManyToOne(() => Clinic)
    @JoinColumn({ name: 'clinic_id' })
    clinic?: Clinic;
}