import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
  MongooseHealthIndicator,
} from '@nestjs/terminus';

@ApiTags('App Health Check')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private mongoose: MongooseHealthIndicator,
    private configService: ConfigService,
  ) {}

  @ApiOperation({
    summary: 'Check the ability of the application to make HTTP requests',
  })
  @Get('external')
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com'),
    ]);
  }

  @ApiOperation({ summary: 'Check the health of the Telegram webhook' })
  @Get('external/telegram-webhook')
  @HealthCheck()
  checkTelegramWebhook() {
    const TELEGRAM_BOT_TOKEN =
      this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    return this.health.check([
      () =>
        this.http.pingCheck(
          'telegram-api',
          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`,
        ),
    ]);
  }

  @ApiOperation({ summary: 'Check the health of the MongoDB connection' })
  @Get('mongo')
  @HealthCheck()
  checkMongo() {
    return this.health.check([() => this.mongoose.pingCheck('database')]);
  }
}
