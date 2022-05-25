import Lineworks from './Lineworks';

function doPost(e: GoogleAppsScript.Events.DoPost) {
    if (e == null || e.postData == null || e.postData.contents == null) return
    const contents = JSON.parse(e.postData.contents)
    PropertiesService.getScriptProperties().setProperty("postData.contents", contents);
    if ((contents.type == 'message') && (contents.content.type == 'text')) {
        const textmessage: Lineworks.Bot.Callback.TextMessageEvent = contents;
        const channelId = textmessage.source.channelId;
        const userId = textmessage.source.userId;
        const text = 'こんにちは！\n\n' + JSON.stringify(contents);
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
}

function doGet(e: GoogleAppsScript.Events.DoGet) {
    //
}
