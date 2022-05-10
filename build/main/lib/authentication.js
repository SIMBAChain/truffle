"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginServer = exports.AUTHKEY = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const http = __importStar(require("http"));
const crypto_random_string_1 = __importDefault(require("crypto-random-string"));
const request = __importStar(require("request-promise"));
const polka_1 = __importDefault(require("polka"));
const CryptoJS = __importStar(require("crypto-js"));
const chalk_1 = __importDefault(require("chalk"));
exports.AUTHKEY = 'SIMBAAUTH';
const authHtml = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'html', 'authResult.html'));
class LoginServer {
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
        return this.hasConfig(exports.AUTHKEY);
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
        this.state = crypto_random_string_1.default({ length: 24, type: 'url-safe' });
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
            this.deleteConfig(exports.AUTHKEY);
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
            polka_1.default({ server: this.server })
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
                this.logger.info('Please navigate to ' + chalk_1.default.underline(this.authorizeUrl) + ' to log in.');
            });
        });
    }
    refreshToken() {
        return new Promise((resolve, reject) => {
            const auth = this.getConfig(exports.AUTHKEY);
            if (auth) {
                if (!auth.refresh_token) {
                    this.deleteConfig(exports.AUTHKEY);
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
                            this.setConfig(exports.AUTHKEY, this.parseExpiry(resp));
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
            this.logger.error(chalk_1.default.red('Error logging in to SIMBAChain: state does not match'));
            return Promise.reject('Error logging in to SIMBAChain: state does not match');
        }
        else if (error) {
            this.logger.error(chalk_1.default.red('Unknown Error logging in to SIMBAChain: ' + error));
            return Promise.reject('Unknown Error logging in to SIMBAChain: ' + error);
        }
        else if (!code) {
            this.logger.error(chalk_1.default.red('Error logging in to SIMBAChain: missing auth code'));
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
                this.setConfig(exports.AUTHKEY, this.parseExpiry(resp));
                this.logger.info(chalk_1.default.green('Logged In!'));
            })
                .catch(async (err) => {
                this.logger.error(chalk_1.default.red('Error logging in to SIMBAChain: Token Exchange Error: ' + err));
                return Promise.reject('Error logging in to SIMBAChain: Token Exchange Error:' + err);
            });
        }
    }
    getClientOptions(url, contentType = 'application/json', data) {
        const auth = this.getConfig(exports.AUTHKEY);
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
        this.deleteConfig(exports.AUTHKEY);
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
        this.pkceVerifier = crypto_random_string_1.default({ length: 24, type: 'url-safe' });
        const hash = CryptoJS.SHA256(this.pkceVerifier);
        const b64 = this.base64URL(hash.toString(CryptoJS.enc.Base64));
        this.pkceChallenge = b64;
    }
    async retryAfterTokenRefresh(url, call, contentType, data) {
        let opts = await this.getClientOptions(url, contentType, data);
        try {
            return call(opts);
        }
        catch (err) {
            const e = err;
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
exports.LoginServer = LoginServer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aGVudGljYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL2F1dGhlbnRpY2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx1Q0FBeUI7QUFDekIsMkNBQTZCO0FBQzdCLDJDQUE2QjtBQUU3QixnRkFBbUU7QUFDbkUseURBQTJDO0FBQzNDLGtEQUFnRDtBQUNoRCxvREFBc0M7QUFDdEMsa0RBQTBCO0FBRWIsUUFBQSxPQUFPLEdBQUcsV0FBVyxDQUFDO0FBRW5DLE1BQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLGlCQUFpQixDQUFDLENBQUMsQ0FBQztBQUVwRyxNQUFhLFdBQVc7SUFnQnBCLFlBQW1CLE1BQW1CLEVBQUUsYUFBMEIsRUFBRSxNQUFlO1FBZmxFLGlCQUFZLEdBQVcsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUN6QyxTQUFJLEdBQUcsS0FBSyxDQUFDO1FBQ2IsVUFBSyxHQUFHLGtDQUFrQyxDQUFDO1FBQzNDLFdBQU0sR0FBdUIsSUFBSSxDQUFDO1FBYXRDLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO1FBQ25DLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDakQsSUFBSSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ25DLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDbkQsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENB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