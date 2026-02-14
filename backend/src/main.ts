import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // TODO: Enable global validation pipe (class-validator)
  // TODO: Enable CORS configuration
  // TODO: Integrate global logger (Winston/Pino)
  // TODO: Set global prefix (e.g., 'api/v1')

  const port = process.env.PORT || 5000;
  await app.listen(port);
}
void bootstrap();
