export type Environment = 'prod' | 'test' | 'dev'

export type EnvironmentMetadata = {
  aptosAddress: string
  solanaAddress: string
}

const PROD: EnvironmentMetadata = {
  aptosAddress: '',
  solanaAddress: ''
}

export function environment(e: Environment) {
  // TODO
  switch (e) {
    case 'prod':
      return PROD
  }
}
