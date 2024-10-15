import { Test, TestingModule } from '@nestjs/testing';
import { BrowserController } from './browser.controller';
import { BrowserService } from './browser.service';
import { BrowserModule } from './browser.module';
import {
  uploadFileFixtures,
  getPageContentFixtures,
  getScreenshotFixtures,
  gotoPageFixtures,
} from './browser.controller.fixtures';

jest.setTimeout(30000); // 30 seconds

describe('BrowserController', () => {
  let controller: BrowserController;
  let browserService: BrowserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [],
      imports: [BrowserModule],
    }).compile();

    controller = module.get<BrowserController>(BrowserController);
    browserService = module.get<BrowserService>(BrowserService);
  });

  it.each(
    uploadFileFixtures.map((fixture) => [
      fixture.url,
      fixture.urlPath,
      fixture.waitForSelector,
      fixture.fileUrl,
    ]),
  )('should return success status after uploading file', async (url, urlPath, waitForSelector, fileUrl) => {
    const result = await controller.uploadFile({
      url,
      urlPath,
      waitForSelector,
      file: fileUrl,
    });

    expect(result).toEqual({
      status: 'success',
      upload: 'http://example.com/uploaded_file.txt2',
    });
  });

  it('should return success status after uploading file', async () => {
    const url = 'http://example.com';
    const waitForSelector = '#selector';
    const fileUrl = 'http://example.com/file.txt';
    const uploadUrl = 'http://example.com/uploaded_file.txt';

    (browserService.uploadFile as jest.Mock).mockResolvedValue(uploadUrl);

    const result = await controller.uploadFile({
      url,
      urlPath: '/upload',
      waitForSelector,
      file: fileUrl,
    });

    expect(result).toEqual({
      upload: uploadUrl,
      status: 'success',
    });
  });

  it('should call getPageContent with correct parameters', async () => {
    const { url } = getPageContentFixtures[0];

    await controller.getPageContent(url);

    expect(browserService.getPageContent).toHaveBeenCalledWith(url);
  });

  it('should call getScreenshot with correct parameters', async () => {
    const url = 'http://example.com';

    await controller.getScreenshot(url);

    expect(browserService.getScreenshot).toHaveBeenCalledWith(url);
  });

  it('should call gotoPage with correct parameters', async () => {
    const { url } = gotoPageFixtures[0];

    await controller.gotoPage(url);

    expect(browserService.gotoPage).toHaveBeenCalledWith(url);
  });

  // Additional tests using fixtures
  it.each(uploadFileFixtures.map((fixture) => {
    const { url, urlPath, waitForSelector, fileUrl } = fixture;
    return [url, urlPath, waitForSelector, fileUrl];
  }))( 'should return success status after uploadFile', async (url, urlPath, waitForSelector, fileUrl) => {
      const expectedUploadUrl = 'File uploaded';

      const result = await controller.uploadFile(
        { url, urlPath, waitForSelector, file: fileUrl },
      );

      expect(result).toEqual({
        upload: expectedUploadUrl,
        status: 'success',
      });
  });

  it('should call getPageContent with different fixture parameters', async () => {
    for (const fixture of getPageContentFixtures) {
      const { url } = fixture;

      await controller.getPageContent(url);

      expect(browserService.getPageContent).toHaveBeenCalledWith(url);
    }
  });

  it('should call getScreenshot with different fixture parameters', async () => {
    for (const fixture of getScreenshotFixtures) {
      const { url } = fixture;

      await controller.getScreenshot(url);

      expect(browserService.getScreenshot).toHaveBeenCalledWith(url);
    }
  });

  it('should call gotoPage with different fixture parameters', async () => {
    for (const fixture of gotoPageFixtures) {
      const { url } = fixture;

      await controller.gotoPage(url);

      expect(browserService.gotoPage).toHaveBeenCalledWith(url);
    }
  });
});
