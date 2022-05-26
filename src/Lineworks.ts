/**
 * LINE WORKS API 2.0
 * https://developers.worksmobile.com/jp/reference/introduction?lang=ja
 */
namespace Lineworks {
    export namespace PlatformG {

        export function readTextFromFile(filename: string) {
            const text = HtmlService.createHtmlOutputFromFile(filename.slice(0, -5)).getContent();
            return text;
        }

        function getJwtRs256(clientId: string, serviceAccount: string, privateKey: string, expIn: number = 3600): string {
            const iat: number = Math.floor(Date.now() / 1000);
            const exp: number = iat + expIn;
            const payload: OAuth2.JwtClaimset = {
                iss: clientId,
                sub: serviceAccount,
                iat: iat,
                exp: exp,
            };
            const header: OAuth2.JwtHeader = {
                alg: 'RS256',
                typ: 'JWT',
            };
            const jwtsign = (header: any, payload: any, privateKey: string) => {
                const base64Encode = (data: any, isSignature: boolean = false) => {
                    if (isSignature) {
                        return Utilities.base64EncodeWebSafe(data).replace(/=+$/, '');
                    }
                    return Utilities.base64EncodeWebSafe(JSON.stringify(data));
                }
                return ((value, key) => {
                    return value + '.' + base64Encode(Utilities.computeRsaSha256Signature(value, key), true);
                })(base64Encode(header) + '.' + base64Encode(payload), privateKey);
            };
            const jwt = jwtsign(header, payload, privateKey);
            return jwt;
        }

        function getNewJwtAccessToken(jwt: string, clientId: string, clientSecret: string, scopes: string): OAuth2.Token {
            const url = OAuth2.buildUrl();
            const payload: OAuth2.RequestBody = {
                assertion: jwt,
                grant_type: encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer'),
                client_id: clientId,
                client_secret: clientSecret,
                scope: scopes,
            };
            const options = OAuth2.buildFetchOptions(payload);
            const response = fetch(url, options);
            //Logger.log(response.getResponseCode());
            if (response.responseCode != 200) {
                return null;
            }
            //Logger.log(response.getContentText());
            const token = JSON.parse(response.contentText);
            return token;
        }

        export function requestJwtAccessToken(appConfig: Util.AppConfig, scopes: string = 'bot'): OAuth2.Token {
            const jwt = getJwtRs256(appConfig.clientId, appConfig.serviceAccount, appConfig.privateKey);
            //Logger.log(jwt);
            const accessToken = getNewJwtAccessToken(jwt, appConfig.clientId, appConfig.clientSecret, scopes);
            //Logger.log(accessToken);
            return accessToken;
        }

        /**
         * Access Tokenの再発行
         * https://developers.worksmobile.com/jp/reference/authorization-auth?lang=ja
         * @param refresh_token 
         * @returns 
         */
        export function refreshJwtAccessToken(refresh_token: string, appConfig: Util.AppConfig): OAuth2.Token {
            const url = OAuth2.buildUrl();
            const payload: OAuth2.RefreshBody = {
                refresh_token: refresh_token,
                grant_type: 'refresh_token',
                client_id: appConfig.clientId,
                client_secret: appConfig.clientSecret,
            }
            const options = OAuth2.buildFetchOptions(payload);
            const response = fetch(url, options);
            //Logger.log(response.getResponseCode());
            if (response.responseCode != 200) {
                return null;
            }
            //Logger.log(response.getContentText());
            const token = JSON.parse(response.contentText);
            return token;
        }

        export function concatMultipart(partHeader: string[], data: number[], partFooter: string[]): number[] {
            const multipart = Utilities.newBlob(partHeader.join('\r\n')).getBytes()
                .concat(data).concat(Utilities.newBlob(partFooter.join('\r\n')).getBytes())
            return multipart;
        }

