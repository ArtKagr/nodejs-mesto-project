import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import UnauthorizedError from '../helpers/errors/UnauthorizedError';
import { IUser } from '../models/user';

export default (req: Request, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  const { token } = req.cookies;

  try {
    req.user = jwt.verify(token, 'secret-key') as IUser;
  } catch (_) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  return next();
};
