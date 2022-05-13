import Lineworks from './Lineworks';

function doPost(e:GoogleAppsScript.Events.DoPost) {
    if (e == null || e.postData == null || e.postData.contents == null) return
    const contents = JSON.parse(e.postData.contents)
    if ((contents.type == 'message') && (contents.content.type == 'text')) {
        const {botId} = Lineworks.Util.getConfig().bot
        const userId = contents.source.userId;
        const text = 'こんにちは！\n' + contents.content.text;
        const accessToken = Lineworks.OAuth2.getJwtAccessToken().access_token;
        Lineworks.Bots.Message.sendToUser(botId, userId, text, accessToken);
    }
}

function doGet(e:GoogleAppsScript.Events.DoGet) {
    //
}