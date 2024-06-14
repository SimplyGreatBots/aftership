import * as sdk from '@botpress/sdk'
import * as bp from '.botpress'
import axios from 'axios'
import { aftershipWebhookEventSchema, trackingResponseSchema } from './const'
import { log } from 'console'

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
  },
  actions: {
    createTracking: async (args): Promise<{}> => {
      args.logger.forBot().info('Creating Tracking')
      
      const apiKey = args.ctx.configuration.apiKey
      const trackingNumber = args.input.trackingNumber
      const slug = args.input.slug || ''
      const title = args.input.title || ''
      const conversationId = args.input.conversationId  

      var trackingOptions = {
        method: 'POST',
        url: 'https://api.aftership.com/tracking/2024-04/trackings',
        headers: {'Content-Type': 'application/json', 'as-api-key': apiKey },
        data: {
          tracking: {
            slug: slug,
            tracking_number: trackingNumber,
            title: title,
            custom_fields: {
              conversation_id: conversationId,
            }
          }
        }
      }

      try {
        const trackingResponse = await axios.request(trackingOptions)
        const validationResult = trackingResponseSchema.safeParse(trackingResponse.data)
    
        if (!validationResult.success) {
          args.logger.forBot().error(`Validation error: ${JSON.stringify(validationResult.error.issues)}`)
        }
        args.logger.forBot().info('Tracking created')
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const statusCode = error.response ? error.response.status : 'No Status Code'
          const statusText = error.response ? error.response.statusText : 'No Status Text'
          args.logger.forBot().error(`Axios error - ${statusCode} ${statusText}: ${error.message}`)
          throw new sdk.RuntimeError(`Axios error - ${statusCode} ${statusText}: ${error.message}`)
        } else {
          args.logger.forBot().error(`Unexpected error: ${JSON.stringify(error, null, 2)}`)
          throw new sdk.RuntimeError(`Unexpected error: ${JSON.stringify(error, null, 2)}`)
        }
      }

      return {}
    }
  },
  channels: {},
  handler: async ({ req, logger, client }) => {

    const bodyObject = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const parsedData = aftershipWebhookEventSchema.safeParse(bodyObject)
  
    if (!parsedData.success) {
      logger.forBot().error('Invalid Aftership webhook event:', parsedData.error)
      return
    }
    
    logger.forBot().info('Aftership webhook event received:', parsedData.data)
    const conversation_id = parsedData.data.msg.custom_fields?.conversation_id;

    if (!conversation_id) {
      logger.forBot().warn('No conversation ID found in the webhook payload.')
      throw new sdk.RuntimeError('No conversation ID found in the webhook payload.')
    }

    if (parsedData.data.is_tracking_first_tag) {
      try {
        const aftershipEvent = await client.createEvent({
          type: 'aftershipEvent',
          conversationId: conversation_id,
          payload: {
            conversation: {
              id: conversation_id
            },
            data: parsedData.data 
          },
        })
        
        logger.forBot().debug('Aftership event created successfully.', aftershipEvent);
      } catch (error) {
        logger.forBot().error('Failed to create Aftership event:', error);
      }
    } else {
      logger.forBot().warn('Non-initial tracking update received; no event created.');
    }
  }
})
