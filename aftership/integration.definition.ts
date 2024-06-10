import { IntegrationDefinition, z } from '@botpress/sdk'
import { integrationName } from './package.json'

export default new IntegrationDefinition({
  name: integrationName,
  version: '0.0.1',
  readme: 'hub.md',
  icon: 'icon.svg',
  title: 'Aftership',
  description: 'Aftership integration for Botpress',
  configuration: {
    schema: z.object({
      apiKey: z.string().describe('Aftership API Key'),
      secret: z.string().describe('Aftership Secret'),
    }),
  },
  channels: {},
  actions:{},
})
