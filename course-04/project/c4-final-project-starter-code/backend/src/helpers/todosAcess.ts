import * as AWSXRay from 'aws-xray-sdk';

import * as AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { createLogger } from '../utils/logger';
import { TodoItem } from '../models/TodoItem';
import { TodoUpdate } from '../models/TodoUpdate';


const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class todosAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE || '',
    private readonly indexName = process.env.TODOS_CREATED_AT_INDEX || ''

  ) { }

  async getAllTodos(userId: string) {
    const result = await this.docClient.query({

      TableName: this.todosTable,
      IndexName: this.indexName,

      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise()

    return result
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {

    await this.docClient.put({
      TableName: this.todosTable,
      Item: todo

    }).promise()
    return todo as TodoItem
  }

  async findById(todoId: string, userId: string): Promise<TodoItem | null> {
    const result = await this.docClient.query({
      TableName: this.todosTable,
      IndexName: this.indexName,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':todoId': todoId
      },

    }).promise()
    if (!result.Items) {
      logger.info('not found')

      return
    }
    return result.Items[0] as TodoItem

  }

  async updateTodo(todoId: string,userId: string, updateTodo: TodoUpdate): Promise<boolean> {
    const todo = await this.findById(todoId,userId);
    if (!todo) {
      return false
    }
    await this.docClient.update({
      TableName: this.todosTable,
      Key: { userId, todoId },
      UpdateExpression:
        'set itemName = :itemName , dueDate = :dueDate ,done = :done',
      ExpressionAttributeValues: {
        ':itemName': updateTodo.name,
        ':dueDate': updateTodo.dueDate,
        ':done': updateTodo.done,

      }


    }).promise()
    return true
  }

  async deleteTodo(userId: string, todoId: string): Promise<void> {

    await this.docClient.delete({
      TableName: this.todosTable, Key: {
        userId: userId,
        todoId: todoId
      }
    }).promise()
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}



