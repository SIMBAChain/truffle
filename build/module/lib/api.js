import { default as prompt } from 'prompts';
const getList = async (config, url) => {
    if (!url) {
        url = 'organisations/';
    }
    return config.authStore.doGetRequest(url, 'application/json');
};
export const chooseOrganisation = async (config, url) => {
    if (!url) {
        url = 'organisations/';
    }
    const orgResponse = await getList(config, url);
    const orgs = {
        next: orgResponse.next,
        prev: orgResponse.prev,
        data: orgResponse.results.reduce((map, obj) => {
            const data = { ...obj, id: obj.id };
            map[data.name] = data;
            return map;
        }, {}),
    };
    const choices = [];
    if (orgs.prev) {
        choices.push({
            title: '<-',
            description: 'Previous choices',
            value: 'prev'
        });
    }
    if (orgs.next) {
        choices.push({ title: '->', description: 'Next choices', value: 'next' });
    }
    for (const [key, val] of Object.entries(orgs.data)) {
        choices.push({ title: key, value: val });
    }
    const response = await prompt({
        type: 'select',
        name: 'organisation',
        message: 'Please pick an organisation',
        choices,
    });
    if (response.organisation === 'prev') {
        return chooseOrganisation(config, orgs.prev);
    }
    else if (response.organisation === 'next') {
        return chooseOrganisation(config, orgs.next);
    }
    if (!response.organisation) {
        throw new Error('No Organisation Selected!');
    }
    config.application = response.organisation;
    return response.organisation;
};
export const getApp = async (config, id) => {
    const url = `organisations/${config.organisation.id}/applications/${id}`;
    const response = await config.authStore.doGetRequest(url, 'application/json');
    return response;
};
export const chooseApplication = async (config, url) => {
    if (!url) {
        url = `organisations/${config.organisation.id}/applications/`;
    }
    const appResponse = await getList(config, url);
    const apps = {
        next: appResponse.next,
        prev: appResponse.prev,
        data: appResponse.results.reduce((map, obj) => {
            const data = { ...obj, id: obj.id };
            map[data.display_name] = data;
            return map;
        }, {}),
    };
    const choices = [];
    if (apps.prev) {
        choices.push({
            title: '<-',
            description: 'Previous choices',
            value: 'prev'
        });
    }
    if (apps.next) {
        choices.push({ title: '->', description: 'Next choices', value: 'next' });
    }
    for (const [key, val] of Object.entries(apps.data)) {
        choices.push({ title: key, value: val });
    }
    const response = await prompt({
        type: 'select',
        name: 'application',
        message: 'Please pick an application',
        choices,
    });
    if (response.application === 'prev') {
        return chooseApplication(config, apps.prev);
    }
    else if (response.application === 'next') {
        return chooseApplication(config, apps.next);
    }
    if (!response.application) {
        throw new Error('No Application Selected!');
    }
    config.application = response.application;
    return response.application;
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getBlockchains = async (config, url) => {
    if (!url) {
        url = `organisations/${config.organisation.id}/blockchains/`;
    }
    const chains = await getList(config, url);
    const choices = [];
    chains.results.forEach((chain) => {
        choices.push({
            title: chain.display_name,
            value: chain.name,
        });
    });
    return choices;
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getStorages = async (config, url) => {
    if (!url) {
        url = `organisations/${config.organisation.id}/storage/`;
    }
    const storages = await getList(config, url);
    const choices = [];
    storages.results.forEach((storage) => {
        choices.push({
            title: storage.display_name,
            value: storage.name,
        });
    });
    return choices;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9hcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLE9BQU8sSUFBSSxNQUFNLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFrQjFDLE1BQU0sT0FBTyxHQUFHLEtBQUssRUFBRSxNQUFtQixFQUFFLEdBQVksRUFBZ0IsRUFBRTtJQUN0RSxJQUFJLENBQUMsR0FBRyxFQUFFO1FBQ04sR0FBRyxHQUFHLGdCQUFnQixDQUFDO0tBQzFCO0lBRUQsT0FBTyxNQUFNLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztBQUNsRSxDQUFDLENBQUM7QUFFRixNQUFNLENBQUMsTUFBTSxrQkFBa0IsR0FBRyxLQUFLLEVBQUUsTUFBbUIsRUFBRSxHQUFZLEVBQWdCLEVBQUU7SUFDeEYsSUFBSSxDQUFDLEdBQUcsRUFBRTtRQUNOLEdBQUcsR0FBRyxnQkFBZ0IsQ0FBQztLQUMxQjtJQUVELE1BQU0sV0FBVyxHQUFHLE1BQU0sT0FBTyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztJQUUvQyxNQUFNLElBQUksR0FBYTtRQUNuQixJQUFJLEVBQUUsV0FBVyxDQUFDLElBQUk7UUFDdEIsSUFBSSxFQUFFLFdBQVcsQ0FBQyxJQUFJO1FBQ3RCLElBQUksRUFBRSxXQUFXLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQXVCLEVBQUUsR0FBUSxFQUFFLEVBQUU7WUFDbkUsTUFBTSxJQUFJLEdBQUcsRUFBQyxHQUFHLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBQyxDQUFDO1lBQ2xDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBQ3RCLE9BQU8sR0FBRyxDQUFDO1FBQ2YsQ0FBQyxFQUFFLEVBQUUsQ0FBQztLQUNULENBQUM7SUFFRixNQUFNLE9B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