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
    console.log(orgResponse);
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
    chains.forEach((chain) => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9hcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsc0RBQTBDO0FBcUMxQyxNQUFNLE9BQU8sR0FBRyxLQUFLLEVBQUUsTUFBbUIsRUFBRSxHQUFZLEVBQWdCLEVBQUU7SUFDdEUsSUFBSSxDQUFDLEdBQUcsRUFBRTtRQUNOLEdBQUcsR0FBRyxnQkFBZ0IsQ0FBQztLQUMxQjtJQUVELE9BQU8sTUFBTSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLGtCQUFrQixDQUFDLENBQUM7QUFDbEUsQ0FBQyxDQUFDO0FBRVcsUUFBQSxrQkFBa0IsR0FBRyxLQUFLLEVBQUUsTUFBbUIsRUFBRSxHQUFZLEVBQWdCLEVBQUU7SUFDeEYsSUFBSSxDQUFDLEdBQUcsRUFBRTtRQUNOLEdBQUcsR0FBRyxnQkFBZ0IsQ0FBQztLQUMxQjtJQUVELE1BQU0sV0FBVyxHQUFHLE1BQU0sT0FBTyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztJQUUvQyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFBO0lBRXhCLE1BQU0sSUFBSSxHQUFhO1FBQ25CLElBQUksRUFBRSxXQUFXLENBQUMsSUFBSTtRQUN0QixJQUFJLEVBQUUsV0FBVyxDQUFDLElBQUk7UUFDdEIsSUFBSSxFQUFFLFdBQVcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBdUIsRUFBRSxHQUFRLEVBQUUsRUFBRTtZQUNuRSxNQUFNLElBQUksbUNBQU8sR0FBRyxLQUFFLEVBQUUsRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFDLENBQUM7WUFDbEMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDdEIsT0FBTyxHQUFHLENBQUM7UUFDZixDQUFDLEVBQUUsRUFBRSxDQUFDO0tBQ1QsQ0FBQztJQUVGLE1BQU0sT0FBTyxHQUFHLEVB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