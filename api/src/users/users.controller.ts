import { 
  Controller, 
  Get, 
  Patch, 
  Body, 
  UseGuards, 
  Request,
  Param,
  Post,
  Delete,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './enums/user-role.enum';
import { User } from './user.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@ApiTags('Utilisateurs')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Récupérer le profil de l'utilisateur actuel" })
  getMe(@Request() req: any) {
    return this.usersService.findOne(req.user.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Mettre à jour le profil de l'utilisateur actuel" })
  updateMe(@Request() req: any, @Body() updateData: Partial<User>) {
    const { id, password, role, ...safeData } = updateData as any;
    return this.usersService.updateProfile(req.user.id, safeData);
  }

  @Post('me/avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOperation({ summary: 'Télécharger un avatar utilisateur vers Cloudinary' })
  async uploadAvatar(@Request() req: any, @UploadedFile() file: Express.Multer.File) {
    const user = await this.usersService.findOne(req.user.id);
    
    // Si l'utilisateur a déjà un avatar, on le supprime de Cloudinary
    if (user.avatarUrl) {
      const publicId = this.cloudinaryService.extractPublicIdFromUrl(user.avatarUrl);
      if (publicId) await this.cloudinaryService.deleteFile(publicId);
    }

    const result = await this.cloudinaryService.uploadImage(file, 'avatars');
    await this.usersService.updateProfile(req.user.id, { avatarUrl: result.secure_url });
    return { 
      message: 'Avatar téléchargé avec succès',
      url: result.secure_url 
    };
  }

  @Delete('me/avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer l\'avatar de l\'utilisateur actuel' })
  async deleteAvatar(@Request() req: any) {
    const user = await this.usersService.findOne(req.user.id);
    if (user.avatarUrl) {
      const publicId = this.cloudinaryService.extractPublicIdFromUrl(user.avatarUrl);
      if (publicId) await this.cloudinaryService.deleteFile(publicId);
      await this.usersService.updateProfile(req.user.id, { avatarUrl: null });
    }
    return { message: 'Avatar supprimé avec succès' };
  }

  @Get('me/favorites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer les événements favoris de l\'utilisateur actuel' })
  async getFavorites(@Request() req: any) {
    const user = await this.usersService.findOne(req.user.id);
    return user.favoriteEvents;
  }

  @Get('me/participating')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer les événements auxquels l\'utilisateur participe' })
  async getParticipating(@Request() req: any) {
    const user = await this.usersService.findOne(req.user.id);
    return user.participatingEvents;
  }

  @Get('me/organized')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer les événements organisés par l\'utilisateur actuel' })
  async getOrganized(@Request() req: any) {
    const user = await this.usersService.findOne(req.user.id);
    return user.events;
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer tous les utilisateurs (Admin uniquement)' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un utilisateur par son ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un utilisateur (Admin uniquement)' })
  async create(@Body() userData: Partial<User>) {
    return this.usersService.create(userData);
  }

  @Patch(':id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Mettre à jour le rôle d'un utilisateur (Admin uniquement)",
  })
  async updateRole(@Param('id') id: string, @Body('role') role: string) {
    return this.usersService.updateRole(id, role);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer un utilisateur (Admin uniquement)' })
  async remove(@Param('id') id: string, @Body('reason') reason: string) {
    return this.usersService.remove(id, reason);
  }
}
