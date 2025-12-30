import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Email, phone, or username' })
  @IsString()
  @IsNotEmpty()
  login: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}
