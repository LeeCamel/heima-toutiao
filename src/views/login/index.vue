<template>
  <div class="login-container">
    <!--
      el-form 表单组件
      每个表单项都必须使用 el-form-item 组件包裹
     -->
    <div class="login-form-wrap">
      <div class="login-head">
        <div class="logo"></div>
      </div>
      <!--
      配置Form表单验证：
      1. 必须给 el-form 组件绑定 model 为表单数据对象
      2. Form 组件提供了表单验证的功能，只需要通过 rules 属性传入约定的验证规则，并将 Form-Item 的 prop 属性设置为需校验的字段名即可。
      3. 通过 el-form 组件的 rules 属性配置验证规则，如果内置的验证规则不满足，也可以自定义验证规则
      手动触发表单验证：
      1. 给 el-form 设置 ref 起个名字（不重复即可）
      2. 通过 ref 获取 el-form 组件，调用组件的 validate 方法进行验证
      -->
      <el-form class="login-form" ref="login-form" :model="user" :rules="formRules">
        <el-form-item prop="mobile">
          <el-input v-model="user.mobile" placeholder="请输入手机号"></el-input>
        </el-form-item>
        <el-form-item prop="code">
          <el-input v-model="user.code" placeholder="请输入验证码"></el-input>
        </el-form-item>
        <el-form-item prop="agree">
          <el-checkbox v-model="user.agree">我已阅读并同意用户协议和隐私条款</el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-button class="login-btn" type="primary" @click="onLogin" :loading="loginLoading">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
// import request from '@/utils/request'
import { login } from '@/api/user'

export default {
  name: 'LoginIndex',
  components: {},
  props: {},
  data () {
    return {
      user: {
        mobile: '13911111111', // 手机号
        code: '246810', // 验证码
        agree: true // 同意协议
      },
      // checked: false, // 是否同意协议的选中状态
      loginLoading: false,
      formRules: {
        // 表单验证规则配置
        // 要验证的数据名称：规则列表[]
        mobile: [
          {
            required: true,
            message: '请输入手机号',
            trigger: 'change'
          },
          {
            pattern: /^1[35789]\d{9}$/,
            message: '请输入正确的号码格式',
            trigger: 'change'
          }
        ],
        code: [
          {
            required: true,
            message: '验证码不能为空',
            trigger: 'change'
          },
          {
            pattern: /^\d{6}$/,
            message: '请输入正确的验证码格式'
          }
        ],
        agree: [
          {
            // 自定义校验规则：https://element.eleme.cn/#/zh-CN/component/form#zi-ding-yi-xiao-yan-gui-ze
            // 验证通过：callback()
            // 验证失败：callback(new Error('错误消息'))
            validator: (rule, value, callback) => {
              if (value) {
                callback()
              } else {
                callback(new Error('请同意用户协议'))
              }
            },
            // message: '请勾选同意用户协议',
            trigger: 'change'
          }
        ]
      }
    }
  },
  computed: {},
  watch: {},
  created () {
  },
  mounted () {
  },
  methods: {
    onLogin () {
      // 获取表单数据（根据接口要求绑定数据）
      // const user = this.user

      // 表单验证，validate方法是异步的
      this.$refs['login-form'].validate((valid) => {
        if (!valid) {
          return false // 如果表单验证失败，停止请求提交
        } else {
          this.login() // 验证通过，请求登录
        }
      })
    },

    login () {
      // 开启登录中loading
      this.loginLoading = true

      // 验证通过，提交登录
      login(this.user).then(res => {
        // 登录成功
        // console.log(res)
        this.$message({
          message: '登录成功',
          type: 'success'
        })
        // 关闭loading
        this.loginLoading = false
        // 将接口返回的用户数据保存到本地
        window.localStorage.setItem('user', JSON.stringify(res.data.data))
        // 跳转到首页
        // this.$router.push('/')
        this.$router.push({
          name: 'home'
        })
      }).catch(err => {
        // 登录失败
        console.log('登录失败', err)
        this.$message.error('登录失败，手机号或验证码错误')
        // 关闭loading
        this.loginLoading = false
      })
    }
  }
}
</script>

<style scoped lang="less">
.login-container {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: url('./login_bg.jpg') no-repeat;
  background-size: cover;
  .login-form-wrap {
    min-width: 300px;
    padding: 30px 50px 10px;
    background-color: #fff;
    .login-head {
      display: flex;
      justify-content: center;
      .logo {
        width: 200px;
        height: 57px;
        background: url('./logo_index.png') no-repeat;
        background-size: contain;
      }
    }
    .login-form {
      .login-btn {
        width: 100%;
      }
    }
  }
}
</style>
