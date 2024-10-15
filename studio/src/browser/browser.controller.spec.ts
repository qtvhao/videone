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

jest.setTimeout(60_000 * 20); // 20 minutes

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
    const result = await controller.uploadFile({
      url,
      urlPath,
      waitForSelector,
      file: fileUrl,
    });

    console.log('Result:', result);

    while (true) {
      const pageContent = await controller.getPageContent();
      console.log('Page content:', pageContent);

      await new Promise((resolve) => setTimeout(resolve, 8000));

      if (pageContent.includes('Checks complete. No issues found.')) {
        break;
      }
    }

    let textContent = await controller.getTextContent(
      'div',
      'https://youtu.be/',
    );
    // 
    await controller.clickElement({
      selector: '#next-button.ytcp-uploads-dialog',
      text: '',
      times: 3,
    });
    // 
    await controller.clickElement({
      selector: '#radioLabel',
      text: 'Public',
      times: 3,
    });
    // 
    await new Promise((resolve) => setTimeout(resolve, 2_000));
    await controller.clickElement({
      selector: '#done-button.ytcp-uploads-dialog',
      text: '',
      times: 1,
    });
    console.log('Text content:', textContent);
    expect(result).toEqual({
      upload: textContent,
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
