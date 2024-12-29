import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
    HOST_DATABASE: string;
    PORT_DATABASE: number;
    USERNAME_DATABASE: string;
    PASSWORD_DATABASE: string;
    NAME_DATABASE: string;
    PORT: number;
    SECRET_JWT: string;
}

//Validador de schema
const envsSchema = joi.object({
    HOST_DATABASE: joi.string().required(),
    PORT_DATABASE: joi.number().required(),
    USERNAME_DATABASE: joi.string().required(),
    PASSWORD_DATABASE: joi.string().required(),
    NAME_DATABASE: joi.string().required(),
    PORT: joi.number().required(),
    SECRET_JWT: joi.string().required(),
}).unknown(true);

const { error, value } = envsSchema.validate(process.env);

if (error) {
    throw new Error(`Error ${error}`);
}

const envVars: EnvVars = value;

export const envs = {
    HOST_DATABASE: envVars.HOST_DATABASE,
    PORT_DATABASE: envVars.PORT_DATABASE,
    USERNAME_DATABASE: envVars.USERNAME_DATABASE,
    PASSWORD_DATABASE: envVars.PASSWORD_DATABASE,
    NAME_DATABASE: envVars.NAME_DATABASE,
    PORT: envVars.PORT,
    SECRET_JWT: envVars.SECRET_JWT,
}