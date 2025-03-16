import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

describe('User Entity', () => {
  beforeAll(() => {
    jest.spyOn(bcrypt, 'hashSync').mockReturnValue('n2ow09wn0w3f');
  });
  it('should be able create a instance of user', () => {
    const user = User.create({
      name: 'John Doe',
      email: 'john@email.com',
      password: 'pwd12345',
    });

    expect(user).toBeInstanceOf(User);
    expect(user.name).toBe('John Doe');
    expect(user.email).toBe('john@email.com');
    expect(user.password).not.toBe('pwd12345');
  });

  it('should throw an error if password is less than 8 characters', () => {
    expect(() =>
      User.create({
        name: 'John Doe',
        email: 'john@email.com',
        password: 'pwd1234',
      }),
    ).toThrow();
  });

  it('should be able compare password', () => {
    const mockCompare = jest.spyOn(bcrypt, 'compareSync');
    mockCompare.mockReturnValue(true);
    const user = User.create({
      name: 'John Doe',
      email: 'john@email.com',
      password: 'pwd12345',
    });

    expect(user.comparePassword('pwd12345')).toBeTruthy();

    mockCompare.mockReturnValue(false);
    expect(User.comparePassword('pwd12345', 'pwd12345')).toBeFalsy();
  });
});
