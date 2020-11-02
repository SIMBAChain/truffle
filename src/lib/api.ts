import { default as prompt } from 'prompts';
import { SimbaConfig } from '../lib';

interface Dictionary<T> {
    [Key: string]: T;
}

interface Response {
    next: string;
    prev: string;
    data: Dictionary<any>;
}

const getList = async (config: SimbaConfig, url?: string): Promise<any> => {
    if (!url) {
        url = 'organisations/';
    }

    return config.authStore.doGetRequest(url, 'application/json');
};

export const chooseOrganisation = async (config: SimbaConfig, url?: string): Promise<any> => {
    if (!url) {
        url = 'organisations/';
    }

    const orgResponse = await getList(config, url);

    const orgs: Response = {
        next: orgResponse.next,
        prev: orgResponse.prev,
        data: orgResponse.results.reduce((map: Dictionary<object>, obj: any) => {
            const data = { ...obj, id: obj.id };
            map[data.name] = data;
            return map;
        }, {}),
    };

    const choices = [];
    if (orgs.prev) {
        choices.push({ title: '<-', description: 'Previous choices', value: 'prev' });
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
    } else if (response.organisation === 'next') {
        return chooseOrganisation(config, orgs.next);
    }

    if (!response.organisation) {
        throw new Error('No Organisation Selected!');
    }
    config.application = response.organisation;

    return response.organisation;
};

export const getApp = async (config: SimbaConfig, id: string): Promise<any> => {
    // {
    //   "id": "51974f7a-6076-46c3-a37b-cb948f3e3642",
    //   "display_name": "myapi",
    //   "name": "myapi",
    //   "created_on": "2019-12-16T10:00:00Z",
    //   "components": [
    //     "ff271d8c-760f-4958-87d7-7c66cd626be0",
    //     "1f271d8c-760f-4958-87d7-7c66cd626be0",
    //     "ff271d8c-4321-1234-87d7-7c66cd626be0"
    //   ],
    //   "organisation": "51974f7a-6076-46c3-a37b-cb948f3e3641",
    //   "metadata": null
    // }
    const url = `organisations/${config.organisation.id}/applications/${id}`;

    const response = await config.authStore.doGetRequest(url, 'application/json');

    return response;
};

export const chooseApplication = async (config: SimbaConfig, url?: string): Promise<any> => {
    if (!url) {
        url = `organisations/${config.organisation.id}/applications/`;
    }

    // {
    //   "id": "51974f7a-6076-46c3-a37b-cb948f3e3642",
    //   "display_name": "myapi",
    //   "name": "myapi",
    //   "created_on": "2019-12-16T10:00:00Z",
    //   "components": [
    //     "ff271d8c-760f-4958-87d7-7c66cd626be0",
    //     "1f271d8c-760f-4958-87d7-7c66cd626be0",
    //     "ff271d8c-4321-1234-87d7-7c66cd626be0"
    //   ],
    //   "organisation": "51974f7a-6076-46c3-a37b-cb948f3e3641",
    //   "metadata": null
    // }

    const appResponse = await getList(config, url);

    const apps: Response = {
        next: appResponse.next,
        prev: appResponse.prev,
        data: appResponse.results.reduce((map: Dictionary<object>, obj: any) => {
            const data = { ...obj, id: obj.id };
            map[data.display_name] = data;
            return map;
        }, {}),
    };

    const choices = [];
    if (apps.prev) {
        choices.push({ title: '<-', description: 'Previous choices', value: 'prev' });
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
    } else if (response.application === 'next') {
        return chooseApplication(config, apps.next);
    }

    if (!response.application) {
        throw new Error('No Application Selected!');
    }
    config.application = response.application;

    return response.application;
};

// TODO: Get list of blockchains
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getBlockchains = async (_config: SimbaConfig, _url?: string): Promise<any> =>
    Promise.resolve([
        {
            title: 'Ganache',
            value: 'ganache',
        },
        {
            title: 'Ganache 2',
            value: 'ganache2',
        },
    ]);

// TODO: Get list of storages
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getStorages = async (_config: SimbaConfig, _url?: string): Promise<any> =>
    // config; url;
    Promise.resolve([
        {
            title: 'Local Storage (Test)',
            value: 'local',
        },
        {
            title: 'Another Storage (Test)',
            value: 'local',
        },
    ]);
