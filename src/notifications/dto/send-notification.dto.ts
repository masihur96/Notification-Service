import { IsNotEmpty, IsOptional, IsString, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendNotificationDto {
  @ApiProperty({
    example: 'Shipment Update',
    description: 'নোটিফিকেশনের শিরোনাম',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    example: 'Shipment #14 has been recorded.',
    description: 'নোটিফিকেশনের বডি মেসেজ',
  })
  @IsString()
  @IsNotEmpty()
  body!: string;

  @ApiPropertyOptional({
    example: 'testuser',
    description: 'FCM টপিক নাম (ডিফল্ট: testuser)',
  })
  @IsString()
  @IsOptional()
  topic?: string;

  @ApiPropertyOptional({
    example: 'f-xyz123abc...',
    description: 'নির্দিষ্ট ডিভাইসের FCM Token (টপিক না ব্যবহার করলে)',
  })
  @IsString()
  @IsOptional()
  token?: string;

  @ApiPropertyOptional({
    example: { shipment_id: '14', status: 'in_transit' },
    description: 'কাস্টম কী-ভ্যালু ডাটা পে-লোড',
  })
  @IsObject()
  @IsOptional()
  data?: Record<string, string>;
}
