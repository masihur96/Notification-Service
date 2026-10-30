import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { NotificationsService } from './../src/notifications/notifications.service';

describe('NotificationsController (e2e)', () => {
  let app: INestApplication<App>;
  const mockNotificationsService = {
    sendPush: jest.fn().mockResolvedValue({
      success: true,
      messageId: 'projects/test-project/messages/test-msg-123',
    }),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(NotificationsService)
      .useValue(mockNotificationsService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /api/notifications/send', () => {
    it('should return 401 Unauthorized without auth header', () => {
      return request(app.getHttpServer())
        .post('/api/notifications/send')
        .send({ title: 'Test', body: 'Test body' })
        .expect(401);
    });

    it('should return 401 Unauthorized with invalid Bearer token', () => {
      return request(app.getHttpServer())
        .post('/api/notifications/send')
        .set('Authorization', 'Bearer invalid_secret')
        .send({ title: 'Test', body: 'Test body' })
        .expect(401);
    });

    it('should return 400 Bad Request with missing title/body', () => {
      return request(app.getHttpServer())
        .post('/api/notifications/send')
        .set('Authorization', 'Bearer cargo_secret_push_key_2026')
        .send({})
        .expect(400);
    });

    it('should send notification successfully with valid Bearer token and body', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/notifications/send')
        .set('Authorization', 'Bearer cargo_secret_push_key_2026')
        .send({
          title: 'Shipment Update',
          body: 'Shipment #14 has been recorded.',
          topic: 'testuser',
        })
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        messageId: 'projects/test-project/messages/test-msg-123',
      });
      expect(mockNotificationsService.sendPush).toHaveBeenCalledWith({
        title: 'Shipment Update',
        body: 'Shipment #14 has been recorded.',
        topic: 'testuser',
      });
    });
  });
});
