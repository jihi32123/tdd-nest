import { User } from '../model/user.model';

export const UserRepositoryToken = Symbol('UserRepositoryToken');

export interface UserRepositoryInterface {
  selectById(userId: number): Promise<User>;
  save(user: User): Promise<User>;
}
