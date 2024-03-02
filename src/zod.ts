import z from 'zod'

export const signupSchema  = z.object({
    username: z.string().email(),
    password: z.string().min(7),
    firstname: z.string().optional(),
    lastname: z.string().optional()
})

export const signinSchema  = z.object({
    username: z.string().email(),
    password: z.string().min(7)
})

export const createBlogSchema = z.object({
    title: z.string(),
    content: z.string()
})

export type SignupSchema = z.infer<typeof signupSchema>
export type SigninSchema = z.infer<typeof signinSchema>
export type CreateBlogSchema = z.infer<typeof createBlogSchema>