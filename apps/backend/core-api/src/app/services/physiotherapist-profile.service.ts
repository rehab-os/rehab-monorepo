import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  PhysiotherapistProfile,
  PhysiotherapistEducation,
  PhysiotherapistTechnique,
  PhysiotherapistMachine,
  PhysiotherapistWorkshop,
  User
} from '@rehab/database';
import {
  CreatePhysiotherapistProfileDto,
  UpdatePhysiotherapistProfileDto,
  CompletePhysiotherapistProfileDto,
  CreateEducationDto,
  CreateTechniqueDto,
  CreateMachineDto,
  CreateWorkshopDto
} from '@rehab/common';

@Injectable()
export class PhysiotherapistProfileService {
  constructor(
    @InjectRepository(PhysiotherapistProfile)
    private profileRepository: Repository<PhysiotherapistProfile>,
    @InjectRepository(PhysiotherapistEducation)
    private educationRepository: Repository<PhysiotherapistEducation>,
    @InjectRepository(PhysiotherapistTechnique)
    private techniqueRepository: Repository<PhysiotherapistTechnique>,
    @InjectRepository(PhysiotherapistMachine)
    private machineRepository: Repository<PhysiotherapistMachine>,
    @InjectRepository(PhysiotherapistWorkshop)
    private workshopRepository: Repository<PhysiotherapistWorkshop>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource
  ) {}

  async createProfile(userId: string, createProfileDto: CreatePhysiotherapistProfileDto): Promise<PhysiotherapistProfile> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingProfile = await this.profileRepository.findOne({ where: { user_id: userId } });
    if (existingProfile) {
      // Update existing profile instead of throwing error
      Object.assign(existingProfile, createProfileDto);
      return await this.profileRepository.save(existingProfile);
    }

    const profile = this.profileRepository.create({
      ...createProfileDto,
      user_id: userId,
      is_profile_complete: false
    });

