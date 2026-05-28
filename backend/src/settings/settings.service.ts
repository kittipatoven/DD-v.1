import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private settingsRepository: Repository<Setting>,
  ) {}

  async findAll(): Promise<Setting[]> {
    return this.settingsRepository.find();
  }

  async findByKey(key: string): Promise<Setting | null> {
    return this.settingsRepository.findOne({ where: { key_name: key } });
  }

  async update(updateData: { key: string; value: string }[]): Promise<{ success: boolean }> {
    for (const item of updateData) {
      const existing = await this.findByKey(item.key);
      
      if (existing) {
        await this.settingsRepository.update(
          { key_name: item.key },
          { value: item.value },
        );
      } else {
        const newSetting = this.settingsRepository.create({
          key_name: item.key,
          value: item.value,
        });
        await this.settingsRepository.save(newSetting);
      }
    }
    
    return { success: true };
  }

  async getSettingsAsObject(): Promise<Record<string, string>> {
    const settings = await this.findAll();
    const result: Record<string, string> = {};
    
    settings.forEach(setting => {
      result[setting.key_name] = setting.value;
    });
    
    return result;
  }
}
