import { todosAccess } from './todosAcess'
import { attachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'

// TODO: Implement businessLogic
const todoAccess = new todosAccess()
const attachmentUtil = new attachmentUtils()
const logger = createLogger('todos')
export async function createTodo(userId: string, createTodoRequest: CreateTodoRequest): Promise<TodoItem> {
    const s3 = process.env.ATTACHMENT_S3_BUCKET

    const todoId = uuid.v4()
    logger.info('Create new Todo', { userId })

    return await todoAccess.createTodo({
        name: createTodoRequest.name,
        userId: userId,
        todoId: todoId,
        createdAt: new Date().toISOString(),
        dueDate: createTodoRequest.dueDate,
        done: false,
        attachmentUrl: `https://${s3}.s3.amazonaws.com/${todoId}`,
        ...createTodoRequest


    } as TodoItem)

}

export async function updateTodo(userId: string,
    todoId: string,
    updateTodoRequest: UpdateTodoRequest):
    Promise<boolean> {
    return await todoAccess.updateTodo(userId, todoId, updateTodoRequest)
}

export async function deleteTodo(userId: string, todoId: string): Promise<void> {
    await todoAccess.deleteTodo(userId, todoId)
}

export async function getAllTodos(userId: string): Promise<TodoItem[]> {
    const todos = await todoAccess.getAllTodos(userId)

    console.log(todos)
    return todos
}




export async function createAttachmentPresignedUrl(userId: string, todoId: string): Promise<string | null> {

    const item = await todoAccess.findById(userId, todoId)
    if (!item) { return null }
    return await attachmentUtil.getUploadUrl(todoId)
}