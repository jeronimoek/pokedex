export interface PokemonList {
  results: {
    name: string;
    url: string;
  }[];
}

export interface Pokemon {
  name: string;
  species: {
    url: string;
  };
}

export interface Species {
  evolution_chain: {
    url: string;
  };
}

export interface ChainLink {
  evolves_to: ChainLink[];
  species: {
    url: string;
  };
}

export interface EvolutionChain {
  chain: ChainLink;
}
