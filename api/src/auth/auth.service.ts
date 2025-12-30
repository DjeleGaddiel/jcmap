import { 
  ConflictException, 
  Injectable, 
  UnauthorizedException 
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { User } from "../users/user.entity";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { UserRole } from "../users/enums/user-role.enum";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Enregistre un nouvel utilisateur
   */
  async register(dto: RegisterDto) {
    const { email, phone, username, password, fullName } = dto;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { phone }, { username }],
    });

    if (existingUser) {
      throw new ConflictException(
        "Un utilisateur existe déjà avec cet email, téléphone ou nom d'utilisateur"
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const user = this.userRepository.create({
      email,
      phone,
      username,
      password: hashedPassword,
      fullName,
      role: UserRole.USER,
    });

    await this.userRepository.save(user);

    return this.login({ login: (email || username || phone) as string, password });
  }

  /**
   * Connecte un utilisateur
   */
  async login(dto: LoginDto) {
    const { login, password } = dto;

    // Trouver l'utilisateur par l'un de ses identifiants
    const user = await this.userRepository.findOne({
      where: [{ email: login }, { phone: login }, { username: login }],
      select: ["id", "password", "email", "username", "role"], // On a besoin du mot de passe pour comparer
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException("Identifiants de connexion invalides");
    }

    // Générer le token JWT
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    };
  }

  /**
   * Valide un utilisateur par son ID (utilisé par JwtStrategy)
   */
  async validateUserById(id: string) {
    return this.userRepository.findOne({ where: { id } });
  }
}
