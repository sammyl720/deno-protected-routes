import { Router, RouterContext } from "https://deno.land/x/oak/mod.ts";
import { renderFile } from 'https://deno.land/x/dejs@0.7.0/mod.ts'
import { hash, compare } from "https://deno.land/x/bcrypt/mod.ts";
import { makeJwt, setExpiration, Jose, Payload } from "https://deno.land/x/djwt/create.ts";
import "https://deno.land/x/dotenv/load.ts";
import { User, users } from './types.ts';
import authMiddleware from './authMiddleware.ts';
const router = new Router()

console.log(Deno.env.get('TEST'))
router.get('/', async ( ctx: RouterContext) => {
  if(ctx.state.currentUser) {
    ctx.response.redirect('/protected')
  }
  ctx.response.body = await renderFile(`${Deno.cwd()}/views/home.ejs`, {})
})
router.get('/register', async ( ctx: RouterContext) => {
  if(ctx.state.currentUser) {
    ctx.response.redirect('/protected')
  }
  ctx.response.body = await renderFile(`${Deno.cwd()}/views/register.ejs`, {
    error: false
  })
})
router.get('/login', async ( ctx: RouterContext) => {
  if(ctx.state.currentUser) {
    ctx.response.redirect('/protected')
  }
  ctx.response.body = await renderFile(`${Deno.cwd()}/views/login.ejs`, {
    error: false
  })
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
    const key: string = Deno.env.get('JWT_KEY') || 'secret' // from .env file
    const payload: Payload = {
      iss: userExists.email,
      exp: setExpiration(new Date().getTime() + 1000 * 60 * 60 * 24)
    }
    const header: Jose = {
      alg: "HS256",
      typ: "JWT",
    };
    const jwtToken = makeJwt({header, payload, key})
    console.log(`JWT Token: ${jwtToken}`)
    ctx.cookies.set('jwtToken', jwtToken)
    ctx.response.redirect('/protected')
  }
  console.log(user)
})



router.get('/protected',authMiddleware, async(ctx:RouterContext) => {
  console.log(ctx.state.currentUser)
  ctx.response.body = await renderFile(`${Deno.cwd()}/views/protected.ejs`, {
    currentUser: ctx.state.currentUser
  })
})

router.get('/logout', async (ctx:RouterContext) => {
  ctx.cookies.delete('jwtToken')
  ctx.state.currentUser = null
  ctx.response.redirect('/login')
})
export {
  router
}