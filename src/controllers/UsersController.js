const { hash, compare } = require('bcryptjs')
const AppError = require('../utils/AppError')
const UserRepository = require('../repositories/UserRepository')
const UserCreateService = require('../services/UserCreateService')
const sqliteConnection = require('../database/sqlite')

class UsersController {
  async create(req, resp) {
    const { name, email, password } = req.body

    const userRepository = new UserRepository()
    const userCreateService = new UserCreateService(userRepository)
    await userCreateService.execute({ name, email, password })

    return resp.status(201).json()
  }

  async update(req, resp) {
    const { name, email, password, old_password } = req.body
    const user_id = req.user.id

    const database = await sqliteConnection()
    const user = await database.get('SELECT * FROM users WHERE id = (?)', [
      user_id,
    ])

    if (!user) {
      throw new AppError('Usuário não encontrado')
    }

    const userWithUpdateEmail = await database.get(
      'SELECT * FROM users WHERE email = (?)',
      [email],
    )

    if (userWithUpdateEmail && userWithUpdateEmail.id !== user.id) {
      throw new AppError('Este e-mail já está em uso.')
    }

    user.name = name ?? user.name
    user.email = email ?? user.email

    if (password && !old_password) {
      throw new AppError(
        'Voce precisa informar a senha antiga para definir a nova senha.',
      )
    }

    if (password && old_password) {
      const checkOldPassword = await compare(old_password, user.password)

      if (!checkOldPassword) {
        throw new AppError('A senha antiga não confere.')
      }

      user.password = await hash(password, 8)
    }

    await database.run(
      'UPDATE users SET name = ?, email = ?, password = ?, updated_at = DATETIME("now") WHERE id = ?',
      [user.name, user.email, user.password, user_id],
    )

    return resp.json()
  }
}

module.exports = UsersController
