import dns from 'node:dns'
import mongoose from 'mongoose'

// Some ISP/router DNS resolvers refuse SRV record lookups (used by mongodb+srv://)
// even though they resolve normal A records fine, causing `querySrv ECONNREFUSED`.
// Forcing a public resolver here works around that on affected networks.
dns.setServers(['8.8.8.8', '1.1.1.1'])

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) throw new Error("please define the MONGODB_URI env variable");

declare global {
    var mongooseCache: {
        conn: typeof mongoose | null
        promise: Promise<typeof mongoose> | null
    }
}

let cached = global.mongooseCache || (global.mongooseCache = { conn: null, promise: null });

export const connectToDatabase = async () => {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        console.error('MongoDB connection error. Please make sure MongoDB is running, ' + e);
        throw e;
    }

    console.info("Connected to MongoDB");
    return cached.conn;
}