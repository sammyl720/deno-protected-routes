interface User {
  _id?: { $oid: string };
  name: string;
  email: string;
  password: string
}

interface Post {
  _id?: { $oid: string };
  userId: { $oid: string };
  text: string;
  date: Date;
}

export {
  User,
  Post
}