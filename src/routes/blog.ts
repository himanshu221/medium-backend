import { Hono } from "hono";
import { verify } from "hono/jwt";
import { PrismaClient } from "@prisma/client/edge"
import { withAccelerate } from "@prisma/extension-accelerate"
import { createBlogSchema, updateBlogSchema } from "@himanshu212/medium-commons";

export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string
    },
    Variables: {
        userId: string
    }
}>()

blogRouter.use('/*', async (c, next) => {
    const token = c.req.header("authorization") || ""
    try{
        const decodeToken = await verify(token.split(" ")[1], c.env.JWT_SECRET)
        if(!decodeToken){
            c.status(403)
            return c.json({
                message: "User Not Authorized"
            })
        }
        c.set("userId", decodeToken.userId)
        await next()
    }catch(e) {
        c.status(403)
        return c.json({
            message: "User Not Authorized"
        })
    }
})
blogRouter.post('/', async (c) => {
    const body = await c.req.json()
    const validation = createBlogSchema.safeParse(body)
    
    if(!validation.success){
      c.status(411)
      return c.json({
        message : validation.error
      })
    }
    const authorId = c.get("userId")
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate())

    try{
        await prisma.blog.create({
            data: {
                title: body.title,
                content: body.content,
                authorId: Number(authorId)
            }
        })

        return c.json({
            message: "Successfully created blog"
        })
    } catch(e) {
        c.status(411)
        return c.json({
            message: "Error ocuured while saving blog"
        })
    }
})
blogRouter.put('/', async (c) => {
    const body = await c.req.json()
    const validation = updateBlogSchema.safeParse(body)
    
    if(!validation.success){
      c.status(411)
      return c.json({
        message : validation.error
      })
    }
    const authorId = c.get("userId")
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate())

    try{
        await prisma.blog.update({
            where: {
                id: body.id,
                authorId: Number(authorId)
            },
            data: {
                title: body.title,
                content: body.content
            }
        })
        return c.json({
            message: "Successfully updated blog"
        })
    } catch(e) {
        c.status(411)
        return c.json({
            message: "Error ocuured while updating blog"
        })
    }
})

blogRouter.get('/bulk', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate())

    try {
        const blogList = await prisma.blog.findMany({
            select: {
                id: true,
                title: true,
                content: true,
                publishDate: true,
                author: {
                    select: {
                        firstname: true,
                        lastname: true
                    }
                }
            }
        })
        return c.json({blogList})
    }catch(e){
        c.status(411)
        return c.json({
            message: "Error ocuured while retrieving blogs"
        })
    }
})

blogRouter.get('/:id', async (c) => {
    const id = c.req.param("id")
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
      }).$extends(withAccelerate())

    try{
        const resp = await prisma.blog.findFirst({
            where: {
                id: Number(id)
            },
            select: {
                id: true,
                title: true,
                content: true,
                publishDate: true,
                author: {
                    select: {
                        firstname: true,
                        lastname: true
                    }
                }
            }
        })
        return c.json({blog: resp})
    } catch(e) {
        c.status(411)
        return c.json({
            message: `Error ocuured while retrieving blog with id: ${id}`
        })
    }
})