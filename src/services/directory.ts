import { Merchant } from './merchant';
import { set, get } from './storage';

export interface DirectoryCurationApiObject {
  displayName: string;
  merchants: string[];
}

export interface DirectoryCategoryApiObject {
  displayName: string;
  emoji: string;
  tags: string[];
}

export interface CurationsObject {
  [curation: string]: DirectoryCurationApiObject;
}

export interface CategoriesObject {
  [category: string]: DirectoryCategoryApiObject;
}

export interface DirectoryRawData {
  curated: CurationsObject;
  categories: CategoriesObject;
}

export interface DirectoryCuration extends DirectoryCurationApiObject {
  availableMerchants: Merchant[];
  name: string;
}

export interface DirectoryCategory extends DirectoryCategoryApiObject {
  availableMerchants: Merchant[];
  name: string;
}

export interface Directory {
  curated: DirectoryCuration[];
  categories: DirectoryCategory[];
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

export function convertToArray<T>(object: { [key: string]: T }): T[] {
  return Object.keys(object).map(key => ({ name: key, ...object[key] }));
}

export function convertObjectsToArrays(directory: DirectoryRawData): Directory {
  const categories = convertToArray(directory.categories);
  const curated = convertToArray(directory.curated);
  const newDirectory = { curated, categories } as Directory;
  return newDirectory;
}

export const saturateDirectory = (
  unsaturatedDirectory: Directory = { curated: [], categories: [] },
  merchants: Merchant[] = []
): Directory => {
  const directory = { ...unsaturatedDirectory } as Directory;
  directory.curated = unsaturatedDirectory.curated
    .map(curation => ({
      ...curation,
      availableMerchants: merchants
        .filter(
          merchant =>
            curation.merchants.includes(merchant.displayName) ||
            (curation.displayName === 'Popular Brands' && merchant.featured)
        )
        .sort(
          (a: Merchant, b: Merchant) =>
            curation.merchants.indexOf(a.displayName) - curation.merchants.indexOf(b.displayName)
        )
    }))
    .filter(curation => curation.availableMerchants.length);
  directory.categories = unsaturatedDirectory.categories
    .map(category => ({
      ...category,
      availableMerchants: merchants.filter(merchant => category.tags.some(tag => merchant.tags.includes(tag)))
    }))
    .filter(category => category.availableMerchants.length);
  return directory;
};

export async function fetchDirectory(): Promise<Directory> {
  const directory = await fetch(`${process.env.API_ORIGIN}/merchant-directory/directory`).then(res => res.json());
  const newDirectory: Directory = convertObjectsToArrays(directory);
  await set<Directory>('directory', newDirectory);
  return newDirectory;
}

export async function getCachedDirectory(): Promise<Directory> {
  // TODO: Remove this method in a few months (after we're sure everyone has the updated directory schema saved)
  const savedDirectory = (await get<Directory | DirectoryRawData | undefined>('directory')) || {
    curated: [],
    categories: []
  };
  return savedDirectory && Array.isArray(savedDirectory.categories) && Array.isArray(savedDirectory.curated)
    ? (savedDirectory as Directory)
    : convertObjectsToArrays(savedDirectory as DirectoryRawData);
}
