import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs('database', (): TypeOrmModuleOptions => {
    const nodeEnv = process.env.NODE_ENV || 'development';

    return {
        type: 'postgres',
        host: process.env.POSTGRES_HOST,
        port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB,
        autoLoadEntities: true,
        synchronize: false,
        ssl: nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
        logging: nodeEnv === 'development',
    };
});