import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { Error } from 'mongoose';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/user';
import NotFoundError from '../helpers/errors/NotFoundError';
import ClientError from '../helpers/errors/ClientError';

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
    const user: IUser | null = await User
      .findById(req.params.userId === 'me' ? req.user._id : req.params.userId)
      .orFail(() => new NotFoundError('Пользователь не найден'));

    res.send({ data: user });
  } catch (error) {
    if (error instanceof Error.CastError) {
      next(new ClientError('Некорректный id пользователя'));
    } else {
      next(error);
    }
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      email, password, name, about, avatar,
    } = req.body;

    await bcrypt.hash(password, 10)
      .then((hash) => User.create({
        email, password: hash, name, about, avatar,
      }))
      .then((user) => {
        res.send({ data: user });
      })
      .catch((error) => next(error));
  } catch (error) {
    if (error instanceof Error.ValidationError) {
      next(new ClientError('Переданы некорректные данные при создании пользователя'));
    } else {
      next(error);
    }
  }
};

export const updateUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user._id;
    const { name, about } = req.body;

    const result = await User.updateOne({ _id: userId }, { name, about });

    if (result.modifiedCount > 0) {
      res.send({ message: 'Профиль успешно обновлён' });
    } else {
      next(new NotFoundError('Профиль не был обновлён'));
    }
  } catch (error) {
    if (error instanceof Error.ValidationError) {
      next(new ClientError('Переданы некорректные данные при обновлении пользователя'));
    } else {
      next(error);
    }
  }
};

export const updateUserAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user._id;
    const { avatar } = req.body;

    const result = await User.updateOne({ _id: userId }, { avatar });

    if (result.modifiedCount > 0) {
      res.send({ message: 'Аватар успешно обновлён' });
    } else {
      next(new NotFoundError('Аватар не был обновлён'));
    }
  } catch (error) {
    if (error instanceof Error.ValidationError) {
      next(new ClientError('Переданы некорректные данные при обновлении аватара'));
    } else {
      next(error);
    }
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user: IUser = await User.findUserByCredentials(email, password, next);
    const token = jwt.sign({ _id: user._id }, 'secret-key', { expiresIn: '7d' });
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.send({ message: 'Авторизация прошла успешно' });
  } catch (error) {
    if (error instanceof Error.ValidationError) {
      next(new ClientError('Переданы некорректные данные при создании пользователя'));
    } else {
      next(error);
    }
  }
};
