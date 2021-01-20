<template>
  <div class="article-container">
    <el-card class="filter-card">
      <div slot="header" class="clearfix">
        <!-- 面包屑路径导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
          <el-breadcrumb-item>内容管理</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- /面包屑路径导航 -->
      </div>
      <div class="text item">
        <!-- 数据筛选表单 -->
        <el-form ref="form" :model="form" label-width="50px" size="mini">
          <el-form-item label="状态">
            <el-radio-group v-model="articleStatus">
              <el-radio :label="null">全部</el-radio>
              <el-radio :label="0">草稿</el-radio>
              <el-radio :label="1">待审核</el-radio>
              <el-radio :label="2">审核通过</el-radio>
              <el-radio :label="3">审核失败</el-radio>
              <el-radio :label="4">已删除</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="频道">
            <el-select v-model="articleChannelIdSelected" placeholder="请选择频道">
              <el-option label="全部" :value="null"/>
              <el-option v-for="(channel, index) in articleChannels" :label="channel.name" :value="channel.id" :key="index"/>
            </el-select>
          </el-form-item>
          <el-form-item label="日期">
            <el-date-picker
              v-model="pubDates"
              type="datetimerange"
              value-format="yyyy-MM-dd"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :default-time="['12:00:00']">
            </el-date-picker>
          </el-form-item>
          <el-form-item>
            <!-- button 按钮的 click 事件有个默认参数，当你没有指定参数的时候，它会默认传递一个没用的数据 -->
            <el-button type="primary" :disabled="loading" @click="loadArticles(1)">查询</el-button>
          </el-form-item>
        </el-form>
        <!-- /数据筛选表单 -->
      </div>
    </el-card>

    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>根据筛选条件共查询到 {{ totalArticlesCount }} 条结果：</span>
      </div>
      <div class="text item">
        <!-- 数据列表 -->
        <!--
          Table 表格组件
          1、把需要展示的数组列表数据绑定给 table 组件的 data 属性
            注意：你不用去 v-for 遍历，它自己会遍历
          2、设计表格列 el-table-column
            width 可以设定表格列的宽度
            label 可以设定列的标题
            prop  用来设定要渲染的列表项数据字段，只能展示文本
          3、表格列默认只能渲染普通文本，如果需要展示其它内容，例如放个按钮啊、放个图片啊，那就需要自定义表格列模板了：https://element.eleme.cn/#/zh-CN/component/table#zi-ding-yi-lie-mo-ban
         -->
        <el-table
          :data="articles"
          stripe
          style="width: 100%"
          class="list-table"
          size="mini"
          v-loading="loading"
        >
          <el-table-column
            label="封面">
            <template slot-scope="scope">
              <!--
              <img v-if="scope.row.cover.images[0]" class="article-cover" :src="scope.row.cover.images[0]" alt="">
              <img v-else class="article-cover" src="./no-cover.gif" alt="">
              -->
              <!-- 下面这种情况是在运行期间动态改变处理的。而本地图片必须在打包的时候就存在。 -->
              <!-- <img class="article-cover" :src="scope.row.cover.images[0] || './no-cover.gif'" alt=""> -->
              <el-image
                style="width: 100px; height: 100px"
                :src="scope.row.cover.images[0]"
                fit="fit"
                lazy>
                <div slot="placeholder" class="image-slot">
                  加载中<span class="dot">...</span>
                </div>
              </el-image>
            </template>
          </el-table-column>
          <el-table-column
            prop="title"
            label="标题">
          </el-table-column>
          <el-table-column
            label="状态">
            <!-- 如果需要在自定义列模板中获取当前遍历项数据，那么就在 template 上声明 slot-scope="scope" -->
            <template slot-scope="scope">
              <el-tag v-if="scope.row.status === 0" type="warning">草稿</el-tag>
              <el-tag v-else-if="scope.row.status === 1">待审核</el-tag>
              <el-tag v-else-if="scope.row.status === 2" type="success">审核通过</el-tag>
              <el-tag v-else-if="scope.row.status === 3" type="danger">审核失败</el-tag>
              <el-tag v-else-if="scope.row.status === 4" type="info">已删除</el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="pubdate"
            label="发布时间">
          </el-table-column>
          <el-table-column
            label="操作">
            <!-- 如果需要自定义表格列模板，则把需要自定义的内容放到 template 里面 -->
            <template slot-scope="scope">
              <el-button
                size="mini"
                circle
                icon="el-icon-edit"
                type="primary"
              ></el-button>
              <el-button
                size="mini"
                type="danger"
                icon="el-icon-delete"
                circle
                @click="onDeleteArticle(scope.row.id)"
              ></el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- /数据列表 -->
        <!-- 列表分页 -->
        <el-pagination
          class="pagination"
          layout="prev, pager, next"
          background
          :total="totalArticlesCount"
          :page-size="pageSize"
          :disabled="loading"
          :current-page.sync="currentPage"
          @current-change="loadArticles">
        </el-pagination>
        <!-- /列表分页 -->
      </div>
    </el-card>
  </div>
</template>

<script>
import {
  getArticles,
  getArticleChannels,
  deleteArticle
} from '@/api/article'

export default {
  name: 'ArticleIndex',
  components: {},
  props: {},
  data () {
    return {
      articles: [],
      totalArticlesCount: 0,
      pageSize: 10,
      articleStatus: null,
      articleChannels: [],
      articleChannelIdSelected: null,
      pubDates: [],
      loading: true,
      currentPage: 1
    }
  },
  computed: {
    beginPubDate () {
      return this.pubDates ? this.pubDates[0] : null
    },
    endPubDate () {
      return this.pubDates ? this.pubDates[1] : null
    }
  },
  watch: {},
  created () {
    this.loadArticles(1)
    this.getArticleChannels()
  },
  mounted () {},
  methods: {
    loadArticles (page = 1) {
      this.loading = true
      getArticles({
        page,
        per_page: this.pageSize,
        status: this.articleStatus,
        channel_id: this.articleChannelIdSelected,
        begin_pubdate: this.beginPubDate,
        end_pubdate: this.endPubDate
      }).then(res => {
        // const { articles, total_count } = res.data.data // 1.解构语法；2.ESLint: Identifier 'total_count' is not in camel case.(camelcase)
        const { results, total_count: totalArticlesCount } = res.data.data // 1.解构语法；2.ESLint: Identifier 'total_count' is not in camel case.(camelcase)
        this.articles = results
        this.totalArticlesCount = totalArticlesCount
        this.loading = false
      })
    },
    getArticleChannels () {
      getArticleChannels().then(res => {
        this.articleChannels = res.data.data.channels
      })
    },
    // onPageChange (page) {
    //   this.loadArticles(page)
    // },
    onDeleteArticle (articleID) {
      this.$confirm('确认删除吗？', '删除提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 删除文章
        deleteArticle(articleID.toString())
        this.$message({
          message: '删除成功',
          type: 'success'
        })
        this.loadArticles(this.currentPage)
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    }
  }
}
</script>

<style scoped lang="less">
.filter-card {
  margin-bottom: 30px;
}

.list-table {
  margin-bottom: 20px;
}

.article-cover {
  width: 60px;
  background-size: cover;
}

.image-slot {
  text-align: center;
}

.pagination {
  text-align: center;
}
</style>
