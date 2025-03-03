import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

import usersRouter from './routes/users';
import cardsRouter from './routes/cards';

const { PORT = 3000 } = process.env;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/mestodb');

app.use((req: Request, res: Response, next: NextFunction) => {
  req.user = {
    _id: '67c2ebbf8d4c8c652b22c142',
  };

  next();
});

app.use('/users', usersRouter);
app.use('/cards', cardsRouter);

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Страница не найдена' });
});

app.use((err: Error, _req: Request, res: Response) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode).send({ message: statusCode === 500 ? 'На сервере произошла ошибка' : message });
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
