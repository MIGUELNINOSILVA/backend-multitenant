import { Controller, Get, UseGuards } from '@nestjs/common';
import { ClientService } from './client.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('clients')
export class ClientController {
    constructor(private readonly clientService:ClientService){}


    @Get()
    // @UseGuards(JwtAuthGuard)
    async getAll(
        
    ){
        return this.clientService.getAll();
    }
}
