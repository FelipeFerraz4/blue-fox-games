import { Module } from '@nestjs/common';
import { MemoryGateway } from './memory.gateway';
import { RoomsService } from './rooms.service';

@Module({
  providers: [MemoryGateway, RoomsService],
})
export class MemoryModule {}
