import {
  Injectable,
  OnModuleInit,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  getApps,
  initializeApp,
  cert,
  ServiceAccount,
} from 'firebase-admin/app';
import { getMessaging, Message } from 'firebase-admin/messaging';
import { SendNotificationDto } from './dto/send-notification.dto';

@Injectable()
export class NotificationsService implements OnModuleInit {
  onModuleInit() {
    if (!getApps().length) {
      const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
      if (!serviceAccountRaw) {
        console.warn(
          '⚠️ FIREBASE_SERVICE_ACCOUNT env is missing. Running in uninitialized state.',
        );
        return;
      }

      const serviceAccount = JSON.parse(serviceAccountRaw) as ServiceAccount;
      initializeApp({
        credential: cert(serviceAccount),
      });
    }
  }

  async sendPush(dto: SendNotificationDto) {
    const { title, body, topic, token, data } = dto;

    const message: Message = {
      notification: { title, body },
      data: {
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
        ...(data || {}),
      },
      apns: {
        payload: {
          aps: {
            alert: { title, body },
            sound: 'default',
            badge: 1,
            contentAvailable: true,
          },
        },
      },
      ...(token ? { token } : { topic: topic || 'testuser' }),
    };

    try {
      const response = await getMessaging().send(message);
      return { success: true, messageId: response };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(errorMessage);
    }
  }
}
