import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { createAttachmentPresignedUrl } from '../../helpers/todos'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    if (!todoId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'todoId is not valid !' })

      }
    }
    const uploadUrl = await createAttachmentPresignedUrl(todoId)
    if (!uploadUrl) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'todo not found !' })
      }
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ uploadUrl })
    }

  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
