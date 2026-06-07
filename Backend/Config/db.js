import mongoose from "mongoose";

const connectDb = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('[DB] MONGODB_URI is not defined — check your .env file')
    process.exit(1)
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('[DB] Database connected successfully')
  } catch (error) {
    console.error('[DB] Connection failed:', error.message)
    process.exit(1)
  }
}

export default connectDb