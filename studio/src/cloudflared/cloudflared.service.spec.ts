import { Test, TestingModule } from '@nestjs/testing';
import { CloudflaredService } from './cloudflared.service';

describe('CloudflaredService', () => {
  let service: CloudflaredService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CloudflaredService],
    }).compile();

    service = module.get<CloudflaredService>(CloudflaredService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
