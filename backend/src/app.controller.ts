import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getApiInfo() {
    return {
      message: 'DD Computer Backend API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        auth: '/auth',
        users: '/users',
        products: '/products',
        categories: '/categories',
        orders: '/orders',
        chat: '/chat',
        admin: '/admin',
        settings: '/settings'
      }
    };
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString()
    };
  }
}
