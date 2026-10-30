import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { SendNotificationDto } from './dto/send-notification.dto';
import { ApiKeyGuard } from './guards/api-key.guard';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('api/notifications')
@UseGuards(ApiKeyGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send push notification to device or topic' })
  @ApiResponse({
    status: 200,
    description: 'Notification sent successfully',
    schema: {
      example: { success: true, messageId: 'projects/xyz/messages/12345' },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or missing Authorization Bearer Token',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error while sending notification',
  })
  async send(@Body() dto: SendNotificationDto) {
    return this.notificationsService.sendPush(dto);
  }
}