        export function fetch(url: string, options: OAuth2.FetchOptions | Bot.Message.FetchOptions | Bot.Attachment.FetchPostOptions | Bot.Attachment.FetchGetOptions | File.FetchOptions): Util.FetchResponse {
            const params: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
                method: options.method,
                headers: options.headers,
                // muteHttpExceptions: true,
            }
            const payload = options['body'];
            if (payload != undefined) {
                params.payload = payload;
            }
            const contentType = options['contentType'];
            if (contentType != undefined) {
                params.contentType = contentType;
            }
            const followRedirects = options['followRedirects'];
            if (followRedirects != undefined) {
                params.followRedirects = followRedirects;
            }
            //const request = UrlFetchApp.getRequest(url, params);
            //Logger.log(request);
            const response = UrlFetchApp.fetch(url, params);
            //Logger.log(response);
            //Logger.log(response.getResponseCode());
            const fetchResponse: Util.FetchResponse = {
                responseCode: response.getResponseCode(),
            }
            const headers = response.getHeaders();
            if (headers) {
                fetchResponse.headers = headers;
            }
            const contentText = response.getContentText();
            if (contentText) {
                fetchResponse.contentText = contentText;
            }
            const blob = response.getBlob();
            if (blob) {
                fetchResponse.blob = blob;
            }
            return fetchResponse;
        }
    }

    export namespace Util {

        export const ConfigPath = 'private_lineworks.config.json.html';

        /**
         * Lineworks アプリ構成情報
         */
        export interface AppConfig {
            clientId: string,
            clientSecret: string,
            serviceAccount: string,
            privateKey: string,
        }

        /**
         * Lineworks 構成情報をHTMLファイルから取得します。
         * @returns 
         */
        export function getAppConfig(config?: any, readTextFromFile = PlatformG.readTextFromFile): Util.AppConfig {
            if (!config) {
                config = getConfig(Util.ConfigPath, readTextFromFile);
            }
            for (const app of config.apps) {
                if (app.label == config.defaultAppLabel) {
                    return {
                        clientId: app.clientId,
                        clientSecret: app.clientSecret,
                        serviceAccount: app.serviceAccount,
                        privateKey: readTextFromFile(app.privateKeyFilename),
                    }
                }
            }
            throw `Unknown label: "${config.defaultAppLabel}"`;
        }

        export function getConfig(filename = Util.ConfigPath, readTextFromFile = PlatformG.readTextFromFile) {
            const config = JSON.parse(readTextFromFile(filename));
            return config;
        }

        export interface FetchResponse {
            responseCode: number;
            headers?: any;
            contentText?: string;
            blob?: any;
        }
    }

    /**
     * Service Account認証 (JWT)
     * https://developers.worksmobile.com/jp/reference/authorization-sa?lang=ja
     */
    export namespace OAuth2 {

        export interface JwtHeader {
            alg: alg;
            typ: typ;
        };
        export type alg = 'RS256';
        export type typ = 'JWT';

        export interface JwtClaimset {
            iss: string;
            sub: string;
            iat: number;
            exp: number;
        };

        export function buildUrl() {
            return 'https://auth.worksmobile.com/oauth2/v2.0/token';
        }

        export function buildFetchOptions(formBody: formBody): FetchOptions {
            return {
                method: 'post',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formBody,
            };
        }

        export interface FetchOptions {
            method: postMethod;
            headers: {
                'Content-Type': formContentType;
            };
            body: formBody;
        };
        export type postMethod = 'post';
        export type formContentType = 'application/x-www-form-urlencoded';
        export type formBody = RequestBody | RefreshBody;

        export interface RequestBody {
            assertion: string;
            grant_type: string;
            client_id: string;
            client_secret: string;
            scope: string;
        }

        export interface RefreshBody {
            refresh_token: string;
            grant_type: string;
            client_id: string;
            client_secret: string;
        }

        /**
         * Access Token
         */
        export interface Token {
            access_token: string;
            refresh_token?: string;
            scope: string;
            token_type: string,
            expires_in: number,
        }

    }

    /**
     * トークBot API (メッセージ送信)
     * https://developers.worksmobile.com/jp/reference/bot?lang=ja
     */
    export namespace Bot {

        /**
         * トーク共通プロパティ
         * https://developers.worksmobile.com/jp/reference/bot-send-content?lang=ja
         */
        export namespace Content {

            // Text
            // https://developers.worksmobile.com/jp/reference/bot-send-text?lang=ja
            export interface Text {
                content: {
                    type: contentTypeText;
                    text: string;
                    i18nTexts?: i18nTexts;
                };
            };
            export type contentTypeText = 'text';
            export type i18nTexts = i18nText[];
            export type i18nText = {
                language: language;
                text: string;
            };
            export type language = 'ja_JP' | 'ko_KR' | 'zh_CN' | 'zh_TW' | 'en_US';

            export function i18nText(language: language, text: string): i18nText {
                return {
                    language,
                    text,
                }
            }

            export function Text(text: string, i18nTexts?: i18nTexts): Text {
                const payload: Text = {
                    content: {
                        type: 'text',
                        text: text,
                    },
                };
                if (i18nTexts) {
                    payload.content['i18nTexts'] = i18nTexts;
                }
                return payload;
            }

            // Image
            // https://developers.worksmobile.com/jp/reference/bot-send-image?lang=ja
            export type Image = ImageUrl | ImageFileId;
            export interface ImageUrl {
                content: {
                    type: contentTypeImage;
                    previewImageUrl: string;
                    originalContentUrl: string;
                }
            };
            export interface ImageFileId {
                content: {
                    type: contentTypeImage;
                    fileId: string;
                }
            };
            export type contentTypeImage = 'image';

            export function Image(previewImageUrl: string, originalContentUrl: string): Image;
            export function Image(fileId: string): Image;
            export function Image(arg1: string, arg2?: string): Image {
                if (arg2) {
                    // URL 方式
                    const payload: ImageUrl = {
                        content: {
                            type: 'image',
                            previewImageUrl: arg1,
                            originalContentUrl: arg2,
                        },
                    };
                    return payload;
                } else {
                    // ファイル ID 方式
                    const payload: ImageFileId = {
                        content: {
                            type: 'image',
                            fileId: arg1
                        },
                    };
                    return payload;
                }
            }

            export function LinkContent(contentText: string, linkText: string, link: string) {
                // https://developers.worksmobile.com/jp/reference/bot-send-link?lang=ja
                const payload = {
                    content: {
                        type: 'link',
                        contentText: contentText,
                        linkText: linkText,
                        link: link,
                    },
                };
                return payload;
            }

            export function StampContent(packageId: string, stickerId: string) {
                // https://developers.worksmobile.com/jp/reference/bot-send-sticker?lang=ja
                // https://static.worksmobile.net/static/wm/media/message-bot-api/line_works_sticker_list_new.pdf
                const payload = {
                    content: {
                        type: 'sticker',
                        packageId: packageId,
                        stickerId: stickerId,
                    },
                };
                return payload;
            }

            export function ActionUri(label: string, uri: string) {
                const action = {
                    type: 'uri',
                    label: label,
                    uri: uri,
                };
                return action;
            }

            export function AcitionMessage(label: string, postback: string) {
                const action = {
                    type: 'message',
                    label: label,
                    postback: postback,
                };
                return action;
            }

            export function ButtonTemplateContent(contentText: string, actions: any[]) {
                // https://developers.worksmobile.com/jp/reference/bot-send-button?lang=ja
                const payload = {
                    content: {
                        type: 'button_template',
                        contentText: contentText,
                        actions: actions,
                    },
                };
                return payload;
            }

            export function CoverDataImageUri(backgroundImageUrl: string, title?: string, subtitle?: string) {
                const coverData = {
                    backgroundImageUrl: backgroundImageUrl,
                };
                if (title) {
                    coverData['title'] = title;
                }
                if (subtitle) {
                    coverData['subtitle'] = title;
                }
                return coverData;
            }

            export function CoverDataFileId(backgroundFileId: string, title?: string, subtitle?: string) {
                const coverData = {
                    backgroundFileId: backgroundFileId,
                };
                if (title) {
                    coverData['title'] = title;
                }
                if (subtitle) {
                    coverData['subtitle'] = title;
                }
                return coverData;
            }

            export function ElementUri(originalContentUrl: string, title: string, subtitle?: string, action?: any) {
                const element = {
                    title: title,
                    originalContentUrl: originalContentUrl,
                };
                if (subtitle) {
                    element['subtitle'] = subtitle;
                }
                if (action) {
                    element['action'] = action;
                }
                return element;
            }

            export function ElementFileId(fileId: string, title: string, subtitle?: string, action?: any) {
                const element = {
                    title: title,
                    fileId: fileId,
                };
                if (subtitle) {
                    element['subtitle'] = subtitle;
                }
                if (action) {
                    element['action'] = action;
                }
                return element;
            }

            export function ListTemplateContent(contentText: string, elements: any[], actions: any[], coverData?: any) {
                // https://developers.worksmobile.com/jp/reference/bot-send-list?lang=ja
                const payload = {
                    content: {
                        type: 'list_template',
                        elements: elements,
                        actions: [actions]
                    },
                };
                if (coverData) {
                    payload.content['coverData'] = coverData;
                }
                return payload;
            }

            export function FileUrlContent(originalContentUrl: string) {
                // https://developers.worksmobile.com/jp/reference/bot-send-file?lang=ja
                const payload = {
                    content: {
                        type: 'file',
                        originalContentUrl: originalContentUrl,
                    },
                };
                return payload;
            }

            export function FileIdContent(fileId: string) {
                // https://developers.worksmobile.com/jp/reference/bot-send-file?lang=ja
                const payload = {
                    content: {
                        type: 'file',
                        fileId: fileId,
                    },
                };
                return payload;
            }

        }

        /**
         * メッセージ送信
         */
        export namespace Message {
            // https://developers.worksmobile.com/jp/reference/bot-user-message-send?lang=ja
            export function buildUrlSendToUser(botId: string, userId: string) {
                return `https://www.worksapis.com/v1.0/bots/${botId}/users/${userId}/messages`;
            }
            // https://developers.worksmobile.com/jp/reference/bot-channel-message-send?lang=ja
            export function buildUrlSendToChannel(botId: string, channelId: string) {
                return `https://www.worksapis.com/v1.0/bots/${botId}/channels/${channelId}/messages`;
            }
            export function buildFetchOptions(accessToken: string, content: content): FetchOptions {
                return {
                    method: 'post',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(content),
                };
            }
            export interface FetchOptions {
                method: postMethod;
                headers: {
                    'Authorization': string;
                    'Content-Type': jsonContentType;
                };
                body: string;
            };
            export type postMethod = 'post';
            export type jsonContentType = 'application/json';
            export type content = Bot.Content.Text | Bot.Content.Image | any;

            // メッセージ送信 - ユーザー
            // https://developers.worksmobile.com/jp/reference/bot-user-message-send?lang=ja
            export function sendToUser(userId: string, payload: any, botId: string, accessToken: string, fetch = PlatformG.fetch) {
                const url = buildUrlSendToUser(botId, userId);
                const options = buildFetchOptions(accessToken, payload);
                const response = fetch(url, options);
                return response;
            }

            // メッセージ送信 - トークルーム
            // https://developers.worksmobile.com/jp/reference/bot-channel-message-send?lang=ja
            export function sendToChannel(channelId: string, payload: any, botId: string, accessToken: string, fetch = PlatformG.fetch) {
                const url = buildUrlSendToChannel(botId, channelId);
                const options = buildFetchOptions(accessToken, payload);
                const response = fetch(url, options);
                return response;
            }
        }

        export namespace Attachment {
            export function buildUrlPost(botId: string) {
                return `https://www.worksapis.com/v1.0/bots/${botId}/attachments`;
            }
            export function buildFetchPostOptions(accessToken: string, content: content): FetchPostOptions {
                return {
                    method: 'post',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(content),
                };
            }
            export interface FetchPostOptions {
                method: postMethod;
                headers: {
                    'Authorization': string;
                    'Content-Type': jsonContentType;
                };
                body: string;
            };
            export type postMethod = 'post';
            export type jsonContentType = 'application/json';
            export interface content {
                fileName: string;
            };

            export interface FileInfo {
                fileId: string;
                uploadUrl: string;
            }

            /**
             * コンテンツアップロード (fileIdとuploadUrlの生成)
             * https://developers.worksmobile.com/jp/reference/bot-attachment-create?lang=ja
             * @param fileName 
             * @param botId 
             * @param access_token 
             * @returns 
             */
            export function createFile(fileName: string, botId: string, access_token: string, fetch = PlatformG.fetch): FileInfo {
                const url = buildUrlPost(botId);
                const payload: content = {
                    fileName: fileName,
                }
                const options = buildFetchPostOptions(access_token, payload);
                const response = fetch(url, options);
                //Logger.log(response);
                const contentText = response.contentText;
                //Logger.log(contentText)
                const content = JSON.parse(contentText);
                return content;
            }

            export function buildUrlGet(botId: string, fileId: string) {
                return `https://www.worksapis.com/v1.0/bots/${botId}/attachments/${fileId}`;
            }
            export function buildFetchGetOptions(accessToken: string, followRedirects: boolean): FetchGetOptions {
                return {
                    method: 'get',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                    followRedirects: followRedirects,
                };
            }
            export interface FetchGetOptions {
                method: getMethod;
                headers: {
                    'Authorization': string;
                };
                followRedirects: boolean;
            };
            export type getMethod = 'get';

            /**
             * コンテンツダウンロード (ダウンロードするためのURLを取得)
             * https://developers.worksmobile.com/jp/reference/bot-attachment-get?lang=ja
             * @param fileId 
             * @param botId 
             * @param access_token 
             * @param followRedirects trueの場合、ファイルをダウンロードする。falseの場合、ダウンロードURLを返す
             * @returns ダウンロードしたファイル または ダウンロードURL(Location)
             */
            export function getFileLocation(fileId: string, botId: string, access_token: string, followRedirects = false, fetch = PlatformG.fetch) {
                const url = buildUrlGet(botId, fileId);
                const options = buildFetchGetOptions(access_token, followRedirects);
                const response = fetch(url, options);
                //Logger.log(response);
                if (followRedirects) {
                    return response.blob;
                }
                const locationUrl = response.headers['Location']
                return locationUrl;
            }

        }

        /**
         * メッセージ(Callback) 受信
         * https://developers.worksmobile.com/jp/reference/bot-callback?lang=ja
         */
        export namespace Callback {
            export type EventType = (MessageType | JoinType | LeaveType | JoinedType | LeftType | PostbackType);
            export type MessageType = 'message';    // メンバーからのメッセージ
            export type JoinType = 'join';          // Bot が複数人トークルームに招待された
            export type LeaveType = 'leave';        // Bot が複数人トークルームから退室した
            export type JoinedType = 'joined';      // メンバーが Bot のいる複数人トークルームに参加した
            export type LeftType = 'left';          // メンバーが Bot のいる複数人トークルームから退室した
            export type PostbackType = 'postback';  // postback タイプのメッセージ
            export interface Event {
                type: EventType;        // "message", "join", "leave", "joined", "left", "postback"
                issuedTime: string;     // メッセージが作成された日時。(YYYY-MM-DDThh:mm:ss.SSSZ)
            }
            // https://developers.worksmobile.com/jp/reference/bot-callback-message?lang=ja
            export type MessageContentType = TextMessageContentType     // "text"     テキスト  全バージョンで対応
                | LocationMessageContentType // "location" 位置情報  全バージョンで対応
                | StickerMessageContentType  // "sticker"  スタンプ  v2.3 以降で対応
                | ImageMessageContentType    // "image"    画像      v2.3 以降で対応
                | FileMessageContentType;    // "file"     ファイル  v2.9 以降で対応
            export interface Message extends Event {
                type: MessageType;                  // 固定:"message"
                source: {                           // メッセージ送信者の情報
                    userId: string;                 // 送信元メンバーアカウント
                    channelId?: string;             // 送信したトークルーム ID
                    domainId: number;               // 送信したドメイン ID
                };
                content: {                          // メッセージの内容
                    type: MessageContentType;       // "text", "location", "sticker", "image", "file"
                };
            }
            export type TextMessageContentType = 'text';
            export interface TextMessage extends Message {
                content: {
                    type: TextMessageContentType;       // 固定:"text"
                    text: string;                       // メッセージ本文
                    postback?: string;                  // postback メッセージ (ボタンなどのテンプレート利用時)
                }
            }
            export type LocationMessageContentType = 'location';
            export interface LocationMessage extends Message {
                content: {                              // メッセージの内容
                    type: LocationMessageContentType;   // 固定:"location"
                    address: string;                    // メンバーが送信した位置情報(住所)
                    latitude: number;                   // メンバーが送信した位置情報(緯度)
                    longitude: number;                  // メンバーが送信した位置情報(経度)
                }
            }
            export type StickerMessageContentType = 'sticker';
            export interface StickerMessage extends Message {
                content: {                              // メッセージの内容
                    type: StickerMessageContentType;    // 固定:"sticker"
                    packageId: string;                  // パッケージ ID
                    stickerId: string;                  // スタンプ ID
                }
            }
            export type ImageMessageContentType = 'image';
            export interface ImageMessage extends Message {
                content: {                              // メッセージの内容
                    type: ImageMessageContentType;      // 固定:"image"
                    fileId: string;                     // リソース ID
                }
            }
            export type FileMessageContentType = 'file';
            export interface FileMessage extends Message {
                content: {                              // メッセージの内容
                    type: FileMessageContentType;       // 固定:"file"
                    fileId: string;                     // リソース ID
                }
            }
        }
    }

    /**
     * ファイルアップロード / ダウンロード
     * https://developers.worksmobile.com/jp/reference/file-upload?lang=ja
     */
    export namespace File {

        export function buildPart(partBoundary: string, filename: string, contentType: string, data: number[], concat = PlatformG.concatMultipart) {
            const partHeader = [
                `--${partBoundary}`,
                `Content-Disposition: form-data; name="Filedata"; filename="${filename}"`,
                `Content-Type: ${contentType}`,
                '',
                '',
            ];
            const partFooter = [
                '',
                `--${partBoundary}--`,
                ''
            ];
            const multipart = concat(partHeader, data, partFooter);
            return multipart;
        }

        export function buildFetchOptions(partBoundary: string, multipart: number[]): FetchOptions {
            return {
                method: 'post',
                contentType: `multipart/form-data; boundary=${partBoundary}`,
                headers: {
                    Authorization: 'Bearer ...,',
                },
                body: multipart,
            };

        }
        export interface FetchOptions {
            method: postMethod;
            contentType: string,
            headers: {
                Authorization: string,
            },
            body: content,

        }
        export type postMethod = 'post';
        export type content = number[];

        export function upload(uploadUrl: string, data: number[], contentType: string, filename: string, concat = PlatformG.concatMultipart, fetch = PlatformG.fetch) {
            // Blob
            // https://developers.google.com/apps-script/reference/utilities/utilities#newBlob(Byte,String,String)

            // // 参考: https://qiita.com/asmasa/items/4fd7b5f3f3d1a33984b3#%E7%B5%90%E8%AB%96
            // const blob = Utilities.newBlob(data, contentType, filename);
            // const params: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
            //     method: 'post',
            //     headers: {
            //         'Authorization': 'Bearer ...',
            //     },
            //     payload: {
            //         Filedata: blob
            //     },
            // }

            // 参考: https://www.labnol.org/code/20096-upload-files-multipart-post
            const partBoundary = '--------------u1p2l3o4a5d6f7i8l9e0d1a2t3a';
            const multipart = buildPart(partBoundary, filename, contentType, data, concat);
            const options = buildFetchOptions(partBoundary, multipart);
            const response = fetch(uploadUrl, options);
            const contentText = response.contentText;
            const content = JSON.parse(contentText);
            return content;
        }

    }
}

export default Lineworks;