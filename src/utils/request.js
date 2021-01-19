/**
 * 基于 axios 封装的请求模块
 */
import axios from 'axios'

// axios()
// axios.get()
// axios.post()

// 创建一个 axios 实例，说白了就是复制了一个 axios
// 我们通过这个实例去发请求，把需要的配置配置给这个实例来处理
const request = axios.create({
  baseURL: 'http://api-toutiao-web.itheima.net/' // 请求的基础路径
})

// 请求拦截器
// Add a request interceptor
request.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    // 所有请求都会经过这里
    // config是当前请求相关的配置信息对象
    console.log(config)

    // 可以在return config之前定制统一的业务处理逻辑
    const user = JSON.parse(window.localStorage.getItem('user'))
    if (user) {
      config.headers.Authorization = `Bearer ${user.token}`
    }

    return config // 只有return config之后，请求才会真正发出去
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error)
  })

// 响应拦截器

// 导出请求方法
export default request

// 谁要使用谁就加载 request 模块
// import request from 'request.js'
// request.xxx
// request({
//   method: ,
//   url: ''
// })
