import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './event.entity';
import { User } from '../users/user.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
  ) {}

  /**
   * Récupère tous les événements avec filtres
   */
  async findAll(options?: { 
    search?: string; 
    category?: string; 
    organizationId?: string;
    userId?: string; 
  }): Promise<Event[]> {
    const query = this.eventsRepository.createQueryBuilder('event')
      .leftJoinAndSelect('event.organizer', 'organizer')
      .leftJoinAndSelect('event.organization', 'organization');

    if (options?.search) {
      query.andWhere('(event.title ILIKE :search OR event.description ILIKE :search OR event.address ILIKE :search)', { 
        search: `%${options.search}%` 
      });
    }

    if (options?.category) {
      query.andWhere('event.category = :category', { category: options.category });
    }

    if (options?.organizationId) {
      query.andWhere('organization.id = :orgId', { orgId: options.organizationId });
    }

    query.orderBy('event.startDatetime', 'ASC');
    return query.getMany();
  }

  /**
   * Recherche par proximité via PostGIS
   */
  async findNearby(lat: number, lng: number, radiusKm: number = 10): Promise<Event[]> {
    return this.eventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.organizer', 'organizer')
      .leftJoinAndSelect('event.organization', 'organization')
      .where(
        `ST_DWithin(event.location, ST_MakePoint(:lng, :lat)::geography, :radius)`,
        {
          lat,
          lng,
          radius: radiusKm * 1000,
        },
      )
      .orderBy(`ST_Distance(event.location, ST_MakePoint(:lng, :lat)::geography)`, 'ASC')
      .getMany();
  }

  /**
   * Crée un nouvel événement
   */
  async create(data: Partial<Event>): Promise<Event> {
    const event = this.eventsRepository.create(data);
    
    if (data.latitude && data.longitude) {
      event.location = { 
        type: 'Point', 
        coordinates: [data.longitude, data.latitude] 
      } as any;
    }
    
    return this.eventsRepository.save(event);
  }

  /**
   * Trouve un événement par son ID
   */
  async findOne(id: string): Promise<Event> {
    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: ['organizer', 'organization', 'participants'],
    });
    if (!event) throw new NotFoundException('Événement introuvable');
    return event;
  }

  /**
   * Met à jour un événement
   */
  async update(id: string, updateData: Partial<Event>, user: User): Promise<Event> {
    const event = await this.findOne(id);
    
    // Vérification des permissions
    if (event.organizer && event.organizer.id !== user.id && user.role !== 'admin' && user.role !== 'super-admin') {
      throw new ForbiddenException('Vous n\'avez pas la permission de modifier cet événement');
    }

    if (updateData.latitude && updateData.longitude) {
      updateData.location = { 
        type: 'Point', 
        coordinates: [updateData.longitude, updateData.latitude] 
      } as any;
    }

    await this.eventsRepository.save({ ...event, ...updateData });
    return this.findOne(id);
  }

  /**
   * Supprime un événement
   */
  async remove(id: string, user: User): Promise<void> {
    const event = await this.findOne(id);
    
    if (event.organizer && event.organizer.id !== user.id && user.role !== 'admin' && user.role !== 'super-admin') {
      throw new ForbiddenException('Vous n\'avez pas la permission de supprimer cet événement');
    }
    
    await this.eventsRepository.remove(event);
  }

  /**
   * Rejoindre un événement
   */
  async joinEvent(eventId: string, userId: string): Promise<Event> {
    const event = await this.findOne(eventId);
    
    if (!event.participants) event.participants = [];
    
    const isAlreadyParticipating = event.participants.some(u => u.id === userId);
    if (!isAlreadyParticipating) {
      const user = new User();
      user.id = userId;
      event.participants.push(user);
      return this.eventsRepository.save(event);
    }
    return event;
  }

  /**
   * Quitter un événement
   */
  async leaveEvent(eventId: string, userId: string): Promise<Event> {
    const event = await this.findOne(eventId);
    
    if (event.participants) {
      event.participants = event.participants.filter(u => u.id !== userId);
    }
    return this.eventsRepository.save(event);
  }

  /**
   * Ajouter/Retirer des favoris
   */
  async toggleFavorite(eventId: string, userId: string): Promise<{ favorited: boolean }> {
    const event = await this.eventsRepository.findOne({
      where: { id: eventId },
      relations: ['favoritedBy'],
    });
    if (!event) throw new NotFoundException('Événement introuvable');

    if (!event.favoritedBy) event.favoritedBy = [];

    const index = event.favoritedBy.findIndex(u => u.id === userId);
    let favorited = false;

    if (index === -1) {
      const user = new User();
      user.id = userId;
      event.favoritedBy.push(user);
      favorited = true;
    } else {
      event.favoritedBy.splice(index, 1);
      favorited = false;
    }

    await this.eventsRepository.save(event);
    return { favorited };
  }
}