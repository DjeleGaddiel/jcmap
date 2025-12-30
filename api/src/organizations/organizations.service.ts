import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Organization } from './organization.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/enums/user-role.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly orgRepository: Repository<Organization>,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Crée une nouvelle organisation
   */
  async create(createDto: CreateOrganizationDto, owner: User): Promise<Organization> {
    const org = this.orgRepository.create({
      ...createDto,
      owner,
    });

    if (createDto.latitude && createDto.longitude) {
      org.location = `POINT(${createDto.longitude} ${createDto.latitude})`;
    }

    return this.orgRepository.save(org);
  }

  /**
   * Récupère toutes les organisations avec recherche optionnelle
   */
  async findAll(search?: string, isVerified?: boolean): Promise<Organization[]> {
    const where: any = {};
    
    if (search) {
      where.name = ILike(`%${search}%`);
      // Note: description logic might need a separate object in where array for OR condition
      // but if we want strictly isVerified AND (name OR description), it's more complex.
      // For now, let's keep it simple.
    }
    
    if (isVerified !== undefined) {
      where.isVerified = isVerified;
    }

    if (search && Object.keys(where).length > 1) {
      // Handle the complex case where search needs to be name OR description AND isVerified
      return this.orgRepository.find({
        where: [
          { name: ILike(`%${search}%`), isVerified },
          { description: ILike(`%${search}%`), isVerified }
        ],
        relations: ['owner']
      });
    }

    return this.orgRepository.find({
      where: search ? [
        { name: ILike(`%${search}%`) },
        { description: ILike(`%${search}%`) }
      ] : where,
      relations: ['owner']
    });
  }

  /**
   * Recherche des organisations par proximité (PostGIS)
   */
  async findNearby(lat: number, lng: number, radiusKm: number = 10): Promise<Organization[]> {
    return this.orgRepository
      .createQueryBuilder('org')
      .leftJoinAndSelect('org.owner', 'owner')
      .where(
        `ST_DWithin(org.location, ST_MakePoint(:lng, :lat)::geography, :radius)`,
        {
          lat,
          lng,
          radius: radiusKm * 1000,
        },
      )
      .andWhere('org.deletedAt IS NULL')
      .orderBy(`ST_Distance(org.location, ST_MakePoint(:lng, :lat)::geography)`, 'ASC')
      .getMany();
  }

  /**
   * Récupère une seule organisation par son ID
   */
  async findOne(id: string): Promise<Organization> {
    const org = await this.orgRepository.findOne({ 
      where: { id },
      relations: ['owner', 'events'] 
    });
    if (!org) throw new NotFoundException('Organisation introuvable');
    return org;
  }

  /**
   * Met à jour une organisation
   */
  async update(id: string, updateData: Partial<Organization>, user: User): Promise<Organization> {
    const org = await this.findOne(id);
    
    // Vérification des permissions
    if (org.owner.id !== user.id && user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Vous n\'avez pas la permission de modifier cette organisation');
    }
    
    const oldVerifiedStatus = org.isVerified;
    
    const updatePayload: any = { ...updateData };
    if (updateData.latitude && updateData.longitude) {
      updatePayload.location = `POINT(${updateData.longitude} ${updateData.latitude})`;
    }

    await this.orgRepository.save({ id, ...updatePayload });
    const updatedOrg = await this.findOne(id);

    // Si l'organisation vient d'être vérifiée, mettre à jour le rôle du propriétaire
    if (!oldVerifiedStatus && updatedOrg.isVerified && updatedOrg.owner) {
      if (updatedOrg.owner.role === UserRole.USER) {
        await this.usersService.updateProfile(updatedOrg.owner.id, { 
          role: UserRole.ORGANIZER 
        });
      }
    }

    return updatedOrg;
  }

  /**
   * Supprime une organisation
   */
  async remove(id: string, user: User, reason?: string): Promise<void> {
    const org = await this.findOne(id);
    if (org.owner.id !== user.id && user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Vous n\'avez pas la permission de supprimer cette organisation');
    }

    if (
      (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) &&
      !reason
    ) {
      throw new ForbiddenException(
        'Le motif de suppression est obligatoire pour les administrateurs',
      );
    }

    await this.orgRepository.softRemove(org);

    // Notifier le propriétaire si supprimé par un admin
    if (org.owner && user.id !== org.owner.id) {
      await this.notificationsService.create({
        userId: org.owner.id,
        title: 'Organisation supprimée',
        message: `Votre organisation "${org.name}" a été supprimée par l'administration. Motif : ${reason}`,
        type: NotificationType.SYSTEM,
      });
    }
  }

  /**
   * Récupère les membres d'une organisation
   */
  async getMembers(id: string): Promise<User[]> {
    const org = await this.orgRepository.findOne({
      where: { id },
      relations: ['members'],
    });
    if (!org) throw new NotFoundException('Organisation introuvable');
    return org.members;
  }
}
