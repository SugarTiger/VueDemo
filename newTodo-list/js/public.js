function windowSize() {
    //获取屏幕宽度
    var deviceWidth = document.documentElement.clientWidth;
    var deviceHeight = document.documentElement.clientHeight;
    // 设计稿width为640px
    // if (deviceWidth > 640) deviceWidth = 640;
    if (deviceWidth < 320) deviceWidth = 320;
    document.documentElement.style.fontSize = deviceWidth / 6.4 + "px";
    // document.body.style.minHeight = deviceHeight + "px";
    // document.getElementById("app").style.minHeight = deviceHeight + "px";
    document.getElementsByTagName("div")[0].style.minHeight = deviceHeight + "px";
};
windowSize();
window.onresize = function() {
    windowSize();
};
// Vue.js
Vue.component('todo-list', {
    props: ['isDone', 'title', 'time'],
    template: "#my-list-template",
    computed: {
        checkimg: function() {
            if (this.isDone) {
                return "img/checkboxs.png";
            } else {
                return "img/checkbox.png";
            }
        },
        localtime: function() {
            var d = new Date(this.time);
            var localtime = this.datetimelocal(d);
            return localtime;
        }
    },
    methods: {
        // 格式化时间
        datetimelocal: function(date) {
            var Year = date.getFullYear(); //年
            var Month = date.getMonth() + 1; //月
            if (Month < 10) Month = "0" + Month;
            var Date = date.getDate(); //日
            if (Date < 10) Date = "0" + Date;
            var Hours = date.getHours(); //小时
            if (Hours < 10) Hours = "0" + Hours;
            var Minutes = date.getMinutes(); //分钟
            if (Minutes < 10) Minutes = "0" + Minutes;
            var time = Year + "/" + Month + "/" + Date + " " + Hours + ":" + Minutes;
            return time;
        },
        // 点击复选框
        checkbox: function() {
            this.$emit('checkbox')
        },
        // 点击删除按钮
        remove: function() {
            this.$emit('remove');
        },
        // 编辑
        edit: function() {
            this.$emit('edit');
        }
    }
});
var vm = new Vue({
    el: "#app",
    data: {
        todos: [],
        allselected: "全选",
        todotitle: "",
        isSort: true,
        isEdit: false,
        editext: "",
        eindex: ""
    },
    computed: {
        sortimg: function() {
            if (this.isSort) {
                return "img/updownu.png";
            } else {
                return "img/updownd.png";
            }
        },
        //查找任务
        computedtodos: function() {
            var vm = this
            return this.todos.filter(function(item) {
                return item.text.toLowerCase().indexOf(vm.todotitle.toLowerCase()) !== -1
            })
        },
    },
    methods: {
        allANo: function() {
            var len = this.todos.length;
            if (this.allselected == "全选") {
                this.allselected = "全不选";
                for (var i = 0; i < len; i++) {
                    this.todos[i].done = true;
                }
            } else {
                this.allselected = "全选"
                for (var i = 0; i < len; i++) {
                    this.todos[i].done = false;
                }
            }
        },
        sorts: function() {
            if (this.isSort) {
                this.todos.sort(function(a, b) {
                    return a.time - b.time;
                });
            } else {
                this.todos.sort(function(a, b) {
                    return b.time - a.time;
                });
            };
            this.isSort = !this.isSort;

        },
        checkboxs: function(index) {
            this.todos[index].done = !this.todos[index].done;
            // 修改本地存储的数据
            var newValue = JSON.stringify(this.todos[index]);
            this.editLocalStorage(this.todos[index].time, newValue);
        },
        //选择所有文本
        selectAll: function(event) {
            // 解决safari的bug
            event = event ? event : window.event;
            var obj = event.srcElement ? event.srcElement : event.target;
            event.target.select();
        },
        // 增加任务
        addTodo: function() {
            if (!this.todotitle) {
                alert("调皮哦，不能什么都不做哦");
                return;
            }
            var todoItem = {};
            todoItem.done = false;
            todoItem.text = this.todotitle;
            todoItem.time = new Date().getTime();
            // 把新任务添加到数组
            this.todos.unshift(todoItem);
            // 把新任务添加到本地存储对象中
            this.addLocalStorage(todoItem);
            //初始化
            this.todotitle = "";
        },
        // 删除任务
        removeTodo: function(index) {
            // 从本地存储删除数据
            this.removeLocalStorage(this.todos[index].time);
            this.todos.splice(index, 1);
        },
        // 删除已完成
        clearDone: function() {
            for (var i = 0; i < this.todos.length; i++) {
                if (this.todos[i].done == true) {
                    this.removeTodo(i);
                    // 由于vue的响应式机制，没删除一个以为完成的任务，todos里的对象的位置都会改变，所以i-1
                    i = i - 1;
                }
            }
        },
        // 编辑任务
        editTodo: function(index) {
            // 显示编辑框
            this.isEdit = true;
            // 标注哪个任务需要修改，此变量在完成修改时作为索引
            this.eindex = index;
            this.editext = this.todos[index].text;
        },
        // 认定修改
        edited: function() {
            if (!this.editext) {
                alert("又调皮哦，不能为空");
                return;
            }
            this.todos[this.eindex].text = this.editext;
            //修改本地存储的数据
            var newValue = JSON.stringify(this.todos[this.eindex]);
            this.editLocalStorage(this.todos[this.eindex].time, newValue);
            this.isEdit = false;
        },
        // 本地存储相关函数
        // 添加localStorage对象名值对
        addLocalStorage: function(obj) {
            var item = JSON.stringify(obj);
            localStorage.setItem("todo" + obj.time, item);
        },
        //修改localStorage对象名值对time用来查找key
        editLocalStorage: function(time, newValue) {
            var len = localStorage.length;
            for (var j = 0; j < len; j++) {
                if (localStorage.key(j).indexOf(time) != -1) {
                    localStorage.setItem(localStorage.key(j), newValue);
                    return;
                }
            }
        },
        //删除名值
        removeLocalStorage: function(time) {
            var len = localStorage.length;
            for (var j = 0; j < len; j++) {
                if (localStorage.key(j).indexOf(time) != -1) {
                    localStorage.removeItem(localStorage.key(j));
                    return;
                }
            }
        },
        //把LocalStorage保存的数据传入todos
        onlocaLocalStorage: function() {
            var len = localStorage.length;
            for (var i = 0; i < len; i++) {
                if (localStorage.key(i).indexOf("todo") == 0) {
                    var key = localStorage.key(i);
                    var val = localStorage.getItem(key);
                    var todoObj = JSON.parse(val);
                    this.todos.unshift(todoObj);
                }
            }
        }
    },
    // 挂载成功时，从本地存储读取数据
    mounted: function() {
        this.onlocaLocalStorage();
    }
});