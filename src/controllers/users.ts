import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/user';
import { NotFoundError, ClientError } from '../helpers/errors';

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users: IUser[] = await User.find({});
    res.send({ data: users });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user: IUser | null = await User.findById(req.params.userId);

    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }

    res.send({ data: user });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, about, avatar } = req.body;

    if (!name || !about || !avatar) {
      throw new ClientError('Переданы некорректные данные при создании пользователя');
    }

    const user: IUser = await User.create({ name, about, avatar });
    res.send({ data: user });
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user._id;
    const { name, about } = req.body;

    if (!about && !name) {
      throw new ClientError('Переданы некорректные данные при обновлении пользователя');
    }

    const result = await User.updateOne({ _id: userId }, { name, about });

    if (result.modifiedCount === 0) {
      throw new ClientError('Профиль не был обновлён');
    }
    res.send({ message: 'Профиль успешно обновлён' });
  } catch (error) {
    next(error);
  }
};

export const updateUserAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user._id;
    const { avatar } = req.body;

    if (!avatar) {
      throw new ClientError('Переданы некорректные данные при обновлении аватара');
    }

    const result = await User.updateOne({ _id: userId }, { avatar });

    if (result.modifiedCount > 0) {
      res.send({ message: 'Аватар успешно обновлён' });
    } else {
      throw new ClientError('Аватар не был обновлён');
    }
  } catch (error) {
    next(error);
  }
};
