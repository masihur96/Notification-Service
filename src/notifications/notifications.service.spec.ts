import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { getMessaging } from 'firebase-admin/messaging';

jest.mock('firebase-admin/app', () => ({
  getApps: jest.fn().mockReturnValue([]),
  initializeApp: jest.fn(),
  cert: jest.fn(),
}));

jest.mock('firebase-admin/messaging', () => ({
  getMessaging: jest.fn().mockReturnValue({
    send: jest.fn(),
  }),
}));

describe('NotificationsService', () => {
  let service: NotificationsService;
  const mockSend = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();
    (getMessaging as unknown as jest.Mock).mockReturnValue({
      send: mockSend,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationsService],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendPush', () => {
    it('should send a push notification with a topic successfully', async () => {
      mockSend.mockResolvedValue('mock-message-id');

      const result = await service.sendPush({
        title: 'Test Title',
        body: 'Test Body',
        topic: 'news',
        data: { extraKey: 'extraValue' },
      });

      expect(mockSend).toHaveBeenCalledWith({
        notification: { title: 'Test Title', body: 'Test Body' },
        topic: 'news',
        data: {
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
          extraKey: 'extraValue',
        },
        apns: {
          payload: {
            aps: {
              alert: { title: 'Test Title', body: 'Test Body' },
              sound: 'default',
              badge: 1,
              contentAvailable: true,
            },
          },
        },
      });
      expect(result).toEqual({ success: true, messageId: 'mock-message-id' });
    });

    it('should default to testuser topic if neither token nor topic is provided', async () => {
      mockSend.mockResolvedValue('mock-message-id-2');

      const result = await service.sendPush({
        title: 'Default Topic',
        body: 'Default Body',
      });

      expect(mockSend).toHaveBeenCalledWith({
        notification: { title: 'Default Topic', body: 'Default Body' },
        topic: 'testuser',
        data: {
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
        },
        apns: {
          payload: {
            aps: {
              alert: { title: 'Default Topic', body: 'Default Body' },
              sound: 'default',
              badge: 1,
              contentAvailable: true,
            },
          },
        },
      });
      expect(result).toEqual({ success: true, messageId: 'mock-message-id-2' });
    });

    it('should send notification with token if token is provided', async () => {
      mockSend.mockResolvedValue('token-message-id');

      const result = await service.sendPush({
        title: 'Token Title',
        body: 'Token Body',
        token: 'device-token-123',
      });

      expect(mockSend).toHaveBeenCalledWith({
        notification: { title: 'Token Title', body: 'Token Body' },
        token: 'device-token-123',
        data: {
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
        },
        apns: {
          payload: {
            aps: {
              alert: { title: 'Token Title', body: 'Token Body' },
              sound: 'default',
              badge: 1,
              contentAvailable: true,
            },
          },
        },
      });
      expect(result).toEqual({ success: true, messageId: 'token-message-id' });
    });

    it('should throw InternalServerErrorException when send fails', async () => {
      mockSend.mockRejectedValue(new Error('FCM Network Error'));

      await expect(
        service.sendPush({
          title: 'Fail Title',
          body: 'Fail Body',
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
