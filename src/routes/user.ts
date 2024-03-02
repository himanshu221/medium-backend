import { PrismaClient } from "@prisma/client/edge"
import { withAccelerate } from "@prisma/extension-accelerate"
import { sign } from "hono/jwt"
import { Hono } from "hono"

export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string
    }
}>()

userRouter.post('/signup', async (c) => {
    const body = await c.req.json()
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    try{
        const res = await prisma.user.create({
          data: {
            firstname: body.firstname,
            lastname: body.lastname,
            username: body.username,
            password: body.password
          },
          select: {
            id: true
          }
        })
  
        const jwt = await sign({
          userId: res.id
        }, c.env.JWT_SECRET)
  
        return c.json({ token : jwt })
    } catch(e) {
        c.status(411)
        return c.json({
          message: "Invalid"
        })
    }
  })
  
  userRouter.post('/signin', async (c) => {
    const body = await c.req.json()
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
  
      const res = await prisma.user.findFirst({
        where: {
          username: body.username,
          password: body.password
        }
      })
  
      if(!res){
        c.status(411)
        return c.json({
          message: "User Not found! Please Sign up"
        })
      }
  
      const jwt = await sign({userId: res.id}, c.env.JWT_SECRET)
      return c.json({ token : jwt })
  })

