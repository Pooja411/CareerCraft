# CareerCraft (MERN)

Mini Project Sem 5

## Run locally (Next.js app)

- **Env file**: create `.env.local` in the project root with for demo/showing purposes:

```bash
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/careercraft?retryWrites=true&w=majority"
```

- **Install & run**:
  - `npm install`
  - `npm run dev`

Then open `http://localhost:3000`.

## MongoDB + Mongoose wiring

- **Connection helper**: `lib/db.ts` exports `connectToDatabase()`, which uses `mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 })` and caches the connection on `global`.
- **User model**: `models/User.ts` defines a `User` schema (email, name, avatarUrl, skills, resumePath, profile, timestamps) and exports the Mongoose model.
- **API routes using MongoDB**:
  - `app/api/users/[email]/route.ts` — `GET`/`PUT` profile; calls `connectToDatabase()` then `User.findOne` / `User.findOneAndUpdate`.
  - `app/api/users/[email]/skills/route.ts` — `PUT` skills array.
  - `app/api/users/[email]/resume/route.ts` — uploads a PDF, saves to `public/uploads`, and stores `resumePath` on the `User` document.

All of this is already in place for **showing that the project uses MongoDB + Mongoose**, even if you don’t have a real database running.
