const UserCreateService = require('./UserCreateService')
const UserRepositoryInMemory = require('../repositories/UserRepositoryInMemory')
const AppError = require('../utils/AppError')

describe('UserCreateService', () => {
  let userRepositoryInMemory = null
  let userCreateService = null

  beforeEach(() => {
    userRepositoryInMemory = new UserRepositoryInMemory()
    userCreateService = new UserCreateService(userRepositoryInMemory)
  })

  it('user should be create', async () => {
    const user = {
      name: 'User Test',
      email: 'user@test.com',
      password: '123',
    }

    const userCreated = await userCreateService.execute(user)
    expect(userCreated).toHaveProperty('id')
  })

  it('user not should be create with email already exists', async () => {
    const userOne = {
      name: 'User Test 1',
      email: 'user@test.com',
      password: '123',
    }

    const userTwo = {
      name: 'User Test 2',
      email: 'user@test.com',
      password: '456',
    }

    await userCreateService.execute(userOne)
    await expect(userCreateService.execute(userTwo)).rejects.toEqual(
      new AppError('Este e-mail já está em uso.'),
    )
  })
})
