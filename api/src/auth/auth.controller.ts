import { 
  Body, 
  Controller, 
  Post, 
  HttpCode, 
  HttpStatus, 
  UseGuards 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Enregistrer un nouvel utilisateur' })
  @ApiResponse({ status: 201, description: 'Utilisateur enregistré avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 409, description: 'L\'utilisateur existe déjà' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connexion avec email, téléphone ou nom d\'utilisateur' })
  @ApiResponse({ status: 200, description: 'Connexion réussie' })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Déconnexion de l\'utilisateur (Le client doit aussi supprimer le token)' })
  @ApiResponse({ status: 200, description: 'Utilisateur déconnecté avec succès' })
  async logout() {
    // Dans un système JWT sans état, la déconnexion est gérée par le client (suppression du token).
    return { 
      message: 'Déconnexion réussie. Veuillez supprimer le token du stockage local.',
      success: true 
    };
  }
}
