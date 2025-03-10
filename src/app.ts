import express, { Request, Response } from 'express';
import mongoose from 'mongoose';

import auth from './middlewares/auth';
import { requestLogger, errorLogger } from './middlewares/logger';

import usersRouter from './routes/users';
import cardsRouter from './routes/cards';

import { login, createUser } from './controllers/users';

const { PORT = 3000 } = process.env;
const app = express();

mongoose.connect('mongodb://localhost:27017/mestodb');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(requestLogger);

app.use('/signin', login);
app.use('/signup', createUser);

app.use(auth);

app.use('/users', usersRouter);
app.use('/cards', cardsRouter);

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Страница не найдена' });
});

app.use(errorLogger);

app.use((err: Error, _req: Request, res: Response) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode).send({ message: statusCode === 500 ? 'На сервере произошла ошибка' : message });
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
