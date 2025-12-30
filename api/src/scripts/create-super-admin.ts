import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/enums/user-role.enum';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));
  
  const superAdminData = {
    email: 'superadmin@jcmap.com',
    username: 'superadmin',
    password: 'SuperAdminPassword123!',
    fullName: 'Super Administrator',
    role: UserRole.SUPER_ADMIN,
  };

  // Check if already exists
  const existing = await userRepository.findOne({ 
    where: [{ email: superAdminData.email }, { username: superAdminData.username }] 
  });

  if (existing) {
    console.log('Super Admin already exists.');
  } else {
    const hashedPassword = await bcrypt.hash(superAdminData.password, 10);
    const user = userRepository.create({
      ...superAdminData,
      password: hashedPassword,
    });
    await userRepository.save(user);
    console.log('Super Admin created successfully!');
    console.log('Email: ' + superAdminData.email);
    console.log('Password: ' + superAdminData.password);
  }

  await app.close();
}

bootstrap();