    return await this.profileRepository.save(profile);
  }

  async updateProfile(userId: string, updateProfileDto: UpdatePhysiotherapistProfileDto): Promise<PhysiotherapistProfile> {
    const profile = await this.profileRepository.findOne({ where: { user_id: userId } });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    Object.assign(profile, updateProfileDto);
    
    if (updateProfileDto.is_profile_complete) {
      profile.profile_completed_at = new Date();
    }

    return await this.profileRepository.save(profile);
  }

  async createOrUpdateProfile(userId: string, profileDto: CreatePhysiotherapistProfileDto): Promise<PhysiotherapistProfile> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingProfile = await this.profileRepository.findOne({ where: { user_id: userId } });
    
    if (existingProfile) {
      // Update existing profile
      Object.assign(existingProfile, profileDto);
      return await this.profileRepository.save(existingProfile);
    } else {
      // Create new profile
      const profile = this.profileRepository.create({
        ...profileDto,
        user_id: userId,
        is_profile_complete: false
      });
      return await this.profileRepository.save(profile);
    }
  }

  async getProfile(userId: string): Promise<PhysiotherapistProfile | null> {
    return await this.profileRepository.findOne({
      where: { user_id: userId },
      relations: ['user', 'educations', 'techniques', 'machines', 'workshops']
    });
  }

  async getProfileById(profileId: string): Promise<PhysiotherapistProfile | null> {
    return await this.profileRepository.findOne({
      where: { id: profileId },
      relations: ['user', 'educations', 'techniques', 'machines', 'workshops']
    });
  }

  async createCompleteProfile(userId: string, completeProfileDto: CompletePhysiotherapistProfileDto): Promise<PhysiotherapistProfile> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, { where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const existingProfile = await queryRunner.manager.findOne(PhysiotherapistProfile, { where: { user_id: userId } });
      if (existingProfile) {
        throw new ConflictException('Profile already exists for this user');
      }

      const profile = queryRunner.manager.create(PhysiotherapistProfile, {
        ...completeProfileDto.profile,
        user_id: userId,
        is_profile_complete: true,
        profile_completed_at: new Date()
      });

      const savedProfile = await queryRunner.manager.save(profile);

      if (completeProfileDto.educations && completeProfileDto.educations.length > 0) {
        const educations = completeProfileDto.educations.map(edu => 
          queryRunner.manager.create(PhysiotherapistEducation, {
            ...edu,
            profile_id: savedProfile.id
          })
        );
        await queryRunner.manager.save(educations);
      }

      if (completeProfileDto.techniques && completeProfileDto.techniques.length > 0) {
        const techniques = completeProfileDto.techniques.map(tech => 
          queryRunner.manager.create(PhysiotherapistTechnique, {
            ...tech,
            profile_id: savedProfile.id
          })
        );
        await queryRunner.manager.save(techniques);
      }

      if (completeProfileDto.machines && completeProfileDto.machines.length > 0) {
        const machines = completeProfileDto.machines.map(machine => 
          queryRunner.manager.create(PhysiotherapistMachine, {
            ...machine,
            profile_id: savedProfile.id
          })
        );
        await queryRunner.manager.save(machines);
      }

      if (completeProfileDto.workshops && completeProfileDto.workshops.length > 0) {
        const workshops = completeProfileDto.workshops.map(workshop => 
          queryRunner.manager.create(PhysiotherapistWorkshop, {
            ...workshop,
            profile_id: savedProfile.id
          })
        );
        await queryRunner.manager.save(workshops);
      }

      await queryRunner.commitTransaction();

      return await this.getProfile(userId) as PhysiotherapistProfile;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async addEducation(userId: string, createEducationDto: CreateEducationDto): Promise<PhysiotherapistEducation> {
    const profile = await this.profileRepository.findOne({ where: { user_id: userId } });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const education = this.educationRepository.create({
      ...createEducationDto,
      profile_id: profile.id
    });

    return await this.educationRepository.save(education);
  }

  async addTechnique(userId: string, createTechniqueDto: CreateTechniqueDto): Promise<PhysiotherapistTechnique> {
    const profile = await this.profileRepository.findOne({ where: { user_id: userId } });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const technique = this.techniqueRepository.create({
      ...createTechniqueDto,
      profile_id: profile.id
    });

    return await this.techniqueRepository.save(technique);
  }

  async addMachine(userId: string, createMachineDto: CreateMachineDto): Promise<PhysiotherapistMachine> {
    const profile = await this.profileRepository.findOne({ where: { user_id: userId } });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const machine = this.machineRepository.create({
      ...createMachineDto,
      profile_id: profile.id
    });

    return await this.machineRepository.save(machine);
  }

  async addWorkshop(userId: string, createWorkshopDto: CreateWorkshopDto): Promise<PhysiotherapistWorkshop> {
    const profile = await this.profileRepository.findOne({ where: { user_id: userId } });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const workshop = this.workshopRepository.create({
      ...createWorkshopDto,
      profile_id: profile.id
    });

    return await this.workshopRepository.save(workshop);
  }

  async deleteEducation(userId: string, educationId: string): Promise<void> {
    const profile = await this.profileRepository.findOne({ where: { user_id: userId } });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const education = await this.educationRepository.findOne({ 
      where: { id: educationId, profile_id: profile.id } 
    });
    if (!education) {
      throw new NotFoundException('Education not found');
    }

    await this.educationRepository.remove(education);
  }

  async deleteTechnique(userId: string, techniqueId: string): Promise<void> {
    const profile = await this.profileRepository.findOne({ where: { user_id: userId } });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const technique = await this.techniqueRepository.findOne({ 
      where: { id: techniqueId, profile_id: profile.id } 
    });
    if (!technique) {
      throw new NotFoundException('Technique not found');
    }

    await this.techniqueRepository.remove(technique);
  }

  async deleteMachine(userId: string, machineId: string): Promise<void> {
    const profile = await this.profileRepository.findOne({ where: { user_id: userId } });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const machine = await this.machineRepository.findOne({ 
      where: { id: machineId, profile_id: profile.id } 
    });
    if (!machine) {
      throw new NotFoundException('Machine not found');
    }

    await this.machineRepository.remove(machine);
  }

  async deleteWorkshop(userId: string, workshopId: string): Promise<void> {
    const profile = await this.profileRepository.findOne({ where: { user_id: userId } });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const workshop = await this.workshopRepository.findOne({ 
      where: { id: workshopId, profile_id: profile.id } 
    });
    if (!workshop) {
      throw new NotFoundException('Workshop not found');
    }

    await this.workshopRepository.remove(workshop);
  }
}