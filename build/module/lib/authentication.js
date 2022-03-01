import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import { default as cryptoRandomString } from 'crypto-random-string';
import * as request from 'request-promise';
import { default as polka } from 'polka';
import * as CryptoJS from 'crypto-js';
import chalk from 'chalk';
export const AUTHKEY = 'SIMBAAUTH';
const authHtml = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'html', 'authResult.html'));
export class LoginServer {
    constructor(config, projectConfig, logger) {
        this.closeTimeout = 5 * 1000;
        this.port = 22315;
        this.scope = 'openid offline_access read_write';
        this.server = null;
        this.config = config;
        this.projectConfig = projectConfig;
        this.scope = this.projectConfig.get('authScope');
        this.scope = encodeURI(this.scope);
        this.clientID = this.projectConfig.get('clientID');
        this.logger = logger;
        this.baseUrl = this.projectConfig.get('baseUrl');
        this.tokenUrl = this.setConfig('tokenUrl', this.projectConfig.get('tokenUrl'));
        this._authorizeUrl = this.setConfig('authorizeUrl', this.projectConfig.get('authorizeUrl'));
    }
    get authorizeUrl() {
        this.generatePKCE();
        return `${this._authorizeUrl}?client_id=${this.clientID}&redirect_uri=${this.redirectUri}&response_type=code&state=${this.state}&scope=${this.scope}&code_challenge=${this.pkceChallenge}&code_challenge_method=S256`;
    }
    get isLoggedIn() {
        return this.hasConfig(AUTHKEY);
    }
    get configBase() {
        if (!this._configBase) {
            this._configBase = this.baseUrl.split('.').join('_');
        }
        return this._configBase;
    }
    dispose() {
        if (this.server) {
            this.server.unref();
            this.server.close();
        }
    }
    async performLogin() {
        this.state = cryptoRandomString({ length: 24, type: 'url-safe' });
        return this.performLoginViaIntegratedWebserver();
    }
    closeServer() {
        setTimeout(() => {
            if (this.server) {
                this.server.close();
            }
        }, this.closeTimeout);
    }
    async performLoginViaIntegratedWebserver() {
        return new Promise((resolve, reject) => {
            // clear out old auth
            this.deleteConfig(AUTHKEY);
            if (this.server) {
                reject(new Error('Auth already in progress!'));
            }
            this.server = http.createServer();
            this.server.on('close', () => {
                if (this.server) {
                    this.server = null;
                }
                resolve();
            });
            polka({ server: this.server })
                .get('/auth-callback/', (req, res) => {
                const code = Array.isArray(req.query.code) ? req.query.code[0] : req.query.code;
                const state = Array.isArray(req.query.state) ? req.query.state[0] : req.query.state;
                const error = Array.isArray(req.query.error) ? req.query.error[0] : req.query.error;
                res.on('finish', () => {
                    this.closeServer();
                });
                this.receiveCode(code, state, error)
                    .then(() => {
                    res.writeHead(302, { Location: '/' });
                    res.end();
                })
                    .catch((err) => {
                    res.writeHead(302, { Location: `/?error=${Buffer.from(err).toString('base64')}` });
                    res.end();
                });
            })
                .get('/', (_req, res) => {
                res.writeHead(200, {
                    'Content-Length': authHtml.length,
                    'Content-Type': 'text/html; charset=utf-8',
                });
                res.end(authHtml.toString());
            })
                .listen(this.port, (err) => {
                if (err) {
                    throw err;
                }
                this.redirectUri = encodeURIComponent(`http://localhost:${this.port}/auth-callback/`);
                this.logger.info('Please navigate to ' + chalk.underline(this.authorizeUrl) + ' to log in.');
            });
        });
    }
    refreshToken() {
        return new Promise((resolve, reject) => {
            const auth = this.getConfig(AUTHKEY);
            console.log(auth);
            if (auth) {
                if (!auth.refresh_token) {
                    this.deleteConfig(AUTHKEY);
                    reject(new Error('Not authenticated!'));
                }
                if ('expires_at' in auth) {
                    const expiresAt = new Date(auth.expires_at);
                    if (expiresAt <= new Date()) {
                        const option = {
                            uri: this.tokenUrl,
                            method: 'POST',
                            json: true,
                            form: {
                                client_id: this.clientID,
                                grant_type: 'refresh_token',
                                refresh_token: auth.refresh_token,
                            },
                        };
                        request
                            .post(option)
                            .then((resp) => {
                            this.setConfig(AUTHKEY, this.parseExpiry(resp));
                            resolve(true);
                        })
                            .catch((err) => {
                            reject(err);
                        });
                    }
                    else {
                        // Refresh not required
                        resolve(false);
                    }
                }
                else {
                    // Refresh not required
                    resolve(false);
                }
            }
            else {
                reject(new Error('Not authenticated!'));
            }
        });
    }
    parseExpiry(auth) {
        if ('expires_in' in auth) {
            const retrievedAt = new Date();
            const expiresIn = parseInt(auth.expires_in, 10) * 1000;
            const expiresAt = new Date(Date.parse(retrievedAt.toISOString()) + expiresIn);
            auth.retrieved_at = retrievedAt.toISOString();
            auth.expires_at = expiresAt.toISOString();
        }
        return auth;
    }
    async receiveCode(code, state, error) {
        if (state !== this.state) {
            this.logger.error(chalk.red('Error logging in to SIMBAChain: state does not match'));
            return Promise.reject('Error logging in to SIMBAChain: state does not match');
        }
        else if (error) {
            this.logger.error(chalk.red('Unknown Error logging in to SIMBAChain: ' + error));
            return Promise.reject('Unknown Error logging in to SIMBAChain: ' + error);
        }
        else if (!code) {
            this.logger.error(chalk.red('Error logging in to SIMBAChain: missing auth code'));
            return Promise.reject('Error logging in to SIMBAChain: missing auth code');
        }
        else {
            let uri = '';
            if (this.redirectUri) {
                uri = decodeURIComponent(this.redirectUri);
            }
            const option = {
                uri: this.tokenUrl,
                method: 'POST',
                json: true,
                form: {
                    grant_type: 'authorization_code',
                    redirect_uri: decodeURIComponent(uri),
                    code_verifier: this.pkceVerifier,
                    client_id: this.clientID,
                    code,
                },
            };
            return request
                .post(option)
                .then(async (resp) => {
                this.setConfig(AUTHKEY, this.parseExpiry(resp));
                this.logger.info(chalk.green('Logged In!'));
            })
                .catch(async (err) => {
                this.logger.error(chalk.red('Error logging in to SIMBAChain: Token Exchange Error: ' + err));
                return Promise.reject('Error logging in to SIMBAChain: Token Exchange Error:' + err);
            });
        }
    }
    getClientOptions(url, contentType = 'application/json', data) {
        const auth = this.getConfig(AUTHKEY);
        if (!url.startsWith('http')) {
            url = this.baseUrl + url;
        }
        return this.refreshToken().then(() => {
            const opts = {
                uri: url,
                headers: {
                    'Content-Type': contentType,
                    Accept: 'application/json',
                    Authorization: `${auth.token_type} ${auth.access_token}`,
                },
                json: true,
            };
            if (data) {
                opts.body = data;
            }
            return opts;
        });
    }
    async doGetRequest(url, contentType) {
        return this.retryAfterTokenRefresh(url, request.get, contentType);
    }
    async doPostRequest(url, data, contentType) {
        return this.retryAfterTokenRefresh(url, request.post, contentType, data);
    }
    logout() {
        this.deleteConfig(AUTHKEY);
    }
    hasConfig(key) {
        if (!this.config.has(this.configBase)) {
            return false;
        }
        return key in this.config.get(this.configBase);
    }
    getConfig(key) {
        if (!this.config.has(this.configBase)) {
            return;
        }
        const dict = this.config.get(this.configBase);
        if (!(key in dict)) {
            return;
        }
        let _config = dict[key];
        console.log(_config);
        return dict[key];
    }
    getOrSetConfig(key, value) {
        if (!this.hasConfig(key)) {
            this.setConfig(key, value);
            return value;
        }
        return this.getConfig(key);
    }
    setConfig(key, value) {
        if (!this.config.has(this.configBase)) {
            // NOTE(Adam): This should never be the case since it is created in the constructor
            this.config.set(this.configBase, {});
        }
        const dict = this.config.get(this.configBase);
        dict[key] = value;
        this.config.set(this.configBase, dict);
        return value;
    }
    deleteConfig(key) {
        if (!this.config.has(this.baseUrl.replace('.', '_'))) {
            return;
        }
        const dict = this.config.get(this.configBase);
        if (!(key in dict)) {
            return;
        }
        delete dict[key];
        this.config.set(this.configBase, dict);
    }
    generatePKCE() {
        this.pkceVerifier = cryptoRandomString({ length: 24, type: 'url-safe' });
        const hash = CryptoJS.SHA256(this.pkceVerifier);
        const b64 = this.base64URL(hash.toString(CryptoJS.enc.Base64));
        this.pkceChallenge = b64;
    }
    async retryAfterTokenRefresh(url, call, contentType, data) {
        let opts = await this.getClientOptions(url, contentType, data);
        try {
            return call(opts);
        }
        catch (e) {
            if (e.statusCode === 403 || e.statusCode === '403') {
                await this.refreshToken();
                opts = await this.getClientOptions(url, contentType, data);
                return call(opts);
            }
            if ('errors' in e && Array.isArray(e.errors)) {
                if (e.errors[0].status === '403' &&
                    e.errors[0].code === '1403' &&
                    e.errors[0].detail === '{"error":"Access token not found"}\n') {
                    await this.refreshToken();
                    opts = await this.getClientOptions(url, contentType, data);
                    return call(opts);
                }
            }
            throw e;
        }
    }
    base64URL(str) {
        return str
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aGVudGljYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL2F1dGhlbnRpY2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBSyxFQUFFLE1BQU0sSUFBSSxDQUFDO0FBQ3pCLE9BQU8sS0FBSyxJQUFJLE1BQU0sTUFBTSxDQUFDO0FBQzdCLE9BQU8sS0FBSyxJQUFJLE1BQU0sTUFBTSxDQUFDO0FBRTdCLE9BQU8sRUFBQyxPQUFPLElBQUksa0JBQWtCLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUNuRSxPQUFPLEtBQUssT0FBTyxNQUFNLGlCQUFpQixDQUFDO0FBQzNDLE9BQU8sRUFBVSxPQUFPLElBQUksS0FBSyxFQUFDLE1BQU0sT0FBTyxDQUFDO0FBQ2hELE9BQU8sS0FBSyxRQUFRLE1BQU0sV0FBVyxDQUFDO0FBQ3RDLE9BQU8sS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUUxQixNQUFNLENBQUMsTUFBTSxPQUFPLEdBQUcsV0FBVyxDQUFDO0FBRW5DLE1BQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLGlCQUFpQixDQUFDLENBQUMsQ0FBQztBQUVwRyxNQUFNLE9BQU8sV0FBVztJQWdCcEIsWUFBbUIsTUFBbUIsRUFBRSxhQUEwQixFQUFFLE1BQWU7UUFmbEUsaUJBQVksR0FBVyxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQ3pDLFNBQUksR0FBRyxLQUFLLENBQUM7UUFDYixVQUFLLEdBQUcsa0NBQWtDLENBQUM7UUFDM0MsV0FBTSxHQUF1QixJQUFJLENBQUM7UUFhdEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7UUFDbkMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNqRCxJQUFJLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbkMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNuRCxJQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUNyQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2pELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUMvRSxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7SUFDaEcsQ0FBQztJQUlELElBQVcsWUFBWTtRQUNuQixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDcEIsT0FBTyxHQUFHLElBQUksQ0FBQyxhQUFhLGNBQWMsSUFBSSxDQUFDLFFBQVEsaUJBQWlCLElBQUksQ0FBQyxXQUFXLDZCQUE2QixJQUFJLENBQUMsS0FBSyxVQUFVLElBQUksQ0FBQyxLQUFLLG1CQUFtQixJQUFJLENBQUMsYUFBYSw2QkFBNkIsQ0FBQztJQUMxTixDQUFDO0lBRUQsSUFBVyxVQUFVO1FBQ2pCLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBSUQsSUFBYyxVQUFVO1FBQ3BCLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ25CLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ3hEO1FBQ0QsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDO0lBQzVCLENBQUM7SUFFTSxPQUFPO1FBQ1YsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ2IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNwQixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1NBQ3ZCO0lBQ0wsQ0FBQztJQUVNLEtBQUssQ0FBQyxZQUFZO1FBQ3JCLElBQUksQ0FBQyxLQUFLLEdBQUcsa0JBQWtCLENBQUMsRUFBQyxNQUFNLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUMsQ0FBQyxDQUFDO1FBRWhFLE9BQU8sSUFBSSxDQUFDLGtDQUFrQyxFQUFFLENBQUM7SUFDckQsQ0FBQztJQUVNLFdBQVc7UUFDZCxVQUFVLENBQUMsR0FBRyxFQUFFO1lBQ1osSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNiLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7YUFDdkI7UUFDTCxDQUFDLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQzFCLENBQUM7SUFFTSxLQUFLLENBQUMsa0NBQWtDO1FBQzNDLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDbkMscUJBQXFCO1lBQ3JCLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFM0IsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNiLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUM7YUFDbEQ7WUFFRCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUVsQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFO2dCQUN6QixJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7b0JBQ2IsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7aUJBQ3RCO2dCQUNELE9BQU8sRUFBRSxDQUFDO1lBQ2QsQ0FBQyxDQUFDLENBQUM7WUFFSCxLQUFLLENBQUMsRUFBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBQyxDQUFDO2lCQUN2QixHQUFHLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxHQUFZLEVBQUUsR0FBd0IsRUFBRSxFQUFFO2dCQUMvRCxNQUFNLElBQUksR0FBVyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQztnQkFDeEYsTUFBTSxLQUFLLEdBQVcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7Z0JBQzVGLE1BQU0sS0FBSyxHQUFXLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDO2dCQUU1RixHQUFHLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUU7b0JBQ2xCLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztnQkFDdkIsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQztxQkFDL0IsSUFBSSxDQUFDLEdBQUcsRUFBRTtvQkFDUCxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxFQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUMsQ0FBQyxDQUFDO29CQUNwQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ2QsQ0FBQyxDQUFDO3FCQUNELEtBQUssQ0FBQyxDQUFDLEdBQVUsRUFBRSxFQUFFO29CQUNsQixHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxFQUFDLFFBQVEsRUFBRSxXQUFXLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDO29CQUNqRixHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ2QsQ0FBQyxDQUFDLENBQUM7WUFDWCxDQUFDLENBQUM7aUJBQ0QsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQWEsRUFBRSxHQUF3QixFQUFFLEVBQUU7Z0JBQ2xELEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFO29CQUNmLGdCQUFnQixFQUFFLFFBQVEsQ0FBQyxNQUFNO29CQUNqQyxjQUFjLEVBQUUsMEJBQTBCO2lCQUM3QyxDQUFDLENBQUM7Z0JBQ0gsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUNqQyxDQUFDLENBQUM7aUJBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFVLEVBQUUsRUFBRTtnQkFDOUIsSUFBSSxHQUFHLEVBQUU7b0JBQ0wsTUFBTSxHQUFHLENBQUM7aUJBQ2I7Z0JBRUQsSUFBSSxDQUFDLFdBQVcsR0FBRyxrQkFBa0IsQ0FBQyxvQkFBb0IsSUFBSSxDQUFDLElBQUksaUJBQWlCLENBQUMsQ0FBQztnQkFFdEYsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMscUJBQXFCLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsYUFBYSxDQUFDLENBQUM7WUFDakcsQ0FBQyxDQUFDLENBQUM7UUFDWCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxZQUFZO1FBQ2YsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUNuQyxNQUFNLElBQUksR0FBUSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUE7WUFDakIsSUFBSSxJQUFJLEVBQUU7Z0JBQ04sSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUU7b0JBQ3JCLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQzNCLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUM7aUJBQzNDO2dCQUNELElBQUksWUFBWSxJQUFJLElBQUksRUFBRTtvQkFDdEIsTUFBTSxTQUFTLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUM1QyxJQUFJLFNBQVMsSUFBSSxJQUFJLElBQUksRUFBRSxFQUFFO3dCQUN6QixNQUFNLE1BQU0sR0FBRzs0QkFDWCxHQUFHLEVBQUUsSUFBSSxDQUFDLFFBQVE7NEJBQ2xCLE1BQU0sRUFBRSxNQUFNOzRCQUNkLElBQUksRUFBRSxJQUFJOzRCQUNWLElBQUksRUFBRTtnQ0FDRixTQUFTLEVBQUUsSUFBSSxDQUFDLFFBQVE7Z0NBQ3hCLFVBQVUsRUFBRSxlQUFlO2dDQUMzQixhQUFhLEVBQUUsSUFBSSxDQUFDLGFBQWE7NkJBQ3BDO3lCQUNKLENBQUM7d0JBRUYsT0FBTzs2QkFDRixJQUFJLENBQUMsTUFBTSxDQUFDOzZCQUNaLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFOzRCQUNYLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzs0QkFFaEQsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNsQixDQUFDLENBQUM7NkJBQ0QsS0FBSyxDQUFDLENBQUMsR0FBVSxFQUFFLEVBQUU7NEJBQ2xCLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQzt3QkFDaEIsQ0FBQyxDQUFDLENBQUM7cUJBQ1Y7eUJBQU07d0JBQ0gsdUJBQXVCO3dCQUN2QixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7cUJBQ2xCO2lCQUNKO3FCQUFNO29CQUNILHVCQUF1QjtvQkFDdkIsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUNsQjthQUNKO2lCQUFNO2dCQUNILE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUM7YUFDM0M7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxXQUFXLENBQUMsSUFBUztRQUN4QixJQUFJLFlBQVksSUFBSSxJQUFJLEVBQUU7WUFDdEIsTUFBTSxXQUFXLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUMvQixNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDdkQsTUFBTSxTQUFTLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQztZQUU5RSxJQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUM5QyxJQUFJLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztTQUM3QztRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFTSxLQUFLLENBQUMsV0FBVyxDQUFDLElBQVksRUFBRSxLQUFhLEVBQUUsS0FBYTtRQUMvRCxJQUFJLEtBQUssS0FBSyxJQUFJLENBQUMsS0FBSyxFQUFFO1lBQ3RCLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsc0RBQXNELENBQUMsQ0FBQyxDQUFDO1lBQ3JGLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxzREFBc0QsQ0FBQyxDQUFDO1NBQ2pGO2FBQU0sSUFBSSxLQUFLLEVBQUU7WUFDZCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLDBDQUEwQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7WUFDakYsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLDBDQUEwQyxHQUFHLEtBQUssQ0FBQyxDQUFDO1NBQzdFO2FBQU0sSUFBSSxDQUFDLElBQUksRUFBRTtZQUNkLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsbURBQW1ELENBQUMsQ0FBQyxDQUFDO1lBQ2xGLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxtREFBbUQsQ0FBQyxDQUFDO1NBQzlFO2FBQU07WUFDSCxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7WUFDYixJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7Z0JBQ2xCLEdBQUcsR0FBRyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7YUFDOUM7WUFDRCxNQUFNLE1BQU0sR0FBRztnQkFDWCxHQUFHLEVBQUUsSUFBSSxDQUFDLFFBQVE7Z0JBQ2xCLE1BQU0sRUFBRSxNQUFNO2dCQUNkLElBQUksRUFBRSxJQUFJO2dCQUNWLElBQUksRUFBRTtvQkFDRixVQUFVLEVBQUUsb0JBQW9CO29CQUNoQyxZQUFZLEVBQUUsa0JBQWtCLENBQUMsR0FBRyxDQUFDO29CQUNyQyxhQUFhLEVBQUUsSUFBSSxDQUFDLFlBQVk7b0JBQ2hDLFNBQVMsRUFBRSxJQUFJLENBQUMsUUFBUTtvQkFDeEIsSUFBSTtpQkFDUDthQUNKLENBQUM7WUFFRixPQUFPLE9BQU87aUJBQ1QsSUFBSSxDQUFDLE1BQU0sQ0FBQztpQkFDWixJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxFQUFFO2dCQUNqQixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBRWhELElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztZQUNoRCxDQUFDLENBQUM7aUJBQ0QsS0FBSyxDQUFDLEtBQUssRUFBRSxHQUFVLEVBQUUsRUFBRTtnQkFDeEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyx3REFBd0QsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUM3RixPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsdURBQXVELEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDekYsQ0FBQyxDQUFDLENBQUM7U0FDVjtJQUNMLENBQUM7SUFFTSxnQkFBZ0IsQ0FBQyxHQUFXLEVBQUUsV0FBVyxHQUFHLGtCQUFrQixFQUFFLElBQVU7UUFDN0UsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUN6QixHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sR0FBRyxHQUFHLENBQUM7U0FDNUI7UUFFRCxPQUFPLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ2pDLE1BQU0sSUFBSSxHQUFvQjtnQkFDMUIsR0FBRyxFQUFFLEdBQUc7Z0JBQ1IsT0FBTyxFQUFFO29CQUNMLGNBQWMsRUFBRSxXQUFXO29CQUMzQixNQUFNLEVBQUUsa0JBQWtCO29CQUMxQixhQUFhLEVBQUUsR0FBRyxJQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7aUJBQzNEO2dCQUNELElBQUksRUFBRSxJQUFJO2FBQ2IsQ0FBQztZQUVGLElBQUksSUFBSSxFQUFFO2dCQUNOLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO2FBQ3BCO1lBRUQsT0FBTyxJQUFJLENBQUM7UUFDaEIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sS0FBSyxDQUFDLFlBQVksQ0FBQyxHQUFXLEVBQUUsV0FBb0I7UUFDdkQsT0FBTyxJQUFJLENBQUMsc0JBQXNCLENBQUMsR0FBRyxFQUFFLE9BQU8sQ0FBQyxHQUFHLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDdEUsQ0FBQztJQUVNLEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBVyxFQUFFLElBQVMsRUFBRSxXQUFvQjtRQUNuRSxPQUFPLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDN0UsQ0FBQztJQUVNLE1BQU07UUFDVCxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFFUyxTQUFTLENBQUMsR0FBVztRQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQ25DLE9BQU8sS0FBSyxDQUFDO1NBQ2hCO1FBRUQsT0FBTyxHQUFHLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFFUyxTQUFTLENBQUMsR0FBVztRQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFO1lBQ25DLE9BQU87U0FDVjtRQUVELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUU5QyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLEVBQUU7WUFDaEIsT0FBTztTQUNWO1FBQ0QsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3hCLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUE7UUFDcEIsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDckIsQ0FBQztJQUVTLGNBQWMsQ0FBQyxHQUFXLEVBQUUsS0FBVTtRQUM1QyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUN0QixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUMzQixPQUFPLEtBQUssQ0FBQztTQUNoQjtRQUVELE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRVMsU0FBUyxDQUFDLEdBQVcsRUFBRSxLQUFVO1FBQ3ZDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUU7WUFDbkMsbUZBQW1GO1lBQ25GLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDeEM7UUFFRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFOUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQztRQUVsQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRXZDLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFUyxZQUFZLENBQUMsR0FBVztRQUM5QixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUU7WUFDbEQsT0FBTztTQUNWO1FBRUQsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRTlDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsRUFBRTtZQUNoQixPQUFPO1NBQ1Y7UUFFRCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVqQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFFUyxZQUFZO1FBQ2xCLElBQUksQ0FBQyxZQUFZLEdBQUcsa0JBQWtCLENBQUMsRUFBQyxNQUFNLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUMsQ0FBQyxDQUFDO1FBQ3ZFLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ2hELE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDL0QsSUFBSSxDQUFDLGFBQWEsR0FBRyxHQUFHLENBQUM7SUFDN0IsQ0FBQztJQUVPLEtBQUssQ0FBQyxzQkFBc0IsQ0FDaEMsR0FBVyxFQUNYLElBQWdELEVBQ2hELFdBQW9CLEVBQ3BCLElBQVU7UUFFVixJQUFJLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRS9ELElBQUk7WUFDQSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNyQjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsSUFBSSxDQUFDLENBQUMsVUFBVSxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsVUFBVSxLQUFLLEtBQUssRUFBRTtnQkFDaEQsTUFBTSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBQzFCLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUMzRCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUNyQjtZQUNELElBQUksUUFBUSxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRTtnQkFDMUMsSUFDSSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxLQUFLO29CQUM1QixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxNQUFNO29CQUMzQixDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxzQ0FBc0MsRUFDL0Q7b0JBQ0UsTUFBTSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7b0JBQzFCLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUMzRCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztpQkFDckI7YUFDSjtZQUNELE1BQU0sQ0FBQyxDQUFDO1NBQ1g7SUFDTCxDQUFDO0lBRU8sU0FBUyxDQUFDLEdBQVc7UUFDekIsT0FBTyxHQUFHO2FBQ0wsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUM7YUFDakIsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUM7YUFDbkIsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQztJQUM3QixDQUFDO0NBQ0oifQ==