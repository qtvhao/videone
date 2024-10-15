import { Test, TestingModule } from '@nestjs/testing';
import { BrowserController } from './browser.controller';
import { BrowserService } from './browser.service';
import { BrowserModule } from './browser.module';

jest.setTimeout(30000); // 30 seconds

describe('BrowserController', () => {
  let controller: BrowserController;
  let browserService: BrowserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [],
      imports: [
        BrowserModule,
      ],
    }).compile();

    controller = module.get<BrowserController>(BrowserController);
    browserService = module.get<BrowserService>(BrowserService);
  });

  it('should call uploadFile with correct parameters', async () => {
    const url = 'http://example.com';
    const waitForSelector = '#selector';
    const fileUrl = 'http://example.com/file.txt';

    const result = await controller.uploadFile(url, waitForSelector, fileUrl);

    expect(result).toEqual({
      "status": "success",
      "upload": "http://example.com/uploaded_file.txt2"
    });
  });

  it('should return success status after uploading file', async () => {
    const url = 'http://example.com';
    const waitForSelector = '#selector';
    const fileUrl = 'http://example.com/file.txt';
    const uploadUrl = 'http://example.com/uploaded_file.txt';

    (browserService.uploadFile as jest.Mock).mockResolvedValue(uploadUrl);

    const result = await controller.uploadFile(url, waitForSelector, fileUrl);

    expect(result).toEqual({
      upload: uploadUrl,
      status: 'success',
    });
  });

  it('should call getPageContent with correct parameters', async () => {
    const url = 'http://example.com';

    await controller.getPageContent(url);

    expect(browserService.getPageContent).toHaveBeenCalledWith(url);
  });

  it('should call getScreenshot with correct parameters', async () => {
    const url = 'http://example.com';

    await controller.getScreenshot(url);

    expect(browserService.getScreenshot).toHaveBeenCalledWith(url);
  });

  it('should call gotoPage with correct parameters', async () => {
    const url = 'http://example.com';

    await controller.gotoPage(url);

    expect(browserService.gotoPage).toHaveBeenCalledWith(url);
  });
});
