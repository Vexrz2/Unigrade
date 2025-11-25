import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || '';

if (!MONGO_URI) {
    throw new Error('Please define the MONGO_URI environment variable inside .env.local');
}

let cached = global as any;

if (!cached.mongoose) {
    cached.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
    if (cached.mongoose.conn) {
        return cached.mongoose.conn;
    }

    if (!cached.mongoose.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.mongoose.promise = mongoose.connect(MONGO_URI, opts).then((mongoose) => {
            return mongoose;
        });
    }

    try {
        cached.mongoose.conn = await cached.mongoose.promise;
    } catch (e) {
        cached.mongoose.promise = null;
        throw e;
    }

    return cached.mongoose.conn;
}
