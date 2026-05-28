export declare class AppController {
    getApiInfo(): {
        message: string;
        version: string;
        status: string;
        endpoints: {
            auth: string;
            users: string;
            products: string;
            categories: string;
            orders: string;
            chat: string;
            admin: string;
            settings: string;
        };
    };
    getHealth(): {
        status: string;
        timestamp: string;
    };
}
