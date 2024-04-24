import bodyParser from "body-parser";
import dotenv from "dotenv";
import express, { Request } from "express";
import { StatusCodes } from "http-status-codes";

dotenv.config();

const app = express();

const hostname = process.env.HOSTNAME ?? "127.0.0.1";
const port = parseInt(process.env.PORT ?? "3000");

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

interface UserRequest {
  username: string | undefined;
  password: string | undefined;
}

const users = new Map<string, string>();

app.get("/", (_, res) => {
  res.status(StatusCodes.OK).send("Hello World!");
});

app.post("/signup", (req: Request<{}, {}, UserRequest>, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send("Username and password are required!");
    return;
  }

  if (users.has(username)) {
    res.status(StatusCodes.CONFLICT).send("User already exists");
    return;
  }

  users.set(username, password);

  res.status(StatusCodes.CREATED).send("User created successfully");
});

app.post("/login", (req: Request<{}, {}, UserRequest>, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .send("Username and password are required!");
    return;
  }

  if (!users.has(username) || users.get(username) !== password) {
    res.status(StatusCodes.UNAUTHORIZED).send("Invalid username or password");
    return;
  }

  res.status(StatusCodes.OK).send("Login successful");
});

app.listen(port, () => {
  console.log(`Server is running at http://${hostname}:${port}`);
});
