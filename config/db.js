/**
 * 数据库连接
 */
const mongoose = require('mongoose')
const config = require('./index')
const log4j = require('./../utils/log4j')

mongoose.connect(config.URL,{
  useUnifiedTopology: true,
  useNewUrlParser: true
})

const db = mongoose.connection;
db.on('error',()=>{
  log4j.error('***数据库连接失败***')
})

db.on('open',()=>{
  log4j.info('***数据库连接成功***')
})