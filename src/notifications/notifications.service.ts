import {
  Injectable,
  OnModuleInit,
  InternalServerErrorException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { SendNotificationDto } from './dto/send-notification.dto';

@Injectable()
export class NotificationsService implements OnModuleInit {
  onModuleInit() {
    if (!admin.apps.length) {
      const serviceAccountRaw = process.env.FIREBASE_SERVICE_ACCOUNT;
      if (!serviceAccountRaw) {
        console.warn(
          '⚠️ FIREBASE_SERVICE_ACCOUNT env is missing. Running in uninitialized state.',
        );
        return;
      }

      const serviceAccount = JSON.parse(serviceAccountRaw);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
  }

  async sendPush(dto: SendNotificationDto) {
    const { title, body, topic, token, data } = dto;

    const message: admin.messaging.Message = {
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
      const response = await admin.messaging().send(message);
      return { success: true, messageId: response };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}