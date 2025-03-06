import { model, Schema, Model } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import { NextFunction } from 'express';
import UnauthorizedError from '../helpers/errors/UnauthorizedError';

export interface IUser {
  _id: string;
  email: string;
  password: string;
  name: string;
  about: string;
  avatar: string;
}

interface UserModel extends Model<IUser> {
  // eslint-disable-next-line no-unused-vars
  findUserByCredentials: (email: string, password: string, next: NextFunction) => Promise<IUser>;
}

declare global {
  // eslint-disable-next-line no-unused-vars
  namespace Express {
    // eslint-disable-next-line no-unused-vars
    interface Request {
      user: {
        _id: string;
      }
    }
  }
}

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Error {
    statusCode: number;
  }
}

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: (v: string) => validator.isEmail(v),
      message: 'Неправильный формат почты',
    },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Жак-Ив Кусто',
  },
  about: {
    type: String,
    minlength: 2,
    maxlength: 200,
    default: 'Исследователь',
  },
  avatar: {
    type: String,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
  },
});

userSchema.static('findUserByCredentials', function findUserByCredentials(email: string, password: string, next: NextFunction) {
  return this.findOne({ email })
    .select('+password')
    .then((user: IUser) => {
      if (!user) {
        return next(new UnauthorizedError('Неправильные почта и пароль'));
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return next(new UnauthorizedError('Неправильные почта и пароль'));
          }

          return user;
        });
    });
});

export default model<IUser, UserModel>('user', userSchema);
