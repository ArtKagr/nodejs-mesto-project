import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import UnauthorizedError from '../helpers/errors/UnauthorizedError';

// @ts-ignore
interface SessionRequest extends Request {
  user?: string | JwtPayload;
}

// eslint-disable-next-line consistent-return
export default (req: SessionRequest, res: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  const token = authorization.replace('Bearer ', '');

  try {
    req.user = jwt.verify(token, 'secret-key');
  } catch (_) {
    return next(new UnauthorizedError('Необходима авторизация'));
  }

  next();
};
