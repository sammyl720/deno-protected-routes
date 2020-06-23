import { Application } from "https://deno.land/x/oak/mod.ts";
import { router } from './routes.ts'

const app = new Application()

app.use(router.routes(), router.allowedMethods())

console.log('Server started 127.0.0.1:3000')
app.listen({ port: 3000 })
