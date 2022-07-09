Page({
    
    data: {
        _QUERY_TYPE : getApp().globalData._QUERY_TYPE
    },

    onLoad(options) {
        // 保存上一页传来的 data list 字段，用于后续查询待办记录
        console.log("come")
        console.log(options.query)
        // console.log(options.id) // id is invalid
    }

})