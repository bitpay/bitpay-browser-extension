import { Merchant } from './merchant';
import { set } from './storage';

export interface DirectoryCurationApiObject {
  displayName: string;
  merchants: string[];
}

export interface DirectoryCategoryApiObject {
  displayName: string;
  emoji: string;
  tags: string[];
  name?: string;
}

export interface DirectoryRawData {
  curated: {
    [category: string]: DirectoryCurationApiObject;
  };
  categories: {
    [category: string]: DirectoryCategoryApiObject;
  };
}

export interface DirectoryApiObject {
  curated: {
    [category: string]: DirectoryCurationApiObject;
  };
  categories: [DirectoryCategory?];
}

export interface DirectoryCuration extends DirectoryCurationApiObject {
  availableMerchants: Merchant[];
}

export interface DirectoryCategory extends DirectoryCategoryApiObject {
  availableMerchants: Merchant[];
}

export interface Directory {
  curated: {
    [category: string]: DirectoryCuration;
  };
  categories: [DirectoryCategory];
}

export interface DirectIntegrationApiObject {
  displayName: string;
  caption: string;
  cta?: {
    displayText: string;
    link: string;
  };
  icon: string;
  link: string;
  displayLink: string;
  tags: string[];
  domains: string[];
  discount?: {
    type: string;
    amount: number;
    currency?: string;
  };
  theme: string;
  instructions: string;
}

export interface DirectIntegration extends DirectIntegrationApiObject {
  name: string;
}

export interface DirectIntegrationMap {
  [name: string]: DirectIntegrationApiObject;
}

export const getDirectIntegrations = (res: DirectIntegrationMap): DirectIntegration[] =>
  Object.keys(res).map(name => ({ ...res[name], name }));

export function fetchDirectIntegrations(): Promise<DirectIntegration[]> {
  return fetch(`${process.env.API_ORIGIN}/merchant-directory/integrations`)
    .then(res => res.json())
    .then((merchantMap: DirectIntegrationMap) => getDirectIntegrations(merchantMap));
}

export function getFormattedCategories(directory: DirectoryRawData): Directory {
  const categories = Object.keys(directory.categories).map(key => ({ name: key, ...directory.categories[key] })) as [
    DirectoryCategoryApiObject
  ];
  const newDirectory = { curated: { ...directory.curated }, categories } as Directory;
  return newDirectory;
}

export const saturateDirectory = (
  directoryApiObject: DirectoryApiObject = { curated: {}, categories: [] },
  merchants: Merchant[] = []
): Directory => {
  const directory = { ...directoryApiObject } as Directory;
  Object.keys(directory.curated).forEach(category => {
    const categoryObj = directory.curated[category];
    categoryObj.availableMerchants = merchants
      .filter(
        merchant =>
          categoryObj.merchants.includes(merchant.displayName) ||
          (categoryObj.displayName === 'Popular Brands' && merchant.featured)
      )
      .sort(
        (a: Merchant, b: Merchant) =>
          categoryObj.merchants.indexOf(a.displayName) - categoryObj.merchants.indexOf(b.displayName)
      );
    if (categoryObj.availableMerchants.length === 0) delete directory.curated[category];
  });
  directory.categories.forEach((categoryObj, index) => {
    categoryObj.availableMerchants = merchants.filter(merchant =>
      categoryObj.tags.some(tag => merchant.tags.includes(tag))
    );
    if (categoryObj.availableMerchants.length === 0) directory.categories.splice(index, 1);
  });
  return directory;
};

export async function fetchDirectory(): Promise<Directory> {
  const directory = await fetch(`${process.env.API_ORIGIN}/merchant-directory/directory`).then(res => res.json());
  const newDirectory: Directory = getFormattedCategories(directory);
  await set<Directory>('directory', newDirectory);
  return newDirectory;
}
