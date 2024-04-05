import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// async function main() {
//   // ... you will write your Prisma Client queries here
//   const allUsers = await prisma.user.findMany();
//   console.log(allUsers);
// }

// async function create() {
//   await prisma.user.create({
//     data: {
//       name: "Alice",
//       email: "alice@prisma.io",
//       posts: {
//         create: { title: "Hello World" },
//       },
//       profile: {
//         create: { bio: "I like turtles" },
//       },
//     },
//   });

//   const allUsers = await prisma.user.findMany({
//     include: {
//       posts: true,
//       profile: true,
//     },
//   });
//   console.dir(allUsers, { depth: null });
// }

// create()
//   .then(async () => {
//     await prisma.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prisma.$disconnect();
//     process.exit(1);
//   });

const app = express();

app.use(cors());

app.get("/api/admin", (req, res) => {
  console.log(req);
  res.send({
    age: 21,
    name: "Artem",
  });
});

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});
