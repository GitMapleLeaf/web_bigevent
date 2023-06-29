$(function(){
    var layer = layui.layer
    var form = layui.form

    initArtCateList();

    // 1. 获取分类列表
    function initArtCateList(){
        $.ajax({
            method: 'GET',
            url:'/my/article/cates',
            success: function(res){
                var htmlStr = template('tpl-table' ,res)
                $('tbody').html(htmlStr)
            },
        })
    }

    // 2. 添加分类按钮绑定点击事件
    var indexAdd = null;
    $('#btnAddCate').on('click' ,function(){
        indexAdd = layer.open({
            type:1,
            area: ['500px', '250px'],
            title: '添加文章分类',
            content: $('#dialog-add').html()
        })
    })

    // 通过代理的形式，为 from-add 表单绑定 submit 事件
    $('body').on('submit', '#form-add' ,function(e){
        e.preventDefault();
        $.ajax({
            method: 'POST',
            url: '/my/article/addcates',
            data:$(this).serialize(),
            success: function(res){
                if(res.status !== 0){
                    return layer.msg('添加分类失败！')
                }
                layer.msg('添加分类成功！')
                initArtCateList()
                layer.msg('添加分类成功！')
                // 根据索引，关闭对应的弹出层
                layer.close(indexAdd)
            }
        })
    })

    // 3. 通过代理的形式，为 btn-edit 按钮绑定点击事件
    var indexEdit = null;
    $('tbody').on('click', '.btn-edit' ,function(){
        // 1. 弹出一个编辑框
        indexEdit = layer.open({
            type:1,
            area: ['500px', '250px'],
            title: '修改文章分类',
            content: $('#dialog-edit').html()
        })

        var id = $(this).attr('data-id')
        // 2. 根据 id 获取分类数据 发起请求
        $.ajax({
            method: 'GET',
            url: '/my/article/cates/' + id,
            success: function(res){
                form.var('form-edit',res.data)
                
            }
        })
    })

    // 4. 通过代理的形式，为 form-edit 表单绑定 submit 事件
    $('body').on('submit', '#form-edit' ,function(e){
        e.preventDefault();
        $.ajax({
            method: 'POST',
            url: '/my/article/updatecate',
            data:$(this).serialize(),
            success: function(res){
                if(res.status !== 0){
                    return layer.msg('更新分类失败！')
                }
                layer.msg('更新分类成功！')
                layer.close(indexEdit)
                initArtCateList();
            }
        })
    })

    // 5. 通过代理的形式，为 删除 btn-delete 按钮绑定点击事件
    $('tbody').on('click', '.btn-delete' ,function(){
        var id = $(this).attr('data-id')
        // 提示用户是否要删除
        layer.confirm('确认删除？', {icon: 3, title:'提示'}, function(index){
            //do something
            $.ajax({
                method: 'GET',
                url: '/my/article/deletecate/' + id,
                success: function(res){
                    if(res.status !== 0){
                        return layer.msg('删除分类失败！')
                    }
                    layer.msg('删除分类成功！')
                    layer.close(index)
                    initArtCateList();
                }
            })
          });
    })
})