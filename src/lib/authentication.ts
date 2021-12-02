import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import Configstore from 'configstore';
import {default as cryptoRandomString} from 'crypto-random-string';
import * as request from 'request-promise';
import {Request, default as polka} from 'polka';
import * as CryptoJS from 'crypto-js';
import chalk from 'chalk';

export const AUTHKEY = 'SIMBAAUTH';

const authHtml = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'html', 'authResult.html'));

export class LoginServer {
    private readonly closeTimeout: number = 5 * 1000;
    private port = 22315;
    private scope = 'openid offline_access read_write';
    private server: http.Server | null = null;
    private state: string | undefined;
    private clientID: string;
    private config: Configstore;
    private projectConfig: Configstore;
    private logger: Console;
    private redirectUri: string | undefined;
    private tokenUrl: string;
    private baseUrl: string;
    private pkceVerifier: string | undefined;
    private pkceChallenge: string | undefined;

    public constructor(config: Configstore, projectConfig: Configstore, logger: Console) {
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

    private _authorizeUrl: string;

    public get authorizeUrl(): string {
        this.generatePKCE();
        return `${this._authorizeUrl}?client_id=${this.clientID}&redirect_uri=${this.redirectUri}&response_type=code&state=${this.state}&scope=${this.scope}&code_challenge=${this.pkceChallenge}&code_challenge_method=S256`;
    }

    public get isLoggedIn(): boolean {
        return this.hasConfig(AUTHKEY);
    }

    private _configBase!: string;

    protected get configBase(): string {
        if (!this._configBase) {
            this._configBase = this.baseUrl.split('.').join('_');
        }
        return this._configBase;
    }

    public dispose(): void {
        if (this.server) {
            this.server.unref();
            this.server.close();
        }
    }

    public async performLogin(): Promise<any> {
        this.state = cryptoRandomString({length: 24, type: 'url-safe'});

        return this.performLoginViaIntegratedWebserver();
    }

    public closeServer(): void {
        setTimeout(() => {
            if (this.server) {
                this.server.close();
            }
        }, this.closeTimeout);
    }

    public async performLoginViaIntegratedWebserver(): Promise<any> {
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

            polka({server: this.server})
                .get('/auth-callback/', (req: Request, res: http.ServerResponse) => {
                    const code: string = Array.isArray(req.query.code) ? req.query.code[0] : req.query.code;
                    const state: string = Array.isArray(req.query.state) ? req.query.state[0] : req.query.state;
                    const error: string = Array.isArray(req.query.error) ? req.query.error[0] : req.query.error;

                    res.on('finish', () => {
                        this.closeServer();
                    });

                    this.receiveCode(code, state, error)
                        .then(() => {
                            res.writeHead(302, {Location: '/'});
                            res.end();
                        })
                        .catch((err: Error) => {
                            res.writeHead(302, {Location: `/?error=${Buffer.from(err).toString('base64')}`});
                            res.end();
                        });
                })
                .get('/', (_req: Request, res: http.ServerResponse) => {
                    res.writeHead(200, {
                        'Content-Length': authHtml.length,
                        'Content-Type': 'text/html; charset=utf-8',
                    });
                    res.end(authHtml.toString());
                })
                .listen(this.port, (err: Error) => {
                    if (err) {
                        throw err;
                    }

                    this.redirectUri = encodeURIComponent(`http://localhost:${this.port}/auth-callback/`);

                    this.logger.info('Please navigate to ' + chalk.underline(this.authorizeUrl) + ' to log in.');
                });
        });
    }

    public refreshToken(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const auth: any = this.getConfig(AUTHKEY);
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
                            .catch((err: Error) => {
                                reject(err);
                            });
                    } else {
                        // Refresh not required
                        resolve(false);
                    }
                } else {
                    // Refresh not required
                    resolve(false);
                }
            } else {
                reject(new Error('Not authenticated!'));
            }
        });
    }

    public parseExpiry(auth: any): any {
        if ('expires_in' in auth) {
            const retrievedAt = new Date();
            const expiresIn = parseInt(auth.expires_in, 10) * 1000;
            const expiresAt = new Date(Date.parse(retrievedAt.toISOString()) + expiresIn);

            auth.retrieved_at = retrievedAt.toISOString();
            auth.expires_at = expiresAt.toISOString();
        }
        return auth;
    }

    public async receiveCode(code: string, state: string, error: string): Promise<any> {
        if (state !== this.state) {
            this.logger.error(chalk.red('Error logging in to SIMBAChain: state does not match'));
            return Promise.reject('Error logging in to SIMBAChain: state does not match');
        } else if (error) {
            this.logger.error(chalk.red('Unknown Error logging in to SIMBAChain: ' + error));
            return Promise.reject('Unknown Error logging in to SIMBAChain: ' + error);
        } else if (!code) {
            this.logger.error(chalk.red('Error logging in to SIMBAChain: missing auth code'));
            return Promise.reject('Error logging in to SIMBAChain: missing auth code');
        } else {
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
                .catch(async (err: Error) => {
                    this.logger.error(chalk.red('Error logging in to SIMBAChain: Token Exchange Error: ' + err));
                    return Promise.reject('Error logging in to SIMBAChain: Token Exchange Error:' + err);
                });
        }
    }

    public getClientOptions(url: string, contentType = 'application/json', data?: any): Promise<any> {
        const auth = this.getConfig(AUTHKEY);
        if (!url.startsWith('http')) {
            url = this.baseUrl + url;
        }

        return this.refreshToken().then(() => {
            const opts: request.Options = {
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

    public async doGetRequest(url: string, contentType?: string): Promise<any> {
        return this.retryAfterTokenRefresh(url, request.get, contentType);
    }

    public async doPostRequest(url: string, data: any, contentType?: string): Promise<any> {
        return this.retryAfterTokenRefresh(url, request.post, contentType, data);
    }

    public logout(): void {
        this.deleteConfig(AUTHKEY);
    }

    protected hasConfig(key: string): boolean {
        if (!this.config.has(this.configBase)) {
            return false;
        }

        return key in this.config.get(this.configBase);
    }

    protected getConfig(key: string): any {
        if (!this.config.has(this.configBase)) {
            return;
        }

        const dict = this.config.get(this.configBase);

        if (!(key in dict)) {
            return;
        }

        return dict[key];
    }

    protected getOrSetConfig(key: string, value: any): any {
        if (!this.hasConfig(key)) {
            this.setConfig(key, value);
            return value;
        }

        return this.getConfig(key);
    }

    protected setConfig(key: string, value: any): any {
        if (!this.config.has(this.configBase)) {
            // NOTE(Adam): This should never be the case since it is created in the constructor
            this.config.set(this.configBase, {});
        }

        const dict = this.config.get(this.configBase);

        dict[key] = value;

        this.config.set(this.configBase, dict);

        return value;
    }

    protected deleteConfig(key: string): void {
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

    protected generatePKCE(): void {
        this.pkceVerifier = cryptoRandomString({length: 24, type: 'url-safe'});
        const hash = CryptoJS.SHA256(this.pkceVerifier);
        const b64 = this.base64URL(hash.toString(CryptoJS.enc.Base64));
        this.pkceChallenge = b64;
    }

    private async retryAfterTokenRefresh(
        url: string,
        call: (opts: any) => request.RequestPromise<any>,
        contentType?: string,
        data?: any,
    ): Promise<any> {
        let opts = await this.getClientOptions(url, contentType, data);

        try {
            return call(opts);
        } catch (e) {
            if (e.statusCode === 403 || e.statusCode === '403') {
                await this.refreshToken();
                opts = await this.getClientOptions(url, contentType, data);
                return call(opts);
            }
            if ('errors' in e && Array.isArray(e.errors)) {
                if (
                    e.errors[0].status === '403' &&
                    e.errors[0].code === '1403' &&
                    e.errors[0].detail === '{"error":"Access token not found"}\n'
                ) {
                    await this.refreshToken();
                    opts = await this.getClientOptions(url, contentType, data);
                    return call(opts);
                }
            }
            throw e;
        }
    }

    private base64URL(str: string): string {
        return str
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_');
    }
}
