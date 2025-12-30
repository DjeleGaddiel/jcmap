import { 
  Controller, 
  Get, 
  Patch, 
  Param, 
  UseGuards, 
  Request 
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@Request() req) {
    return this.notificationsService.findAllByUser(req.user.id);
  }

  @Get('unread-count')
  countUnread(@Request() req) {
    return this.notificationsService.countUnread(req.user.id);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @Request() req) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }
}
