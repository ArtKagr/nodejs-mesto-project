import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import UnauthorizedError from '../helpers/errors/UnauthorizedError';
import { IUser } from '../models/user';

export default (req: Request, res: Response, next: NextFunction) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  try {
    req.user = jwt.verify(token, 'secret-key') as IUser;
  } catch (_) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  return next();
};
