import { Router, RouterContext } from "https://deno.land/x/oak/mod.ts";
import { renderFile } from 'https://deno.land/x/dejs@0.7.0/mod.ts'
import { hash, compare } from "https://deno.land/x/bcrypt/mod.ts";

import { User, users } from './types.ts';
const router = new Router()


router.get('/', async ( ctx: RouterContext) => {
  ctx.response.body = await renderFile(`${Deno.cwd()}/views/home.ejs`, {})
})
router.get('/register', async ( ctx: RouterContext) => {
  ctx.response.body = await renderFile(`${Deno.cwd()}/views/register.ejs`, {
    error: false
  })
})
router.get('/login', async ( ctx: RouterContext) => {
  ctx.response.body = await renderFile(`${Deno.cwd()}/views/login.ejs`, {
    error: false
  })
})

router.post('/login', async (ctx: RouterContext) => {
  const body = await ctx.request.body()
  const user = {
    email: body.value.get('email'),
    password: body.value.get('password')// needs encryption
  }

  const userExists: User | any = users.find(u => u.email === body.value.get('email'))
  if(!userExists){
    console.log('invalid credentails')
    ctx.response.body = await renderFile(`${Deno.cwd()}/views/login.ejs`, {
      error: 'Invalid Credentails'
    })
  } else if(! await compare(body.value.get('password'), userExists.password)) {
    console.log('invalid password')
    ctx.response.body = await renderFile(`${Deno.cwd()}/views/login.ejs`, {
      error: 'Invalid Credentails'
    })
  } else {
    ctx.response.redirect('/protected')
  }
  console.log(user)
})

router.post('/register', async(ctx: RouterContext) => {
  const body = await ctx.request.body()
  const hashedPassword = await hash(body.value.get('password'))
  const user:User =  {
    name: body.value.get('name'),
    email: body.value.get('email'),
    password: hashedPassword
  }
  console.log(user)
  const userExists = users.find(u => u.email === user.email)
  if(userExists){
    console.log('user exists already')
    ctx.response.body =  await renderFile(`${Deno.cwd()}/views/register.ejs`, {
      error: 'User exists already'
    })
  } else {
    users.push(user)
    ctx.response.redirect('/login')
  }

})

router.get('/protected', async(ctx:RouterContext) => {
  ctx.response.body = "This is a protected route"
})
export {
  router
}