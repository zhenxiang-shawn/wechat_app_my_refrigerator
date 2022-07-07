/* 新增待办页面 */
import util from '../../utils/util'

Page({
  // 保存编辑中待办的信息
  data: {
    title: '',
    desc: '',
    // set production date
    todayDate: new Date(),
    qualityGuaranteeDate : [0,0],
    productionDate : util.formatDate(new Date()),
    expirationDate : util.formatDate(new Date(new Date().getTime()+24*60*60*1000)),
    files: [],
    fileName: '',
    // set storage days
    storageOptions: ['冷藏(1°C-10°C)', '冷冻(-18°C)', '室温'],
    storageSelectIndex: 0,
    
    // multi selection data
    storageNumArray:    [
      [[1, 3, 5, 7, 14, 30], [1, 2, 4, 8], [1, 2, 3, 6, 8, 12, 24], [1, 2, 3, 4, 5, 6, 7, 8]],
      ['天', '周', '月', '年']
    ],

    // const
    // ==========================
    storageDateIndex:   0,
    storageNameIndex:   1,
    // ==========================

    // selected index
    selectDateIndex: 0,
    storageTypeIndex: 0,

    // # of objects 
    count: 1
  },

  // 表单输入处理函数
  onTitleInput(e) {
    this.setData({
      title: e.detail.value
    })
  },

  onDescInput(e) {
    this.setData({
      desc: e.detail.value
    })
  },

  // 上传新附件
  async addFile() {
    // 限制附件个数
    if (this.data.files.length + 1 > getApp().globalData.fileLimit) {
      wx.showToast({
        title: '数量达到上限',
        icon: 'error',
        duration: 2000
      })
      return
    }
    // 从会话选择文件
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera']
    }).then(res => {
      const file = res.tempFiles[0]
      // 上传文件至云存储
      getApp().uploadFile(file.name, file.path).then(res => {
        // 追加文件记录，保存其文件名、大小和文件 id 
        this.data.files.push({
          name: file.name,
          size: (file.size / 1024 / 1024).toFixed(2),
          id: res.fileID
        })
        // 更新文件显示
        this.setData({
          files: this.data.files,
          fileName: this.data.fileName + file.name + ' '
        })
      })
    })
  },

  // 响应事件状态选择器
  onChooseFreq(e) {
    this.setData({
      storageSelectIndex: e.detail.value
    })
  },

  // 保存待办
  async saveTodo() {
    // 对输入框内容进行校验
    if (this.data.title === '') {
      wx.showToast({
        title: '物品名称未填写',
        icon: 'error',
        duration: 2000
      })
      return
    }
    if (this.data.title.length > 10) {
      wx.showToast({
        title: '物品名称过长',
        icon: 'error',
        duration: 2000
      })
      return
    }
    if (this.data.desc.length > 100) {
      wx.showToast({
        title: '物品描述过长',
        icon: 'error',
        duration: 2000
      })
      return
    }
    const db = await getApp().database();
    console.log("PUD DATE: ", this.data.productionDate);
    console.log("EXP DATE: ", this.data.expirationDate);
    // 在数据库中新建物品，并填入已编辑对信息
    db.collection(getApp().globalData.collection).add({
      data: {
        object_name: this.data.title,         // 物品名称
        object_desc: this.data.desc,          // 物品描述
        object_files: this.data.files,        // 附件列表
        object_number: Number(this.data.count),     // 物品数量
        production_date: new Date(this.data.productionDate),          // 生产日期
        expiration_date: new Date(this.data.expirationDate),          // 物品过期日期
        quality_guarantee_date: this.data.qualityGuaranteeDate,       // 保质期 array [1,1]
        storage_condition: this.data.storageSelectIndex,            // 保存条件
        star: false   // 星标
      }
    }).then(() => {
      wx.navigateBack({
        delta: 0,
      })
    })
  },

  // 重置所有表单项
  resetTodo() {
    this.setData({
      title: '',
      desc: '',
      files: [],
      fileName: '',
      count: 1,      // # of objects 
      storageSelectIndex: 0,  // storage condition
      selectDateIndex: 0,   // selected index
      storageTypeIndex: 0,
      productionDate: util.formatDate(new Date()),
      expirationDate: util.formatDate(new Date(new Date().getTime()+24*60*60*1000))   // exp date
    })
  },

	/* 点击减号 */
	bindMinus: function() {
		var num = this.data.count;
		// 如果大于1时，才可以减
		if (num > 1) {
			num --;
		}
		// 只有大于一件的时候，才能normal状态，否则disable状态
		var minusStatus = num <= 1 ? 'disabled' : 'normal';
		// 将数值与状态写回
		this.setData({
			count: num,
			minusStatus: minusStatus
		});
  },
  
	/* 点击加号 */
	bindPlus: function() {
		var num = this.data.count;
		// 不作过多考虑自增1
		num ++;
		// 只有大于一件的时候，才能normal状态，否则disable状态
		var minusStatus = num < 1 ? 'disabled' : 'normal';
		// 将数值与状态写回
		this.setData({
			count: num,
			minusStatus: minusStatus
		});
  },

	/* 输入框事件 */
	bindManual: function(e) {
		var new_num = e.detail.value;
		// 将数值与状态写回
		this.setData({
			count: new_num
		});
  },

  /* 更新生产日期事件 */ 
  onDateChange: function(e) {
    this.setData({
      productionDate: e.detail.value
    })
  },

  /* 更新保质期事件 */
  qgDateChange: function(e) {
    let i = e.detail.value;
    // console.log('i is',i);
    // console.log('i[0] is',i[0]);
    
    let storageNumArray = this.data.storageNumArray;
    let storageTypeIndex = this.data.storageTypeIndex; 

    let a = storageNumArray[0];
    // console.log("a:", a);
    let b = a[storageTypeIndex];
    // console.log("b:",b);
    let c = b[i[0]];
    // console.log("selected period: ", c);

    let exp_date = new Date(this.data.productionDate)
    let exp_date_str = ""
    
    switch(i[1]) {
      case 0: // day
        let days = exp_date.getDate() + c;
        console.log("days:", days);
        exp_date.setDate(days);
        exp_date_str = util.formatDate(exp_date);
        break;

      case 1: // week
        let weeks = exp_date.getDate() + (c*7);
        exp_date.setDate(weeks);
        exp_date_str = util.formatDate(exp_date);
        break;

      case 2: // month
        let monthes = exp_date.getMonth() + c;
        exp_date.setMonth(monthes);
        exp_date_str = util.formatDate(exp_date);
        break;

      case 3: // year
        let years = exp_date.getFullYear() + c;
        exp_date.setFullYear(years);
        exp_date_str = util.formatDate(exp_date);
        break;
    }

    console.log("exp date: ", exp_date_str)
    this.setData({
      selectDateIndex : i[0],
      storageTypeIndex : i[1],
      expirationDate : exp_date_str
    });
    console.log("setting exp data to ", this.data.expirationDate);
    console.log("Date is ", Date(this.data.expirationDate));
    
  },

  /* 滑动联动 */
  bindMultiPickerColumnChange: function(e) {
    // console.log("_________");
    let col = e.detail.column;
    // console.log('col is ', col);
    let index = e.detail.value;
    // console.log('index is ', index);
    if ( col == 1 ){  // data type (天, 周, 月, 年...)
      this.setData({
        storageTypeIndex : index,
        // selectDateIndex : 0
      })
    }
  }

})