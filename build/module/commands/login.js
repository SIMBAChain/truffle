import { chooseOrganisation, chooseApplication } from '../lib';
export const command = 'login';
export const describe = 'log in to SIMBAChain SCaaS';
export const builder = {
    'help': {
        'alias': 'h',
        'type': 'boolean',
        'describe': 'show help',
    },
};
export const handler = async (args) => {
    const config = args.config;
    try {
        if (!config.authStore.isLoggedIn) {
            await config.authStore.performLogin();
        }
        else {
            try {
                await config.authStore.refreshToken();
            }
            catch (e) {
                await config.authStore.performLogin();
            }
        }
        const org = await chooseOrganisation(config);
        if (!org) {
            return Promise.resolve(new Error('No Organisation Selected!'));
        }
        config.organisation = org;
        const app = await chooseApplication(config);
        if (!app) {
            return Promise.resolve(new Error('No Application Selected!'));
        }
        config.application = app;
        config.logger.info(`simba login: Logged in to ${org.name}`);
    }
    catch (e) {
        // e.keys = [ 'name', 'statusCode', 'message', 'error', 'options', 'response' ]
        return Promise.resolve(e);
    }
    Promise.resolve(null);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY29tbWFuZHMvbG9naW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFjLGtCQUFrQixFQUFFLGlCQUFpQixFQUFDLE1BQU0sUUFBUSxDQUFDO0FBRTFFLE1BQU0sQ0FBQyxNQUFNLE9BQU8sR0FBRyxPQUFPLENBQUM7QUFDL0IsTUFBTSxDQUFDLE1BQU0sUUFBUSxHQUFHLDRCQUE0QixDQUFDO0FBQ3JELE1BQU0sQ0FBQyxNQUFNLE9BQU8sR0FBRztJQUNuQixNQUFNLEVBQUU7UUFDSixPQUFPLEVBQUUsR0FBRztRQUNaLE1BQU0sRUFBRSxTQUFTO1FBQ2pCLFVBQVUsRUFBRSxXQUFXO0tBQzFCO0NBQ0osQ0FBQztBQUVGLE1BQU0sQ0FBQyxNQUFNLE9BQU8sR0FBRyxLQUFLLEVBQUUsSUFBcUIsRUFBZ0IsRUFBRTtJQUNqRSxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBcUIsQ0FBQztJQUMxQyxJQUFJO1FBQ0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFO1lBQzlCLE1BQU0sTUFBTSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztTQUN6QzthQUFNO1lBQ0gsSUFBSTtnQkFDQSxNQUFNLE1BQU0sQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUM7YUFDekM7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDUixNQUFNLE1BQU0sQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUM7YUFDekM7U0FDSjtRQUVELE1BQU0sR0FBRyxHQUFHLE1BQU0sa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDN0MsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNOLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUM7U0FDbEU7UUFDRCxNQUFNLENBQUMsWUFBWSxHQUFHLEdBQUcsQ0FBQztRQUUxQixNQUFNLEdBQUcsR0FBRyxNQUFNLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzVDLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDTixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxLQUFLLENBQUMsMEJBQTBCLENBQUMsQ0FBQyxDQUFDO1NBQ2pFO1FBQ0QsTUFBTSxDQUFDLFdBQVcsR0FBRyxHQUFHLENBQUM7UUFFekIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsNkJBQTZCLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0tBQy9EO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDUiwrRUFBK0U7UUFDL0UsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzdCO0lBRUQsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMxQixDQUFDLENBQUMifQ==