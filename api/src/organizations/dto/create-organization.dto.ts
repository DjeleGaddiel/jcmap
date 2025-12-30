import { IsString, IsNotEmpty, IsOptional, IsNumber, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrganizationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsUrl()
  @IsOptional()
  website?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiProperty({ required: false })
  @IsUrl()
  @IsOptional()
  logoUrl?: string;
}
