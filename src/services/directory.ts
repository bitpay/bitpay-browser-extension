export interface DirectoryCategory {
  displayName: string;
  emoji: string;
  tags: string[];
}

export interface DirectoryTopLevelCategory {
  displayName: string;
  merchants: string[];
}

export interface Directory {
  curated: {
    [category: string]: DirectoryTopLevelCategory;
  };
  categories: {
    [category: string]: DirectoryCategory;
  };
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

export function fetchDirectory(): Promise<Directory> {
  return fetch(`${process.env.API_ORIGIN}/merchant-directory/directory`).then(res => res.json());
}
