const User = require('../models/user.model');
const { success, created, noContent, badRequest, notFound } = require('../utils/response');

const UsersController = {
  async index(req, res, next) {
    try {
      const filters = {
        role: req.query.role,
        status: req.query.status,
        search: req.query.search
      };

      const users = await User.findAll(filters);
      const sanitizedUsers = users.map(user => ({
        id: user.id,
        name: user.name,
        phone: user.phone,
        username: user.username,
        role: user.role,
        avatar_url: user.avatar_url,
        status: user.status,
        last_login: user.last_login,
        created_at: user.created_at
      }));

      return success(res, sanitizedUsers);
    } catch (error) {
      next(error);
    }
  },

  async show(req, res, next) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);

      if (!user) {
        return notFound(res, 'User not found');
      }

      return success(res, {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        username: user.username,
        role: user.role,
        avatar_url: user.avatar_url,
        status: user.status,
        last_login: user.last_login,
        created_at: user.created_at
      });
    } catch (error) {
      next(error);
    }
  },

  async store(req, res, next) {
    try {
      const { name, email, username, password, phone, role } = req.body;

      if (!name || !email || !username || !password) {
        return badRequest(res, 'Name, email, username, and password are required');
      }

      const existingEmail = await User.findByEmail(email);
      if (existingEmail) {
        return badRequest(res, 'Email already exists');
      }

      const existingUsername = await User.findByUsername(username);
      if (existingUsername) {
        return badRequest(res, 'Username already exists');
      }

      const user = await User.create({ name, email, username, password, phone, role });

      return created(res, {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        status: user.status
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);

      if (!user) {
        return notFound(res, 'User not found');
      }

      const allowedFields = ['name', 'email', 'phone', 'username', 'role', 'status'];
      const data = {};
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          data[field] = req.body[field];
        }
      }

      // Prevent changing own role
      if (data.role && id === req.user.id) {
        return badRequest(res, 'Cannot change your own role');
      }

      // Prevent deactivating self
      if (data.status === 'inactive' && id === req.user.id) {
        return badRequest(res, 'Cannot deactivate your own account');
      }

      const updated = await User.update(id, data);

      return success(res, {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        username: updated.username,
        role: updated.role,
        avatar_url: updated.avatar_url,
        status: updated.status
      });
    } catch (error) {
      next(error);
    }
  },

  async destroy(req, res, next) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);

      if (!user) {
        return notFound(res, 'User not found');
      }

      // Prevent deleting self
      if (id === req.user.id) {
        return badRequest(res, 'Cannot delete your own account');
      }

      await User.delete(id);
      return noContent(res);
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['active', 'inactive'].includes(status)) {
        return badRequest(res, 'Valid status is required (active/inactive)');
      }

      const user = await User.findById(id);
      if (!user) {
        return notFound(res, 'User not found');
      }

      // Prevent deactivating self
      if (id === req.user.id && status === 'inactive') {
        return badRequest(res, 'Cannot deactivate your own account');
      }

      const updated = await User.update(id, { status });

      return success(res, {
        id: updated.id,
        name: updated.name,
        status: updated.status
      });
    } catch (error) {
      next(error);
    }
  },

  async updateRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!role || !['admin', 'collaborator'].includes(role)) {
        return badRequest(res, 'Valid role is required (admin/collaborator)');
      }

      const user = await User.findById(id);
      if (!user) {
        return notFound(res, 'User not found');
      }

      // Prevent changing own role
      if (id === req.user.id) {
        return badRequest(res, 'Cannot change your own role');
      }

      const updated = await User.update(id, { role });

      return success(res, {
        id: updated.id,
        name: updated.name,
        role: updated.role
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = UsersController;
