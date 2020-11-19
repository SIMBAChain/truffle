/* eslint-disable */
declare module 'polka' {
    import {IncomingMessage, Server, ServerResponse} from 'http';
    import {Url} from 'url';
    import Trouter = require('trouter');

    namespace polka {
        /**
         * Calls the next middleware function in the chain, or throws an error.
         */
        type Next = (err?: string | Error) => void;

        /**
         * An `http.IncomingMessage`, extended by Polka
         */
        interface Request extends IncomingMessage {
            /**
             * The originally-requested URL, including parent router segments.
             */
            originalUrl: string;

            /**
             * The path portion of the requested URL.
             */
            path: string;

            /**
             * The values of named parameters within your route pattern
             */
            params: {
                [key: string]: string;
            };

            /**
             * The un-parsed querystring
             */
            search: string | null;

            /**
             * The parsed querystring
             */
            query: {
                [key: string]: string | string[];
            };
        }

        /**
         * A middleware function
         */
        type Middleware = (req: Request, res: ServerResponse, next?: Next) => void | Promise<void>;

        /**
         * An instance of the Polka router.
         */
        interface Polka extends Trouter<Middleware> {
            /**
             * Parses the `req.url` property of the given request.
             */
            parse(req: Request): Url;

            /**
             * Attach middleware(s) and/or sub-application(s) to the server.
             * These will execute before your routes' handlers.
             */
            use(...handlers: Middleware[]): this;

            /**
             * Attach middleware(s) and/or sub-application(s) to the server.
             * These will execute before your routes' handlers.
             */
            use(pattern: string | RegExp, ...handlers: Middleware[]): this;

            /**
             * Boots (or creates) the underlying `http.Server` for the first time.
             */
            listen(port?: number, hostname?: string): this;

            /**
             * Boots (or creates) the underlying `http.Server` for the first time.
             * All arguments are passed to server.listen directly with no changes.
             */
            listen(...args: unknown[]): this;

            /**
             * The main Polka `IncomingMessage` handler.
             * It receives all requests and tries to match the incoming URL against known routes.
             */
            handler(req: Request, res: ServerResponse, parsed?: Url): void;
        }

        /**
         * Polka options
         */
        interface Options {
            /**
             * The server instance to use when `polka.listen()` is called.
             */
            server?: Server;

            /**
             * A catch-all error handler; executed whenever a middleware throws an error.
             */
            onError?(err: Error, req: Request, res: ServerResponse, next: Next): void;

            /**
             * A handler when no route definitions were matched.
             */
            onNoMatch?(req: Request, res: ServerResponse): void;
        }
    }

    /**
     * Creates a Polka HTTP router.
     *
     * @see https://github.com/lukeed/polka
     */
    const polka: (opts?: polka.Options) => polka.Polka;

    export = polka;
}
