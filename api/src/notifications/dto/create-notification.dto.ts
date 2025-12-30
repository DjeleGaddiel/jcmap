import { IsNotEmpty, IsString, IsEnum, IsUUID } from 'class-validator';
import { NotificationType } from '../notification.entity';

export class CreateNotificationDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsEnum(NotificationType)
  type: NotificationType;
}
