import Lineworks from './Lineworks';

function testOAuth2() {
    const accesstoken = Lineworks.OAuth2.getJwtAccessToken();
    Logger.log(accesstoken);

    const refreshedAccessToken = Lineworks.OAuth2.refreshJwtAccessToken(accesstoken.refresh_token);
    Logger.log(refreshedAccessToken);

}

const imageUrl = "https://line.worksmobile.com/jp/wp-content/uploads/img-bot-01.png";

function testSendMessage() {
    const { botId, userId, channelId } = Lineworks.Util.getConfig().bot;

    // Access Token
    const accessToken = Lineworks.OAuth2.getJwtAccessToken().access_token;
    Logger.log(accessToken);

    const sendAll = (payload) => {

        Lineworks.Bot.Message.sendToUser(userId, payload, botId, accessToken);
        Logger.log('sendToUser: ' + userId);

        Lineworks.Bot.Message.sendToChannel(channelId, payload, botId, accessToken);
        Logger.log('sendToChannel: ' + channelId);

    }

    // Text
    // https://developers.worksmobile.com/jp/reference/bot-send-text?lang=ja
    const text = "こんにちは！\n" + Date.now();
    const payloadText = Lineworks.Bot.Content.TextContent(text);
    sendAll(payloadText);

    // Image (URL方式)
    // https://developers.worksmobile.com/jp/reference/bot-send-image?lang=ja
    const payloadImage = Lineworks.Bot.Content.ImageContent(imageUrl, imageUrl);
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

    // File
    // https://developers.worksmobile.com/jp/reference/bot-send-file?lang=ja

    // Access Token
    const accessToken = Lineworks.OAuth2.getJwtAccessToken().access_token;

    const sendAll = (payload) => {

        Lineworks.Bot.Message.sendToUser(userId, payload, botId, accessToken);
        Logger.log('sendToUser: ' + userId);

        Lineworks.Bot.Message.sendToChannel(channelId, payload, botId, accessToken);
        Logger.log('sendToChannel: ' + channelId);

    }

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
    var payloadImage = Lineworks.Bot.Content.ImageContent(fileId);
    sendAll(payloadImage);

    // File (FileID方式)
    // https://developers.worksmobile.com/jp/reference/bot-send-file?lang=ja
    const payloadFile = Lineworks.Bot.Content.FileUrlContent(imageUrl);
    sendAll(payloadFile);

    const url = Lineworks.Bot.Attachment.getFile(fileId, botId, accessToken, false);
    Logger.log(url)

}