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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Organization } from './organization.entity';

@ApiTags('Organisations')
@Controller('organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganizationsController {
  constructor(
    private readonly orgService: OrganizationsService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  @Post()
  @Roles(UserRole.USER, UserRole.ORGANIZER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer une nouvelle organisation (Église, Association...)' })
  create(@Body() createDto: CreateOrganizationDto, @Request() req: any) {
    return this.orgService.create(createDto, req.user);
  }

  @Get()
  @Roles(UserRole.USER, UserRole.ORGANIZER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer toutes les organisations' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Recherche par nom ou description' })
  @ApiQuery({ name: 'isVerified', required: false, type: Boolean, description: 'Filtrer par statut de vérification' })
  findAll(@Query('search') search?: string, @Query('isVerified') isVerified?: string) {
    const verified = isVerified === 'true' ? true : (isVerified === 'false' ? false : undefined);
    return this.orgService.findAll(search, verified);
  }

  @Get('nearby')
  @Roles(UserRole.USER, UserRole.ORGANIZER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Rechercher des organisations par proximité (PostGIS)' })
  @ApiQuery({ name: 'lat', type: Number, description: 'Latitude' })
  @ApiQuery({ name: 'lng', type: Number, description: 'Longitude' })
  @ApiQuery({ name: 'radius', required: false, type: Number, description: 'Rayon en km (défaut: 10)' })
  findNearby(@Query('lat') lat: string, @Query('lng') lng: string, @Query('radius') radius?: string) {
    return this.orgService.findNearby(parseFloat(lat), parseFloat(lng), parseFloat(radius || '10'));
  }

  @Get(':id')
  @Roles(UserRole.USER, UserRole.ORGANIZER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer une organisation par son ID' })
  findOne(@Param('id') id: string) {
    return this.orgService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour les détails d\'une organisation' })
  update(@Param('id') id: string, @Body() updateData: Partial<Organization>, @Request() req: any) {
    return this.orgService.update(id, updateData, req.user);
  }

  @Post(':id/logo')
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
  @ApiOperation({ summary: 'Télécharger le logo d\'une organisation vers Cloudinary' })
  async uploadLogo(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Request() req: any) {
    const org = await this.orgService.findOne(id);
    
    // Supprimer l'ancien logo si il existe
    if (org.logoUrl) {
      const publicId = this.cloudinaryService.extractPublicIdFromUrl(org.logoUrl);
      if (publicId) await this.cloudinaryService.deleteFile(publicId);
    }

    const result = await this.cloudinaryService.uploadImage(file, 'organizations');
    return this.orgService.update(id, { logoUrl: result.secure_url }, req.user);
  }

  @Delete(':id/logo')
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer le logo d\'une organisation' })
  async deleteLogo(@Param('id') id: string, @Request() req: any) {
    const org = await this.orgService.findOne(id);
    if (org.logoUrl) {
      const publicId = this.cloudinaryService.extractPublicIdFromUrl(org.logoUrl);
      if (publicId) await this.cloudinaryService.deleteFile(publicId);
      await this.orgService.update(id, { logoUrl: null }, req.user);
    }
    return { message: 'Logo supprimé avec succès' };
  }

  @Delete(':id')
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer une organisation' })
  async remove(@Param('id') id: string, @Body('reason') reason: string, @Request() req: any) {
    const org = await this.orgService.findOne(id);
    
    // Supprimer le logo de Cloudinary avant de supprimer l'org
    if (org.logoUrl) {
      const publicId = this.cloudinaryService.extractPublicIdFromUrl(org.logoUrl);
      if (publicId) await this.cloudinaryService.deleteFile(publicId);
    }


    return this.orgService.remove(id, req.user, reason);
  }

  @Get(':id/members')
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer les membres d\'une organisation' })
  getMembers(@Param('id') id: string) {
    return this.orgService.getMembers(id);
  }
}
