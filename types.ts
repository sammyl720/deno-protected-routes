interface User {
  _id?: { $oid: string };
  name: string;
  email: string;
  password: string
}

const users: User[] = []

export {
  users,
  User
}