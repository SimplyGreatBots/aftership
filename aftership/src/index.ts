import * as sdk from '@botpress/sdk'
import * as bp from '.botpress'
import axios from 'axios'
import { trackingResponseSchema } from './const'

export default new bp.Integration({
  register: async ({ logger, ctx }) => {
    logger.forBot().info(`Testing Aftership API key`)
  
    const apiKey = ctx.configuration.apiKey;
  
    const trackingOptions = {
      method: 'GET',
      url: 'https://api.aftership.com/v4/trackings',
      headers: {
        'Content-Type': 'application/json',
        'as-api-key': apiKey,
      },
      params: {},
    }
  
    try {
      const trackingResponse = await axios.request(trackingOptions)
      const validationResult = trackingResponseSchema.safeParse(trackingResponse.data)
  
      if (!validationResult.success) {
        logger.forBot().error(`Validation error: ${JSON.stringify(validationResult.error.issues)}`)
      }
      
      logger.forBot().info('Aftership API key validated')

    } catch (error) {
      if (axios.isAxiosError(error)) {
        const statusCode = error.response ? error.response.status : 'No Status Code'
        const statusText = error.response ? error.response.statusText : 'No Status Text'
  
        if (statusCode === 401) {
          logger.forBot().error('Authorization error: API key is not valid')
          throw new sdk.RuntimeError('Authorization error: API key is not valid')
        } else {
          const detailedMessage = `Axios error - ${statusCode} ${statusText}: ${error.message}`
          throw new sdk.RuntimeError(detailedMessage);
        }
      } else {
        logger.forBot().error(`Unexpected error: ${JSON.stringify(error, null, 2)}`)
        throw new sdk.RuntimeError(`Unexpected error: ${JSON.stringify(error, null, 2)}`)
      }
    }
  },
  unregister: async () => {
    throw new sdk.RuntimeError('Configuration unregister Not Implemented')
  },
  actions: {},
  channels: {},
  handler: async () => {
    
  },
})
