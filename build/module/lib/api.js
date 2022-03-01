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
    console.log(orgResponse);
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
    chains.forEach((chain) => {
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
    const chains = await getList(config, url);
    const choices = [];
    chains.forEach((chain) => {
        choices.push({
            title: chain.display_name,
            value: chain.name,
        });
    });
    return choices;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9hcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLE9BQU8sSUFBSSxNQUFNLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFxQzFDLE1BQU0sT0FBTyxHQUFHLEtBQUssRUFBRSxNQUFtQixFQUFFLEdBQVksRUFBZ0IsRUFBRTtJQUN0RSxJQUFJLENBQUMsR0FBRyxFQUFFO1FBQ04sR0FBRyxHQUFHLGdCQUFnQixDQUFDO0tBQzFCO0lBRUQsT0FBTyxNQUFNLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztBQUNsRSxDQUFDLENBQUM7QUFFRixNQUFNLENBQUMsTUFBTSxrQkFBa0IsR0FBRyxLQUFLLEVBQUUsTUFBbUIsRUFBRSxHQUFZLEVBQWdCLEVBQUU7SUFDeEYsSUFBSSxDQUFDLEdBQUcsRUFBRTtRQUNOLEdBQUcsR0FBRyxnQkFBZ0IsQ0FBQztLQUMxQjtJQUVELE1BQU0sV0FBVyxHQUFHLE1BQU0sT0FBTyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztJQUUvQyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFBO0lBRXhCLE1BQU0sSUFBSSxHQUFhO1FBQ25CLElBQUksRUFBRSxXQUFXLENBQUMsSUFBSTtRQUN0QixJQUFJLEVBQUUsV0FBVyxDQUFDLElBQUk7UUFDdEIsSUFBSSxFQUFFLFdBQVcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBdUIsRUFBRSxHQUFRLEVBQUUsRUFBRTtZQUNuRSxNQUFNLElBQUksR0FBRyxFQUFDLEdBQUcsR0FBRyxFQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFDLENBQUM7WUFDbEMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDdEIsT0FBTyxHQUFHLENBQUM7UUFDZixD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