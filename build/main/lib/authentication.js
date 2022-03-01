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
            console.log(auth);
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
exports.LoginServer = LoginServer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aGVudGljYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL2F1dGhlbnRpY2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx1Q0FBeUI7QUFDekIsMkNBQTZCO0FBQzdCLDJDQUE2QjtBQUU3QixnRkFBbUU7QUFDbkUseURBQTJDO0FBQzNDLGtEQUFnRDtBQUNoRCxvREFBc0M7QUFDdEMsa0RBQTBCO0FBRWIsUUFBQSxPQUFPLEdBQUcsV0FBVyxDQUFDO0FBRW5DLE1BQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLGlCQUFpQixDQUFDLENBQUMsQ0FBQztBQUVwRyxNQUFhLFdBQVc7SUFnQnBCLFlBQW1CLE1BQW1CLEVBQUUsYUFBMEIsRUFBRSxNQUFlO1FBZmxFLGlCQUFZLEdBQVcsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUN6QyxTQUFJLEdBQUcsS0FBSyxDQUFDO1FBQ2IsVUFBSyxHQUFHLGtDQUFrQyxDQUFDO1FBQzNDLFdBQU0sR0FBdUIsSUFBSSxDQUFDO1FBYXRDLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO1FBQ25DLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDakQsSUFBSSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ25DLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDbkQsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENB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