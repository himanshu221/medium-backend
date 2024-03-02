import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { verify, sign, decode } from 'hono/jwt'
import { TraceException } from '@cloudflare/workers-types'
import { userRouter } from './routes/user'
import { blogRouter } from './routes/blog'

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string,
    JWT_SECRET: string
  }
}>()
app.use(cors())
app.route('/api/v1/user', userRouter)
app.route('/api/v1/blog', blogRouter)


export default app
