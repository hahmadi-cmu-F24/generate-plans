import mongoose from "mongoose";

declare global {
  var mongooseCache:
    | { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }
    | undefined;
}

const cached = global.mongooseCache ?? { conn: null, promise: null };
global.mongooseCache = cached;

export async function connectDB(uri: string) {
  mongoose.set("strictQuery", true);

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri).then((connection) => {
      console.log("✅ MongoDB connected");
      return connection;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
