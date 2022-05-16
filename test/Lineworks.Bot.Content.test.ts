import Lineworks from "../src/Lineworks";

// トーク共通プロパティ
// https://developers.worksmobile.com/jp/reference/bot-send-content?lang=ja
describe("トーク共通プロパティ (Lineworks.Bot.Content)", () => {
  beforeAll(() => {
    Logger.log = jest.fn().mockImplementation(msg => {
      return console.log(msg);
    });
    jest.spyOn(Logger, "log");
  });

  // https://developers.worksmobile.com/jp/reference/bot-send-text?lang=ja
  test("Text-common", () => {
    const expected: Lineworks.Bot.Content.Text = {
      "content": {
        "type": "text",
        "text": "hello"
      }
    };
    const text = 'hello';
    const actual = Lineworks.Bot.Content.Text(text);
    expect(actual).toEqual(expected);
  });

  // https://developers.worksmobile.com/jp/reference/bot-send-text?lang=ja
  test("Text-multi language", () => {
    const expected: Lineworks.Bot.Content.Text = {
      "content": {
        "type": "text",
        "text": "hello",
        "i18nTexts": [{
          "language": "ja_JP",
          "text": "こんにちは"
        }, {
          "language": "ko_KR",
          "text": "안녕하세요"
        }]
      }
    };
    const text = "hello";
    const i18nTexts = [
      Lineworks.Bot.Content.i18nText('ja_JP', 'こんにちは'),
      Lineworks.Bot.Content.i18nText('ko_KR', '안녕하세요'),
    ];
    const actual = Lineworks.Bot.Content.Text(text, i18nTexts);
    expect(actual).toEqual(expected);
  });

  // https://developers.worksmobile.com/jp/reference/bot-send-image?lang=ja
  test("Image-URL方式", () => {
    const expected: Lineworks.Bot.Content.ImageUrl = {
      "content": {
        "type": "image",
        "previewImageUrl": "https://example.com/preview.png",
        "originalContentUrl": "https://example.com/image.png"
      }
    };
    const actual = Lineworks.Bot.Content.Image('https://example.com/preview.png','https://example.com/image.png');
    expect(actual).toEqual(expected);
  });

  // https://developers.worksmobile.com/jp/reference/bot-send-image?lang=ja
  test("Image-ファイル ID 方式", () => {
    const expected: Lineworks.Bot.Content.ImageFileId = {
      "content": {
        "type": "image",
        "fileId": "jp1.1628695315008671000.1628781715.0.1000001.0.0.0"
      }
    };
    const actual = Lineworks.Bot.Content.Image('jp1.1628695315008671000.1628781715.0.1000001.0.0.0');
    expect(actual).toEqual(expected);
  });

});