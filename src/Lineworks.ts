/**
 * LINE WORKS API 2.0
 * https://developers.worksmobile.com/jp/reference/introduction?lang=ja
 */
namespace Lineworks {
    export namespace PlatformG {
        export function fetch(url: string, options: Bot.Message.FetchOptions) {
            const params: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
                method: options.method,
                headers: options.headers,
                payload: JSON.stringify(options.body),
            }
            //const request = UrlFetchApp.getRequest(url, params);
            //Logger.log(request);
            const response = UrlFetchApp.fetch(url, params);
            //Logger.log(response);
            //Logger.log(response.getResponseCode());
            return response
        }
    }

    export namespace PlatformN {
        export function fetch(url: string, options: Bot.Message.FetchOptions) {
            //
        }
    }
    export namespace Util {

        /**
         * 構成情報の取得
         * @returns 
         */
        export function getConfig(): any {
            const pathConfig = 'private_lineworks.config.json.html';
            const config = JSON.parse(HtmlService.createHtmlOutputFromFile(pathConfig.slice(0, -5)).getContent());
            return config;
        }

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
        export function getAppConfig(): AppConfig {
            const config = getConfig();
            for (const app of config.apps) {
                if (app.label == config.defaultAppLabel) {
                    const privateKey = HtmlService.createHtmlOutputFromFile(app.privateKeyFilename.slice(0, -5)).getContent();
                    return {
                        clientId: app.clientId,
                        clientSecret: app.clientSecret,
                        serviceAccount: app.serviceAccount,
                        privateKey: privateKey,
                    }
                }
            }
            throw `Unknown label: "${config.defaultAppLabel}"`;
        }

        /**
         * Jwtを生成します。
         * @param clientId 
         * @param serviceAccount 
         * @param privateKey 
         * @param expIn 
         * @returns 
         */
        export function getJwtRs256(clientId: string, serviceAccount: string, privateKey: string, expIn: number = 3600): string {
            const iat: number = Math.floor(Date.now() / 1000);
            const exp: number = iat + expIn;
            const payload = {
                iss: clientId,
                sub: serviceAccount,
                iat: iat,
                exp: exp,
            };
            const header = {
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

        /**
         * FormDataのpost
         * @param url 
         * @param payload 
         * @returns 
         */
        export function postForm(url: string, payload: any) {
            const params: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
                method: 'post',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                payload: payload
            }
            const response = UrlFetchApp.fetch(url, params);
            return response;
        }

        /**
         * Json形式でのPost
         * @param url 
         * @param payload 
         * @param access_token 
         * @returns 
         */
        export function postJson(url: string, payload: any, access_token: string) {
            const params: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
                method: 'post',
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                    'Content-Type': 'application/json',
                },
                payload: JSON.stringify(payload)
            }
            //const request = UrlFetchApp.getRequest(url, params);
            //Logger.log(request);
            const response = UrlFetchApp.fetch(url, params);
            //Logger.log(response);
            return response
        }

        /**
         * multipart/form-dataでpost (ファイルアップロード)
         * @param url 
         * @param data 
         * @param contentType 
         * @param filename 
         * @returns 
         */
        export function postFiledata(url: string, data: number[], contentType: string, filename: string) {
            // ファイルアップロード / ダウンロード
            // https://developers.worksmobile.com/jp/reference/file-upload?lang=ja

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
            const partBoundary = "--------------u1p2l3o4a5d6f7i8l9e0d1a2t3a";
            const partHeader = [
                `--${partBoundary}`,
                `Content-Disposition: form-data; name="Filedata"; filename="${filename}"`,
                `Content-Type: ${contentType}`,
                '',
                '',
            ];
            const partFooter = [
                '',
                '--${boudary}--',
                ''
            ];
            const multipart = Utilities.newBlob(partHeader.join('\r\n')).getBytes()
                .concat(data).concat(Utilities.newBlob(partFooter.join('\r\n')).getBytes())
            const params: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
                method: 'post',
                contentType: `multipart/form-data; boundary=${partBoundary}`,
                headers: {
                    Authorization: 'Bearer ...,',
                },
                payload: multipart,
            };

            //const request = UrlFetchApp.getRequest(url, params);
            //Logger.log(request);
            const response = UrlFetchApp.fetch(url, params);
            //Logger.log(response);
            return response

        }

        /**
         * ファイルダウンロード (ダウンロードまたはダウンロードURLの取得)
         * @param url 
         * @param access_token 
         * @param followRedirects trueの場合、ダウンロードしたファイルのBlobを返し、falseの場合、ダウンロードURL(Location)を返す。
         * @returns 
         */
        export function getFile(url: string, access_token: string, followRedirects: boolean) {
            // ファイルアップロード / ダウンロード
            // https://developers.worksmobile.com/jp/reference/file-upload?lang=ja
            const params: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
                method: 'get',
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                },
                followRedirects: followRedirects,
            }
            const response = UrlFetchApp.fetch(url, params);
            //Logger.log(response);
            if (followRedirects) {
                return response;
            }
            const locationUrl = response.getHeaders()['Location']
            return locationUrl;
        }

    }

    /**
     * Service Account認証 (JWT)
     * https://developers.worksmobile.com/jp/reference/authorization-sa?lang=ja
     */
    export namespace OAuth2 {

        /**
         * Access Token
         */
        export interface token {
            access_token: string;
            refresh_token?: string;
            scope: string;
            token_type: string,
            expires_in: number,
        }

        /**
         * Access Tokenの再発行
         * https://developers.worksmobile.com/jp/reference/authorization-auth?lang=ja
         * @param refresh_token 
         * @returns 
         */
        export function refreshJwtAccessToken(refresh_token: string): token {
            const param = Util.getAppConfig();
            const url: string = 'https://auth.worksmobile.com/oauth2/v2.0/token'
            const payload = {
                refresh_token: refresh_token,
                grant_type: 'refresh_token',
                client_id: param.clientId,
                client_secret: param.clientSecret,
            }
            const response = Util.postForm(url, payload);
            //Logger.log(response.getResponseCode());
            if (response.getResponseCode() != 200) {
                return null;
            }
            //Logger.log(response.getContentText());
            const token = JSON.parse(response.getContentText());
            return token;
        }

        /**
         * Service Account認証 (JWT)を使用したAccess Tokenを取得します。
         * https://developers.worksmobile.com/jp/reference/authorization-sa?lang=ja
         * @param scopes 
         * @returns 
         */
        export function getJwtAccessToken(scopes: string = 'bot'): token {
            const param = Util.getAppConfig();
            // JWTの生成
            const jwt = Util.getJwtRs256(param.clientId, param.serviceAccount, param.privateKey);
            //Logger.log(jwt);
            // Access Tokenの発行
            const accessToken = getNewJwtAccessToken(jwt, param.clientId, param.clientSecret, scopes);
            //Logger.log(accessToken);
            return accessToken;
        }

        /**
         * 新規にAccess Tokenを取得します。
         * @param jwt 
         * @param clientId 
         * @param clientSecret 
         * @param scopes 
         * @returns 
         */
        function getNewJwtAccessToken(jwt: string, clientId: string, clientSecret: string, scopes: string): token {
            const url: string = 'https://auth.worksmobile.com/oauth2/v2.0/token'
            const payload = {
                assertion: jwt,
                grant_type: encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer'),
                client_id: clientId,
                client_secret: clientSecret,
                scope: scopes,
            }
            const response = Util.postForm(url, payload);
            //Logger.log(response.getResponseCode());
            if (response.getResponseCode() != 200) {
                return null;
            }
            //Logger.log(response.getContentText());
            const token = JSON.parse(response.getContentText());
            return token;
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
                            type: "image",
                            previewImageUrl: arg1,
                            originalContentUrl: arg2,
                        },
                    };
                    return payload;
                } else {
                    // ファイル ID 方式
                    const payload: ImageFileId = {
                        content: {
                            type: "image",
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
                        type: "link",
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
                        type: "sticker",
                        packageId: packageId,
                        stickerId: stickerId,
                    },
                };
                return payload;
            }

            export function ActionUri(label: string, uri: string) {
                const action = {
                    "type": "uri",
                    label: label,
                    uri: uri,
                };
                return action;
            }

            export function AcitionMessage(label: string, postback: string) {
                const action = {
                    "type": "message",
                    label: label,
                    postback: postback,
                };
                return action;
            }

            export function ButtonTemplateContent(contentText: string, actions: any[]) {
                // https://developers.worksmobile.com/jp/reference/bot-send-button?lang=ja
                const payload = {
                    content: {
                        type: "button_template",
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
                    coverData["title"] = title;
                }
                if (subtitle) {
                    coverData["subtitle"] = title;
                }
                return coverData;
            }

            export function CoverDataFileId(backgroundFileId: string, title?: string, subtitle?: string) {
                const coverData = {
                    backgroundFileId: backgroundFileId,
                };
                if (title) {
                    coverData["title"] = title;
                }
                if (subtitle) {
                    coverData["subtitle"] = title;
                }
                return coverData;
            }

            export function ElementUri(originalContentUrl: string, title: string, subtitle?: string, action?: any) {
                const element = {
                    title: title,
                    originalContentUrl: originalContentUrl,
                };
                if (subtitle) {
                    element["subtitle"] = subtitle;
                }
                if (action) {
                    element["action"] = action;
                }
                return element;
            }

            export function ElementFileId(fileId: string, title: string, subtitle?: string, action?: any) {
                const element = {
                    title: title,
                    fileId: fileId,
                };
                if (subtitle) {
                    element["subtitle"] = subtitle;
                }
                if (action) {
                    element["action"] = action;
                }
                return element;
            }

            export function ListTemplateContent(contentText: string, elements: any[], actions: any[], coverData?: any) {
                // https://developers.worksmobile.com/jp/reference/bot-send-list?lang=ja
                const payload = {
                    content: {
                        type: "list_template",
                        elements: elements,
                        actions: [actions]
                    },
                };
                if (coverData) {
                    payload.content["coverData"] = coverData;
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
            export function BuildUrlSendToUser(botId: string, userId: string) {
                return `https://www.worksapis.com/v1.0/bots/${botId}/users/${userId}/messages`;
            }
            // https://developers.worksmobile.com/jp/reference/bot-channel-message-send?lang=ja
            export function BuildUrlSendToChannel(botId: string, channelId: string) {
                return `https://www.worksapis.com/v1.0/bots/${botId}/channels/${channelId}/messages`;
            }
            export function BuildFetchOptions(accessToken: string, content: content): FetchOptions {
                return {
                    method: 'post',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: content,
                };
            }
            export interface FetchOptions {
                method: postMethod;
                headers: {
                    'Authorization': string;
                    'Content-Type': jsonContentType;
                };
                body: content;
            };
            export type postMethod = 'post';
            export type jsonContentType = 'application/json';
            export type content = Bot.Content.Text | Bot.Content.Image | any;

            // メッセージ送信 - ユーザー
            // https://developers.worksmobile.com/jp/reference/bot-user-message-send?lang=ja
            export function sendToUser(userId: string, payload: any, botId: string, accessToken: string) {
                const url = BuildUrlSendToUser(botId, userId);
                const options = BuildFetchOptions(accessToken, payload);
                PlatformG.fetch(url, options);
            }

            // メッセージ送信 - トークルーム
            // https://developers.worksmobile.com/jp/reference/bot-channel-message-send?lang=ja
            export function sendToChannel(channelId: string, payload: any, botId: string, accessToken: string) {
                const url = BuildUrlSendToChannel(botId, channelId);
                const options = BuildFetchOptions(accessToken, payload);
                PlatformG.fetch(url, options);
            }
        }

        export namespace Attachment {

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
            export function createFile(fileName: string, botId: string, access_token: string): FileInfo {
                const url = `https://www.worksapis.com/v1.0/bots/${botId}/attachments`;
                const payload = {
                    fileName: fileName,
                }
                const response = Util.postJson(url, payload, access_token);
                //Logger.log(response);
                const contentText = response.getContentText();
                //Logger.log(contentText)
                const content = JSON.parse(contentText);
                return content;
            }

            /**
             * コンテンツダウンロード (ダウンロードするためのURLを取得)
             * https://developers.worksmobile.com/jp/reference/bot-attachment-get?lang=ja
             * @param fileId 
             * @param botId 
             * @param access_token 
             * @param followRedirects trueの場合、ファイルをダウンロードする。falseの場合、ダウンロードURLを返す
             * @returns ダウンロードしたファイル または ダウンロードURL(Location)
             */
            export function getFile(fileId: string, botId: string, access_token: string, followRedirects = true) {
                const url = `https://www.worksapis.com/v1.0/bots/${botId}/attachments/${fileId}`;
                return Util.getFile(url, access_token, followRedirects);
            }

        }
    }

    /**
     * ファイルアップロード / ダウンロード
     * https://developers.worksmobile.com/jp/reference/file-upload?lang=ja
     */
    export namespace File {

        /**
         * 
         * @param uploadUrl 
         * @param data 
         * @param contentType 
         * @param filename 
         */
        export function upload(uploadUrl: string, data: number[], contentType: string, filename: string) {
            const response = Util.postFiledata(uploadUrl, data, contentType, filename);
            const contentText = response.getContentText();
            //Logger.log(contentText)
            const content = JSON.parse(contentText);
            return content;
        }

    }
}

export default Lineworks;