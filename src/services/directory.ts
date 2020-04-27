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
