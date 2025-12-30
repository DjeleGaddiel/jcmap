import { 
  Controller, 
  Get, 
  Post, 
  Patch,
  Body, 
  Param, 
  Delete, 
  UseGuards, 
  Request, 
  Query,
  UploadedFile,
  UseInterceptors
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiConsumes, ApiBody } from "@nestjs/swagger";
import { FileInterceptor } from '@nestjs/platform-express';
import { EventsService } from "./events.service";
import { Event } from "./event.entity";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../users/enums/user-role.enum";
import { CloudinaryService } from "../cloudinary/cloudinary.service";

@ApiTags('Événements')
@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les événements avec filtres optionnels' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Recherche par nom, description ou adresse' })
  @ApiQuery({ name: 'category', required: false, type: String, description: 'Filtrer par catégorie' })
  @ApiQuery({ name: 'organizationId', required: false, type: String, description: 'Filtrer par organisation' })
  findAll(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('organizationId') organizationId?: string,
  ): Promise<Event[]> {
    return this.eventsService.findAll({ search, category, organizationId });
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Rechercher des événements par proximité (PostGIS)' })
  @ApiQuery({ name: 'lat', type: Number, description: 'Latitude' })
  @ApiQuery({ name: 'lng', type: Number, description: 'Longitude' })
  @ApiQuery({ name: 'radius', required: false, type: Number, description: 'Rayon en km (défaut: 10)' })
  findNearby(@Query('lat') lat: string, @Query('lng') lng: string, @Query('radius') radius?: string): Promise<Event[]> {
    return this.eventsService.findNearby(parseFloat(lat), parseFloat(lng), parseFloat(radius || '10'));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un événement par son ID' })
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un nouvel événement' })
  create(@Body() eventData: Partial<Event>, @Request() req: any) {
    const data = {
      ...eventData,
      organizer: req.user,
    };
    return this.eventsService.create(data);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour les détails d\'un événement' })
  update(@Param('id') id: string, @Body() updateData: Partial<Event>, @Request() req: any) {
    return this.eventsService.update(id, updateData, req.user);
  }

  @Post(':id/image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
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
  @ApiOperation({ summary: 'Télécharger une image d\'événement vers Cloudinary' })
  async uploadImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Request() req: any) {
    const event = await this.eventsService.findOne(id);
    
    // Supprimer l'ancienne image si elle existe
    if (event && event.imageUrl) {
      const publicId = this.cloudinaryService.extractPublicIdFromUrl(event.imageUrl);
      if (publicId) await this.cloudinaryService.deleteFile(publicId);
    }

    const result = await this.cloudinaryService.uploadImage(file, 'events');
    return this.eventsService.update(id, { imageUrl: result.secure_url }, req.user);
  }

  @Delete(':id/image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer l\'image d\'un événement' })
  async deleteImage(@Param('id') id: string, @Request() req: any) {
    const event = await this.eventsService.findOne(id);
    if (event && event.imageUrl) {
      const publicId = this.cloudinaryService.extractPublicIdFromUrl(event.imageUrl);
      if (publicId) await this.cloudinaryService.deleteFile(publicId);
      await this.eventsService.update(id, { imageUrl: null }, req.user);
    }
    return { message: 'Image supprimée avec succès' };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer un événement' })
  async remove(@Param('id') id: string, @Request() req: any) {
    const event = await this.eventsService.findOne(id);
    
    // Supprimer l'image associée de Cloudinary avant de supprimer l'événement
    if (event && event.imageUrl) {
      const publicId = this.cloudinaryService.extractPublicIdFromUrl(event.imageUrl);
      if (publicId) await this.cloudinaryService.deleteFile(publicId);
    }

    return this.eventsService.remove(id, req.user);
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Participer à un événement (RSVP)' })
  join(@Param('id') id: string, @Request() req: any) {
    return this.eventsService.joinEvent(id, req.user.id);
  }

  @Post(':id/leave')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Quitter un événement' })
  leave(@Param('id') id: string, @Request() req: any) {
    return this.eventsService.leaveEvent(id, req.user.id);
  }

  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ajouter/Retirer un événement des favoris' })
  toggleFavorite(@Param('id') id: string, @Request() req: any) {
    return this.eventsService.toggleFavorite(id, req.user.id);
  }
}