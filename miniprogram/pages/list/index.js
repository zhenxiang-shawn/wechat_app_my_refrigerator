// refrog home page

Page({

  // 存储请求结果
  data: {
    // all food
    all_food: [],
    // todos: [], // 用户的所有待办事项
    // pending: [], // 未完成待办事项
    // finished: [] // 已完成待办事项
    
    // category
    cold: [],
    frozen: [],
    in_room: [],
    // date classify 
    expired_food: [],
    almost_die_food: [], // food will be expired in 3 days
    fresh_food: [],
    one_day_in_ms: 24 * 60 * 60 * 1000,
    _QUERY_TYPE : getApp().globalData._QUERY_TYPE
    // _QUERY_TYPE :  {
    //   // Date
    //   expired_food: 1,
    //   almost_expired_food: 2,
    //   fresh_food: 3,
    //   // Category
    //   vegetables: 4,
    //   meats: 5,
    //   fruits: 6,
    //   snacks: 7,
    //   dairy: 8,
    //   others: 9
    // }
  },

  onShow() {
    // 通过云函数调用获取用户 _openId
    getApp().getOpenId().then(async openid => {
      // 根据 _openId 数据，查询并展示待办列表
      const db = await getApp().database()
      db.collection(getApp().globalData.collection).where({
        _openid: openid
      }).get().then(res => {
        const {
          data
        } = res
        // 存储查询到的数据
        this.setData({
          // data 为查询到的所有待办事项列表
          // todos: data,
          all_food: data,
          // 通过 filter 函数，将待办事项分为未完成和已完成两部分
          cold:     data.filter(all_food => all_food.storage_condition === 0),
          frozen:   data.filter(all_food => all_food.storage_condition === 1),
          in_room:  data.filter(all_food => all_food.storage_condition === 2),
          expired_food:     data.filter(all_food => Date.parse(all_food.expiration_date) < new Date()),
          almost_die_food:  data.filter(all_food => (Date.parse(all_food.expiration_date) - new Date()) / this.data.one_day_in_ms <= 3 && Date.parse(all_food.expiration_date) > new Date()),
          fresh_food:       data.filter(all_food => (Date.parse(all_food.expiration_date) - new Date()) / this.data.one_day_in_ms > 3)
          // pending: data.filter(todo => todo.freq === 0),
          // finished: data.filter(todo => todo.freq === 1)
        })
        console.log("exp foods: ", this.data.expired_food)
        console.log("fresh foods: ", this.data.fresh_food)
      })
    })
    // 配置首页左划显示的星标和删除按钮
    this.setData({
      slideButtons: [{
        extClass: 'starBtn',
        text: '星标',
        src: '../../images/list/star.png'
      }, {
        type: 'warn',
        text: '删除',
        src: '../../images/list/trash.png'
      }],
    })
  },

  // 响应左划按钮事件
  async slideButtonTap(e) {
    // 得到触发事件的待办序号
    const {
      index
    } = e.detail
    // 根据序号获得待办对象
    const todoIndex = e.currentTarget.dataset.index
    const todo = this.data.pending[todoIndex]
    const db = await getApp().database()
    // 处理星标按钮点击事件
    if (index === 0) {
      // 根据待办的 _id 找到并反转星标标识
      db.collection(getApp().globalData.collection).where({
        _id: todo._id
      }).update({
        data: {
          star: !todo.star
        }
      })
      // 更新本地数据，触发显示更新
      todo.star = !todo.star
      this.setData({
        pending: this.data.pending
      })
    }
    // 处理删除按钮点击事件
    if (index === 1) {
      // 根据待办的 _id 找到并删除待办记录
      db.collection(getApp().globalData.collection).where({
        _id: todo._id
      }).remove()
      // 更新本地数据，快速更新显示
      this.data.pending.splice(todoIndex, 1)
      this.setData({
        pending: this.data.pending
      })
      // 如果删除完所有事项，刷新数据，让页面显示无事项图片
      if (this.data.pending.length === 0 && this.data.finished.length === 0) {
        this.setData({
          todos: [],
          pending: [],
          finished: []
        })
      }
    }
  },

  // 点击左侧单选框时，切换待办状态
  async finishTodo(e) {
    // 根据序号获得触发切换事件的待办
    const todoIndex = e.currentTarget.dataset.index
    const todo = this.data.pending[todoIndex]
    const db = await getApp().database()
    // 根据待办 _id，获得并更新待办事项状态
    db.collection(getApp().globalData.collection).where({
      _id: todo._id
    }).update({
      // freq == 1 表示待办已完成，不再提醒
      // freq == 0 表示待办未完成，每天提醒
      data: {
        freq: 1
      }
    })
    // 快速刷新数据
    todo.freq = 1
    this.setData({
      pending: this.data.todos.filter(todo => todo.freq === 0),
      finished: this.data.todos.filter(todo => todo.freq === 1)
    })
  },

  // 同上一函数，将待办状态设置为未完
  async resetTodo(e) {
    const todoIndex = e.currentTarget.dataset.index
    // const todo = this.data.pending[todoIndex]
    const todo = this.data.fresh_food[todoIndex]
    const db = await getApp().database()
    db.collection(getApp().globalData.collection).where({
      _id: todo._id
    }).update({
      data: {
        freq: 0
      }
    })
    todo.freq = 0
    this.setData({
      expired_food:     data.filter(all_food => Date.parse(all_food.expiration_date) < new Date()),
      fresh_food:       data.filter(all_food => Date.parse(all_food.expiration_date) >= new Date()),
      // pending: this.data.todos.filter(todo => todo.freq === 0),
      // finished: this.data.todos.filter(todo => todo.freq === 1)
    })
  },

  // 跳转响应函数
  toFileList(e) {
    const todoIndex = e.currentTarget.dataset.index
    const todo = this.data.pending[todoIndex]
    wx.navigateTo({
      url: '../file/index?id=' + todo._id,
    })
  },

  toDetailPage(e) {
    const todoIndex = e.currentTarget.dataset.index
    const todo = this.data.pending[todoIndex]
    wx.navigateTo({
      url: '../detail/index?id=' + todo._id,
    })
  },

  toAddPage() {
    wx.navigateTo({
      url: '../../pages/add/index',
    })
  },

  toItemListPageByDate(e) {
    // Query type: QUERY_TYPE
    console.log("test:", e.currentTarget.dataset)
    console.log("test:", e.currentTarget.dataset.query)
    wx.navigateTo({
      url: '../../pages/items_list_by_date/index?query=' + e.currentTarget.dataset.query,
    })
  }
})