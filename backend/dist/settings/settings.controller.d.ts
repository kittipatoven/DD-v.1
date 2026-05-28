import { SettingsService } from './settings.service';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    getPublic(): Promise<Record<string, string>>;
    getAll(): Promise<import("./entities/setting.entity").Setting[]>;
    getAsObject(): Promise<Record<string, string>>;
    update(updateData: {
        key: string;
        value: string;
    }[]): Promise<{
        success: boolean;
    }>;
}
