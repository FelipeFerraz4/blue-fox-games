import { Module } from '@nestjs/common';
import { MemoryModule } from './modules/memory/memory.module';

@Module({
  imports: [MemoryModule],
})
export class AppModule {}
