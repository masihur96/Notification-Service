import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { SendNotificationDto } from './dto/send-notification.dto';

describe('NotificationsController', () => {
  let controller: NotificationsController;

  const mockNotificationsService = {
    sendPush: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service.sendPush with the provided DTO', async () => {
    const dto: SendNotificationDto = {
      title: 'Order Shipped',
      body: 'Your package is on the way',
      topic: 'orders',
    };
    const expectedResponse = {
      success: true,
      messageId: 'projects/test/messages/999',
    };
    mockNotificationsService.sendPush.mockResolvedValue(expectedResponse);

    const result = await controller.send(dto);
    expect(mockNotificationsService.sendPush).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expectedResponse);
  });
});
