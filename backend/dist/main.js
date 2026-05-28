"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const path_1 = require("path");
const express = require("express");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true, limit: '1mb' }));
    app.use('/uploads', express.static((0, path_1.join)(process.cwd(), 'uploads')));
    const corsOrigin = process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',')
        : [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:64991',
            /^http:\/\/localhost:\d+$/,
            /^http:\/\/127\.0\.0\.1:\d+$/
        ];
    app.use((req, res, next) => {
        if (req.path.startsWith('/uploads')) {
            return next();
        }
        const origin = req.headers.origin;
        const allowedOrigins = [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:64991'
        ];
        if (allowedOrigins.includes(origin) || origin?.match(/^http:\/\/localhost:\d+$/) || origin?.match(/^http:\/\/127\.0\.0\.1:\d+$/)) {
            res.header('Access-Control-Allow-Origin', origin || '*');
            res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
            res.header('Access-Control-Allow-Credentials', 'true');
        }
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        if (req.method === 'OPTIONS') {
            return res.sendStatus(200);
        }
        next();
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.setGlobalPrefix('api/v1');
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`Backend running on http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map