export interface Reference {
  name: string;
  url: string;
}

export interface List {
  results: Reference[];
}

export interface Pokemon {
  id: number;
  name: string;
  species: Reference;
  types: {
    type: Reference;
  }[];
  sprites: {
    front_default: string;
  };
  stats: {
    base_stat: number;
    effort: number;
    stat: {
      name: string;
    };
  }[];
}

export interface Species {
  name: string;
  generation: Reference;
  evolution_chain: Reference;
  varieties: { is_default: boolean; pokemon: Reference }[];
}

export interface ChainLink {
  evolves_to: ChainLink[];
  species: Reference;
}

export interface CustomLink<T> {
  evolvesTo: CustomLink<T>[];
  pokemon: T;
}

export interface EvolutionChain {
  chain: ChainLink;
}
