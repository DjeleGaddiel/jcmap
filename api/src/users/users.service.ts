import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Trouve un utilisateur par son ID
   */
  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: [
        'events',
        'participatingEvents',
        'favoriteEvents',
        'homeChurch',
      ],
    });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return user;
  }

  /**
   * Met à jour le profil d'un utilisateur
   */
  async updateProfile(id: string, updateData: Partial<User>): Promise<User> {
    await this.userRepository.save({ id, ...updateData });
    return this.findOne(id);
  }

  /**
   * Récupère tous les utilisateurs
   */
  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['homeChurch']
    });
  }

  /**
   * Crée un nouvel utilisateur (utilisé par les admins)
   */
  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  /**
   * Met à jour le rôle d'un utilisateur
   */
  async updateRole(id: string, role: string): Promise<User> {
    await this.userRepository.update(id, { role: role as any });
    return this.findOne(id);
  }

  /**
   * Supprime un utilisateur (Soft Delete)
   */
  async remove(id: string, reason?: string): Promise<void> {
    const user = await this.findOne(id);
    // Logique optionnelle: enregistrer le motif quelque part ou envoyer une notification
    console.log(`Suppression de l'utilisateur ${id}. Motif: ${reason || 'Non spécifié'}`);
    await this.userRepository.softRemove(user);
  }
}
