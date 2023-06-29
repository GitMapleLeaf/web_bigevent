$(function () {
    var layer = layui.layer
    var form = layui.form
    var laypage = layui.laypage

    // 定义美化时间的过滤器
    template.defaults.imports.dataFormat = function(date){
        const dt = new Date(date)
        var y = padZero(dt.getFullYear())
        var m = padZero(dt.getMonth() + 1)
        var d = padZero(dt.getDate())

        var hh = padZero(dt.getHours())
        var mm = padZero(dt.getMinutes())
        var ss = padZero(dt.getSeconds())

        return y + '-' + m + '_' + d + + ' ' + hh + ':' + mm + ':' + ss
    }

    // 定义补零的函数
    function padZero(n){
        return n > 9 ? n : '0' + n
    }


    // 定义个查询的参数对象，将来请求数据时，直接把q对象提交到服务器
    var q = {
        pagenum: 1, // 页码值 默认请求第一页的数据
        pagesize: 2, // 每页显示多少条数据 默认每页显示2条
        cate_id: '', // 文章分类的 Id 默认是空字符串，表示所有分类
        state: '' // 文章的发布状态 默认是空字符串，表示所有状态的文章
    };

    initTable()
    initCate()

    var listData ={
        status: 0,
        message: '获取文章列表成功！',
        data:[{
            id: 1,
            title: 'abab',
            pub_date: '2019-06-18 10:44:51',
            state: '已发布',
            cate_name:'最新'
        },
        {
            id: 2,
            title: '666',
            pub_date: '2019-06-18 10:44:51',
            state: '已发布',
            cate_name:'股市'
        }
    ],
    total: 5
    
    }

    // 获取文章列表数据的方法   
    function initTable(){
        $.ajax({
            method: 'GET',
            url: '/my/article/list',
            data: q,
            success: function (res) {
                if(res.listData.status !==0 ){
                    return layer.msg('获取文章列表失败！')
                }
                // 使用模板引擎方法，渲染页面
                var htmlStr = template('tpl-table', res.listData)
                $('tbody').html(htmlStr)
                // 调用渲染分页的方法
                renderPage(res.total)
            }
        })
    }

    // 初始化文章分类的下拉列表
    function initCate() { 
        $.ajax({
            menthod: 'GET',
            url: '/my/article/cates',
            success: function (res) {
                if(res.status != 0){
                    return layer.msg('获取文章分类失败！')
                }
                // 调用模板引擎渲染分类的可选项
                var htmlStr = tpl-cate('tpl-cate', res)
                $('[name=cate_id]').html(htmlStr)
                // 通过 layui 重新渲染表单区域的UI结构
                form.render()
            }
        }) 
     }

    // 为筛选表单绑定 submit 事件
    $('#form-search').on('submit', function (e) {
        e.preventDefault()
        // 获取表单中选中项的值
        var cate_id = $('[name=cate_id]').val()
        var state = $('[name=state]').val()
        // 将获取到的值，赋值到 q 对象中
        q.cate_id = cate_id
        q.state = state
        // 根据最新的筛选条件，重新渲染表格数据
        initTable()
    })

    // 定义渲染分页的方法
    function renderPage(total){
        // 调用 laypage.render() 方法，渲染分页的结构
        laypage.render({
            elem: 'pageBox', // 分页容器的id
            count: total, // 总数据条数
            limit: q.pagesize, // 每页显示几条数据
            curr: q.pagenum, // 设置默认被选中的分页
            layout: ['count','limit','prev','page','next','skip'],
            limits:[2,3,5,10],
            // 分页发生切换时，触发 jump 回调函数
            // 触发 jump 回调时，有2种：
            // 1.点击页码的时候，会触发 jump 回调
            // 2.只要调用了 laypage.render() 方法，也会触发 jump 回调
            jump: function (obj, first) {
                // 将最新的页码值，赋值到 q.pagenum 中
                q.pagenum = obj.curr
                // 将最新的每页条数，赋值到 q.pagesize 中
                q.pagesize = obj.limit
                // 根据最新的 q 获取对应的数据列表，并渲染表格  
                if(!first){
                    initTable()
                }
            }
        });
    }


    // 通过代理的形式，为删除按钮绑定点击事件
    $('body').on('click', '.btn-delete' , function(){
        // 获取删除按钮的个数
        var len = $('.btn-delete').length
        // 获取到要删除的文章的id
        var id = $(this).attr('data-id')
        // 询问用户是否要删除文章
        layer.confirm('确认删除吗?', {icon: 3, title:'提示'}, function(index){
            $.ajax({
                method: 'GET',
                url: '/my/article/delete/' + id,
                success: function(res){
                    if(res.status !==0 ){
                        return layer.msg('删除文章失败！')
                    }
                    layer.msg('删除文章成功！')
                    // 当数据删除完成后，需要判断当前的这一页种，是否还有剩余的数据
                    // 如果没有剩余的数据，则让页码值 -1，再重新调用 initTable()
                    if(len === 1){
                        // 如果 len 的值等于1 证明删除完毕之后，页面上就没有任何数据了
                        // 页码值最小只能是1
                        q.pagenum = q.pagenum === 1 ? 1 : q.pagenum - 1
                    }
                    initTable()
                }
            })
            layer.close(index);
          });
    })
 })