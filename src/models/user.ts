import { model, Schema } from 'mongoose';

export interface IUser {
  _id: string;
  name: string;
  about: string;
  avatar: string;
}

declare global {
  // eslint-disable-next-line no-unused-vars
  namespace Express {
    // eslint-disable-next-line no-unused-vars
    interface Request {
      user: IUser;
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
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true,
  },
  about: {
    type: String,
    minlength: 2,
    maxlength: 200,
    required: true,
  },
  avatar: {
    type: String,
    required: true,
  },
});

export default model<IUser>('user', userSchema);
