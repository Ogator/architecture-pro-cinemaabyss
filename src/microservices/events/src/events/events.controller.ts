import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { MovieEventDto } from './dto/movie-event.dto';
import { PaymentEventDto } from './dto/payment-event.dto';
import { UserEventDto } from './dto/user-event.dto';
import { EventResponse, EventsService } from './events.service';

@Controller('api/events')
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Get('health')
  health(): { status: boolean } {
    return { status: true };
  }

  @Post('movie')
  @HttpCode(HttpStatus.CREATED)
  createMovieEvent(@Body() dto: MovieEventDto): Promise<EventResponse> {
    return this.events.publishMovieEvent(dto);
  }

  @Post('user')
  @HttpCode(HttpStatus.CREATED)
  createUserEvent(@Body() dto: UserEventDto): Promise<EventResponse> {
    return this.events.publishUserEvent(dto);
  }

  @Post('payment')
  @HttpCode(HttpStatus.CREATED)
  createPaymentEvent(@Body() dto: PaymentEventDto): Promise<EventResponse> {
    return this.events.publishPaymentEvent(dto);
  }
}
