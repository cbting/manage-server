const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const log4js = require('./utils/log4j')
const users = require('./routes/users')
const router = require('koa-router')()
const jwt = require('jsonwebtoken')
const koajwt = require('koa-jwt')
const util = require('./utils/util')
// error handler
onerror(app)

require('./config/db')

// middlewares 中间件 两个参数（ctx, next）通过中间件来进行串写，通过next来执行下一个
// 中间件的优先级 大于 接口；通过这种过滤，把非法的数据过滤在外面
app.use(bodyparser({
  enableTypes:['json', 'form', 't ext']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

//一个错误示例
// app.use(()=>{
//   ctx.bog = 'hello'
// })

// logger
app.use(async (ctx, next) => {
  log4js.info(`get params:${JSON.stringify(ctx.request.query)}`)
  log4js.info(`post params:${JSON.stringify(ctx.request.body)}`)
  await next().catch((err)=>{
    if(err.status == '401'){
      ctx.status = 200
      ctx.body = util.fail('Token认证失败',util.CODE.AUTH_ERROR)
    }
    else{
      throw err;
    }
  })
})

//提前加载中间件koa-jwt
//会去校验jwt的token
app.use(koajwt({secret:'imooc'}).unless({
  path:[/^\/api\/users\/login/]
})) //unless 首次登录的时候不校验


// 默认根路由
// router.get('/', async (ctx, next) => {
//   ctx.body = "Hello, this is the root!";
// });

router.prefix('/api')

router.get('/leave/count',(ctx)=>{
  const token = ctx.request.headers.authorization.split(' ')[1]
  const payload = jwt.verify(token,'imooc')
  ctx.body = payload
})
router.use(users.routes(), users.allowedMethods())

app.use(router.routes(), router.allowedMethods())
// 这里用两次 app.use 是因为你可能想要对不同的路由前缀（或没有前缀）应用不同的路由规则。
// app.use(router.routes(), router.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  // console.error('server error', err, ctx)
  log4js.error(`${err.stack}`)
});

module.exports = app
