Page({
    
    data: {
        _QUERY_TYPE : getApp().globalData._QUERY_TYPE,
        items: [],
        item_tag_str: ""
    },

    onLoad(options) {
        // 保存上一页传来的 data list 字段，用于后续查询待办记录
        console.log("come")
        console.log(options)
        console.log('Global items:', getApp().globalData.items)
        this.setData({
            items: getApp().globalData.items,
            item_tag_str: getApp().globalData._QUERY_STR_CN_ZH[options.query]
        })
        console.log("done")
        console.log(this.data.items)

        // auto generate list according to "items"
        // let wxml = ""
        // add label
        // wxml += "        <view class=\"form-group_label\">\n{{item_tag_str}}</view>\n"
        
        // item_list_group = document.getElementById("items-by-date")
        // items.forEach(item => {
        //     // add items
        //     wxml += "<view class=\"form-group_cell\">\n{{item}}</view>\n"
        // });
        // item_list_group.innerHTML(wxml)

    }

})