import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateTodo } from '../../helpers/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
    const userId = getUserId(event)
    if (!todoId) {

      return {

        statusCode: 400,
        body: JSON.stringify({ error: 'todoId not valid ....' })
      }
    }

    const todoEdited = await updateTodo(userId, todoId, updatedTodo)
    if (!todoEdited) {

      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'todo not found ' })
      }

    }



    return {
      statusCode: 200,
      body: ''
    }
  })


handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
