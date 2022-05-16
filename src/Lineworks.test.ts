import Lineworks from './Lineworks';

function testOAuth2() {
    const appConfig = Lineworks.Util.getAppConfig();
    const accessToken = Lineworks.PlatformG.requestJwtAccessToken(appConfig);
    Logger.log(accessToken);

    const refreshedToken = Lineworks.PlatformG.refreshJwtAccessToken(accessToken.refresh_token, appConfig);
    Logger.log(refreshedToken);

    return refreshedToken.access_token;
}

const imageUrl = "https://line.worksmobile.com/jp/wp-content/uploads/img-bot-01.png";

function testSendMessage() {
    const { botId, userId, channelId } = Lineworks.Util.getConfig().bot;
    const accessToken = testOAuth2();

    const sendAll = (payload) => {

        Lineworks.Bot.Message.sendToUser(userId, payload, botId, accessToken);
        Logger.log('sendToUser: ' + userId);

        Lineworks.Bot.Message.sendToChannel(channelId, payload, botId, accessToken);
        Logger.log('sendToChannel: ' + channelId);

    }

    // Text
    // https://developers.worksmobile.com/jp/reference/bot-send-text?lang=ja
    const text = "こんにちは！\n" + Date.now();
    const payloadText = Lineworks.Bot.Content.Text(text);
    sendAll(payloadText);

    // Image (URL方式)
    // https://developers.worksmobile.com/jp/reference/bot-send-image?lang=ja
    const payloadImage = Lineworks.Bot.Content.Image(imageUrl, imageUrl);
    sendAll(payloadImage);

    // Image (FileID方式)
    // --> testUploadFile()

    // Link
    // https://developers.worksmobile.com/jp/reference/bot-send-link?lang=ja
    const payloadLink = Lineworks.Bot.Content.LinkContent(text, "クリック！", imageUrl);
    sendAll(payloadLink);

    // Stamp
    // https://developers.worksmobile.com/jp/reference/bot-send-sticker?lang=ja
    const payloadStamp = Lineworks.Bot.Content.StampContent('1', '2');
    sendAll(payloadStamp);

    // Button Template
    // https://developers.worksmobile.com/jp/reference/bot-send-button?lang=ja

    // List Template
    // https://developers.worksmobile.com/jp/reference/bot-send-list?lang=ja

    // Carousel
    // https://developers.worksmobile.com/jp/reference/bot-send-carousel?lang=ja

    // Image Carousel
    // https://developers.worksmobile.com/jp/reference/bot-send-imagecarousel?lang=ja

    // File (URL方式)
    // https://developers.worksmobile.com/jp/reference/bot-send-file?lang=ja
    const payloadFile = Lineworks.Bot.Content.FileUrlContent(imageUrl);
    sendAll(payloadFile);

    // File (FileID方式)
    // https://developers.worksmobile.com/jp/reference/bot-send-file?lang=ja
    // --> testUploadFile()

    // Flexible Template
    // https://developers.worksmobile.com/jp/reference/bot-send-flex?lang=ja
}

function testUploadFile() {
    const { botId, userId, channelId } = Lineworks.Util.getConfig().bot;
    const accessToken = testOAuth2();

    const sendAll = (payload) => {

        Lineworks.Bot.Message.sendToUser(userId, payload, botId, accessToken);
        Logger.log('sendToUser: ' + userId);

        Lineworks.Bot.Message.sendToChannel(channelId, payload, botId, accessToken);
        Logger.log('sendToChannel: ' + channelId);

    }

    // File
    // https://developers.worksmobile.com/jp/reference/bot-send-file?lang=ja

    const blob = UrlFetchApp.fetch(imageUrl).getBlob();
    const fileName = blob.getName();
    const contentType = blob.getContentType();
    const data = blob.getBytes();

    // bots コンテンツファイルの作成
    const fileInfo = Lineworks.Bot.Attachment.createFile(fileName, botId, accessToken);
    Logger.log(fileInfo);
    const { fileId, uploadUrl } = fileInfo;

    // ファイルのアップロード
    const uploaded = Lineworks.File.upload(uploadUrl, data, contentType, fileName);
    Logger.log(uploaded);

    // Image (FileID方式)
    // https://developers.worksmobile.com/jp/reference/bot-send-image?lang=ja
    var payloadImage = Lineworks.Bot.Content.Image(fileId);
    sendAll(payloadImage);

    // File (FileID方式)
    // https://developers.worksmobile.com/jp/reference/bot-send-file?lang=ja
    const payloadFile = Lineworks.Bot.Content.FileUrlContent(imageUrl);
    sendAll(payloadFile);

    const url = Lineworks.Bot.Attachment.getFileLocation(fileId, botId, accessToken);
    Logger.log(url);

    const blobFile = Lineworks.Bot.Attachment.getFileLocation(fileId, botId, accessToken, true);
    Logger.log(blobFile);

}