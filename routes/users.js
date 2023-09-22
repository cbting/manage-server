/**
 * 用户管理模块
 */
const router = require('koa-router')()
const User = require('./../models/userSchema')
const utils = require('./../utils/util')
const jwt = require('jsonwebtoken')
router.prefix('/users')

router.post('/login',async (ctx)=>{
  try {
    const {userName, userPwd} = ctx.request.body;
    /**
     * 返回数据库指定字段，有三种方式
     * 1. 'userId userName userEmail state role deptId roleList' 字符串+空格
     * 2. {userId:1, userName:1} JSON:1返回 0不返回
     * 3. select('userId') select 方式
     */


    //res包括了用户名和密码
    const res = await User.findOne({
      userName, 
      userPwd
    }, 'userId userName userEmail state role deptId roleList') //只返回userId这个字段'userId'  多个用空格隔开'userId '
    
    
    if(res){
      const data = res._doc
      console.log('data=>',data)
      const token = jwt.sign({
        data
      },'imooc',{expiresIn:'1h'}) //'imooc'是秘钥，30默认单位是秒 字符串默认单位是毫秒 字符串有单位'1h'是小时
      
      

      data.token = token
      ctx.body = utils.success(data) 
    }
    else{
      ctx.body = utils.fail("账号或密码不正确")
    }
  } catch (error) {
    ctx.body = utils.fail(error.msg)
  }

  
})

module.exports = router
