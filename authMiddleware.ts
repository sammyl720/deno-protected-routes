import { Context } from "https://deno.land/x/oak/mod.ts";
import { validateJwt } from "https://deno.land/x/djwt/validate.ts";
import {users} from './types.ts'
const authMiddleware = async (ctx: Context, next: any) => {
  const token: string = ctx.cookies.get('jwtToken') || ''
  const key: string = Deno.env.get('JWT_KEY') || ''
  const validatedToken =  await validateJwt(token, key )
  if(!token || token === ''){
    ctx.cookies.delete('jwtToken')
    ctx.state.currentUser = null
    ctx.response.redirect('/login')
  } else if(!validatedToken.isValid){
    ctx.cookies.delete('jwtToken')
    ctx.state.currentUser = null
    ctx.response.redirect('/login')
  } else {

    if(!ctx.state.currentUser){
      ctx.state.currentUser = users.find(u => u.email === validatedToken.payload?.iss)
    } 
    await next()
  }
}

export default authMiddleware
