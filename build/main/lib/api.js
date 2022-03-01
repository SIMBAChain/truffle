"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStorages = exports.getBlockchains = exports.chooseApplication = exports.getApp = exports.chooseOrganisation = void 0;
const prompts_1 = __importDefault(require("prompts"));
const getList = async (config, url) => {
    if (!url) {
        url = 'organisations/';
    }
    return config.authStore.doGetRequest(url, 'application/json');
};
exports.chooseOrganisation = async (config, url) => {
    if (!url) {
        url = 'organisations/';
    }
    const orgResponse = await getList(config, url);
    const orgs = {
        next: orgResponse.next,
        prev: orgResponse.prev,
        data: orgResponse.results.reduce((map, obj) => {
            const data = Object.assign(Object.assign({}, obj), { id: obj.id });
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
    const response = await prompts_1.default({
        type: 'select',
        name: 'organisation',
        message: 'Please pick an organisation',
        choices,
    });
    if (response.organisation === 'prev') {
        return exports.chooseOrganisation(config, orgs.prev);
    }
    else if (response.organisation === 'next') {
        return exports.chooseOrganisation(config, orgs.next);
    }
    if (!response.organisation) {
        throw new Error('No Organisation Selected!');
    }
    config.application = response.organisation;
    return response.organisation;
};
exports.getApp = async (config, id) => {
    const url = `organisations/${config.organisation.id}/applications/${id}`;
    const response = await config.authStore.doGetRequest(url, 'application/json');
    return response;
};
exports.chooseApplication = async (config, url) => {
    if (!url) {
        url = `organisations/${config.organisation.id}/applications/`;
    }
    const appResponse = await getList(config, url);
    const apps = {
        next: appResponse.next,
        prev: appResponse.prev,
        data: appResponse.results.reduce((map, obj) => {
            const data = Object.assign(Object.assign({}, obj), { id: obj.id });
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
    const response = await prompts_1.default({
        type: 'select',
        name: 'application',
        message: 'Please pick an application',
        choices,
    });
    if (response.application === 'prev') {
        return exports.chooseApplication(config, apps.prev);
    }
    else if (response.application === 'next') {
        return exports.chooseApplication(config, apps.next);
    }
    if (!response.application) {
        throw new Error('No Application Selected!');
    }
    config.application = response.application;
    return response.application;
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
exports.getBlockchains = async (config, url) => {
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
exports.getStorages = async (config, url) => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9hcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsc0RBQTBDO0FBa0IxQyxNQUFNLE9BQU8sR0FBRyxLQUFLLEVBQUUsTUFBbUIsRUFBRSxHQUFZLEVBQWdCLEVBQUU7SUFDdEUsSUFBSSxDQUFDLEdBQUcsRUFBRTtRQUNOLEdBQUcsR0FBRyxnQkFBZ0IsQ0FBQztLQUMxQjtJQUVELE9BQU8sTUFBTSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLGtCQUFrQixDQUFDLENBQUM7QUFDbEUsQ0FBQyxDQUFDO0FBRVcsUUFBQSxrQkFBa0IsR0FBRyxLQUFLLEVBQUUsTUFBbUIsRUFBRSxHQUFZLEVBQWdCLEVBQUU7SUFDeEYsSUFBSSxDQUFDLEdBQUcsRUFBRTtRQUNOLEdBQUcsR0FBRyxnQkFBZ0IsQ0FBQztLQUMxQjtJQUVELE1BQU0sV0FBVyxHQUFHLE1BQU0sT0FBTyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztJQUUvQyxNQUFNLElBQUksR0FBYTtRQUNuQixJQUFJLEVBQUUsV0FBVyxDQUFDLElBQUk7UUFDdEIsSUFBSSxFQUFFLFdBQVcsQ0FBQyxJQUFJO1FBQ3RCLElBQUksRUFBRSxXQUFXLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQXVCLEVBQUUsR0FBUSxFQUFFLEVBQUU7WUFDbkUsTUFBTSxJQUFJLG1DQUFPLEdBQUcsS0FBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBQyxDQUFDO1lBQ2xDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBQ3RCLE9BQU8sR0FBRyxDQUFDO1FBQ2YsQ0FBQyxFQUFFLEVBQUUsQ0FBQztLQUNULENBQUM7SUFFRixNQUFNLE9BQU8sR0FBRyxFQUFFLENBQUM7SUFDbkIsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO1FB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