import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ClientService {

    constructor(
        @InjectRepository(Client)
        private readonly clientsRepository: Repository<Client>
    ) { }

    async getAll() {
        return await this.clientsRepository.find();
    }
}
