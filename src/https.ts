import Lineworks from './Lineworks';

function doPost(e: GoogleAppsScript.Events.DoPost) {
    if (e == null || e.postData == null || e.postData.contents == null) return
    const contents = JSON.parse(e.postData.contents);
    const eventType = contents.type;
    if (eventType) {
        onCallbackEvent(contents);
    }
}

function doGet(e: GoogleAppsScript.Events.DoGet) {
    //
}

function onCallbackEvent(e: any) {
    const eventType = e.type;
    const text = `type="${eventType}"\n\n` + JSON.stringify(e);
    const channelId = e.source.channelId;
    const userId = e.source.userId;
    sendLineworksBotTextMessage(text, channelId, userId);
    if (eventType == 'message') {
        const contentType = e.content.type;
        switch (contentType) {
            case 'text':
                onTextMessageEvent(e);
                return;
                break;
            default:
                break;
        }
    }
}

function onTextMessageEvent(e: Lineworks.Bot.Callback.TextMessage) {
    const text = `こんにちは！\n「${e.content.text}」`;
    const channelId = e.source.channelId;
    const userId = e.source.userId;
    sendLineworksBotTextMessage(text, channelId, userId);
}

function sendLineworksBotTextMessage(text: string, channelId: string, userId: string) {
    const payloadText = Lineworks.Bot.Content.Text(text);
    const { botId } = Lineworks.Util.getConfig().bot
    const appConfig = Lineworks.Util.getAppConfig();
    const accessToken = Lineworks.PlatformG.requestJwtAccessToken(appConfig).access_token;
    if (channelId) {
        Lineworks.Bot.Message.sendToChannel(channelId, payloadText, botId, accessToken);
    } else {
        Lineworks.Bot.Message.sendToUser(userId, payloadText, botId, accessToken);
    }
}