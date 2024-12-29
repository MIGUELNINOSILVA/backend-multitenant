import { Body, Controller, Headers, Post } from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    async login(
      @Body() authCredentialsDto: AuthCredentialsDto,
      @Headers('company-code') companyCode: string,
    ) {
      return this.authService.login(authCredentialsDto);
    }
}
