
/**
 * 1、未包含 链式访问  在每个属性、方法里面后面加一个return
 * 2、新增一个 this.elements 来储存选择器 选择的元素，之后在改造
 * ------------------------
 * 改造了一个 $id()  和 html() 方法 ，可以参考
 *
 */
(function(w){

    var $$ = function() {
        this.init();
        //  this.elements = [];   链式访问+this.element
}


$$.prototype = {
    extend: function(tar, source) {
        for (var i in source) {
            tar[i] = source[i];
        }
        return tar;
    },
    init: function() {
        this.fnExtend(),
        this.strExtend(),
        this.arrayExtend(),
        this.DateExtend(),
        this.numExtend();
    },
    //函数扩展
    fnExtend: function() {
        //给函数扩展方法
        Function.prototype.before = function(func) {
            var __self = this;
            return function() {
                if (func.apply(this, arguments) === false) {
                    return false;
                }
                return __self.apply(this, arguments);
            }
        }
        Function.prototype.after = function(func) {
            var __self = this;
            return function() {
                var ret = __self.apply(this, arguments);
                if (ret === false) {
                    return false;
                }
                func.apply(this, arguments);
                return ret;
            }
        }
    },
    //字符串扩展
    strExtend: function() {},
    //数组扩展
    arrayExtend: function() {},
    //日期扩展
    DateExtend: function() {},
    //数字扩展
    numExtend: function() {}


}

var $$ = new $$();



/*基础模块*/
$$.extend($$, {
    //简单的数据绑定formateString
    formateString: function(str, data) {
        return str.replace(/@\((\w+)\)/g, function(match, key) {
            return typeof data[key] === "undefined" ? '' : data[key]
        });
    },
    //随机数
    random: function(begin, end) {
        return Math.floor(Math.random() * (end - begin)) + begin;
    },

    //去除左边空格
    ltrim: function(str) {
        return str.replace(/(^\s*)/g, '');
    },
    //去除右边空格
    rtrim: function(str) {
        return str.replace(/(\s*$)/g, '');
    },
    //去除空格
    trim: function(str) {
        return str.replace(/(^\s*)|(\s*$)/g, '');
    },

})

/*数据检测模块*/
$$.extend($$, {
    isString: function(val) {
        return typeof val === "string";
    },
    isNumber: function(val) {
        return typeof val === "number";
    },
    isBoolean: function(val) {
        return typeof val === "boolean";
    },
    isUndefined: function(val) {
        return typeof val === "undefined";
    },
    isObj: function(str) {
        if (str === null || typeof str === 'undefined') {
            return false;
        }
        return typeof str === 'object';
    },
    isNull: function(val) {
        return val === null;
    },
    isArray: function(arr) {
        if (arr === null || typeof arr === 'undefined') {
            return false;
        }
        return arr.constructor === Array;
    }

})

/*选择模块*/
$$.extend($$, {
    $id: function(id) {
        return document.getElementById(id);

        //  this.elements.push(document.getElementById(id));   链式访问+this.element
        //  return this;
    },
    // tag选择器  标签选择器
    $tag: function(tag, context) {
        if (typeof context == 'string') {
            context = $$.$id(context);
        }
        if (context) {
            return context.getElementsByTagName(tag);
        } else {
            return document.getElementsByTagName(tag);
        }
    },
    //class选择器
    $class: function(className, context) {
        var elements;
        var dom;
        //如果传递过来的是字符串 ，则转化成元素对象
        if ($$.isString(context)) {
            context = document.getElementById(context);
        }
        //如果兼容getElementsByClassName
        if (context.getElementsByClassName) {
            return context.getElementsByClassName(className);
        } else {
            //如果浏览器不支持
            dom = context.getElementsByTagName('*');
            for (var i, len = dom.length; i < len; i++) {
                if (dom[i].className && dom[i].className == className) {
                    elements.push(dom[i]);
                }
            }
        }
        return elements;
    },
    //分组选择器
    $group: function(content) {
        var result = [],
            doms = [];
        var arr = $$.trim(content).split(',');
        //alert(arr.length);
        for (var i = 0, len = arr.length; i < len; i++) {
            var item = $$.trim(arr[i])
            var first = item.charAt(0)
            var index = item.indexOf(first)
            if (first === '.') {
                doms = $$.$class(item.slice(index + 1))
                    //每次循环将doms保存在reult中
                    //result.push(doms);//错误来源

                //陷阱1解决 封装重复的代码成函数
                pushArray(doms, result)

            } else if (first === '#') {
                doms = [$$.$id(item.slice(index + 1))] //陷阱：之前我们定义的doms是数组，但是$id获取的不是数组，而是单个元素
                    //封装重复的代码成函数
                pushArray(doms, result)
            } else {
                doms = $$.$tag(item)
                pushArray(doms, result)
            }
        }
        return result;

        //封装重复的代码
        function pushArray(doms, result) {
            for (var j = 0, domlen = doms.length; j < domlen; j++) {
                result.push(doms[j])
            }
        }
    },
    //层次选择器
    $cengci: function(select) {
        //个个击破法则 -- 寻找击破点
        var sel = $$.trim(select).split(' ');
        var result = [];
        var context = [];
        for (var i = 0, len = sel.length; i < len; i++) {
            result = [];
            var item = $$.trim(sel[i]);
            var first = sel[i].charAt(0)
            var index = item.indexOf(first)
            if (first === '#') {
                //如果是#，找到该元素，
                pushArray([$$.$id(item.slice(index + 1))]);
                context = result;
            } else if (first === '.') {
                //如果是.
                //如果是.
                //找到context中所有的class为【s-1】的元素 --context是个集合
                if (context.length) {
                    for (var j = 0, contextLen = context.length; j < contextLen; j++) {
                        pushArray($$.$class(item.slice(index + 1), context[j]));
                    }
                } else {
                    pushArray($$.$class(item.slice(index + 1)));
                }
                context = result;
            } else {
                //如果是标签
                //遍历父亲，找到父亲中的元素==父亲都存在context中
                if (context.length) {
                    for (var j = 0, contextLen = context.length; j < contextLen; j++) {
                        pushArray($$.$tag(item, context[j]));
                    }
                } else {
                    pushArray($$.$tag(item));
                }
                context = result;
            }
        }

        return context;

        //封装重复的代码
        function pushArray(doms) {
            for (var j = 0, domlen = doms.length; j < domlen; j++) {
                result.push(doms[j])
            }
        }
    },
    //多组+层次
    $select: function(str) {
        var result = [];
        var item = $$.trim(str).split(',');
        for (var i = 0, glen = item.length; i < glen; i++) {
            var select = $$.trim(item[i]);
            var context = [];
            context = $$.$cengci(select);
            pushArray(context);

        };
        return result;

        //封装重复的代码
        function pushArray(doms) {
            for (var j = 0, domlen = doms.length; j < domlen; j++) {
                result.push(doms[j])
            }
        }
    },
    //html5实现的选择器
    $all: function(selector, context) {
        context = context || document;
        return context.querySelectorAll(selector);
    },
})


/*css模块*/
$$.extend($$, {
    //样式
    css: function(context, key, value) {
        var dom = $$.isString(context) ? $$.$all(context) : context;
        //如果是数组
        if (dom.length) {
            //先骨架骨架 -- 如果是获取模式 -- 如果是设置模式
            //如果value不为空，则表示设置
            if (value) {
                for (var i = dom.length - 1; i >= 0; i--) {
                    setStyle(dom[i], key, value);
                }
                //            如果value为空，则表示获取
            } else {
                return getStyle(dom[0]);
            }
            //如果不是数组
        } else {
            if (value) {
                setStyle(dom, key, value);
            } else {
                return getStyle(dom);
            }
        }

        function getStyle(dom) {
            if (dom.currentStyle) {
                return dom.currentStyle[key];
            } else {
                return getComputedStyle(dom, null)[key];
            }
        }

        function setStyle(dom, key, value) {
            dom.style[key] = value;
        }
    },
    //显示
    show: function(content) {
        var doms = $$.$all(content)
        for (var i = 0, len = doms.length; i < len; i++) {
            $$.css(doms[i], 'display', 'block');
        }
    },
    //隐藏和显示元素
    hide: function(content) {
        var doms = $$.$all(content)
        for (var i = 0, len = doms.length; i < len; i++) {
            $$.css(doms[i], 'display', 'none');
        }
    },
    //元素高度宽度概述
    //计算方式：clientHeight clientWidth innerWidth innerHeight
    //元素的实际高度+border，也不包含滚动条
    Width: function(id) {
        return $$.$id(id).clientWidth
    },
    Height: function(id) {
        return $$.$id(id).clientHeight
    },


    //元素的滚动高度和宽度
    //当元素出现滚动条时候，这里的高度有两种：可视区域的高度 实际高度（可视高度+不可见的高度）
    //计算方式 scrollwidth
    scrollWidth: function(id) {
        return $$.$id(id).scrollWidth
    },
    scrollHeight: function(id) {
        return $$.$id(id).scrollHeight
    },


    //元素滚动的时候 如果出现滚动条 相对于左上角的偏移量
    //计算方式 scrollTop scrollLeft
    scrollTop: function(id) {
        return $$.$id(id).scrollTop
    },
    scrollLeft: function(id) {
        return $$.$id(id).scrollLeft
    },

    //获取屏幕的高度和宽度
    screenHeight: function() {
        return window.screen.height
    },
    screenWidth: function() {
        return window.screen.width
    },


    //文档视口的高度和宽度
    wWidth: function() {
        return document.documentElement.clientWidth
    },
    wHeight: function() {
        return document.documentElement.clientHeight
    },
    //文档滚动区域的整体的高和宽
    wScrollHeight: function() {
        return document.body.scrollHeight
    },
    wScrollWidth: function() {
        return document.body.scrollWidth
    },
    //获取滚动条相对于其顶部的偏移
    wScrollTop: function() {
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
        return scrollTop
    },
    //获取滚动条相对于其左边的偏移
    wScrollLeft: function() {
        var scrollLeft = document.body.scrollLeft || (document.documentElement && document.documentElement.scrollLeft);
        return scrollLeft
    }
})

/*属性模块*/
$$.extend($$, {
    //属性操作，获取属性的值，设置属性的值 at tr（'test','target','_blank'）
    attr: function(content, key, value) {
        var dom = $$.$all(content);
        //        如果是数组  比如tag
        if (dom.length) {
            if (value) {
                for (var i = 0, len = dom.length; i < len; i++) {
                    dom[i].setAttribute(key, value);
                }
            } else {
                return dom[0].getAttribute(key);
            }
            //            如果是单个元素  比如id
        } else {
            if (value) {
                dom.setAttribute(key, value);
            } else {
                return dom.getAttribute(key);
            }
        }
    },
    //动态添加和移除class
    addClass: function(context, name) {
        var doms = $$.$all(context);
        //如果获取的是集合
        if (doms.length) {
            for (var i = 0, len = doms.length; i < len; i++) {
                addName(doms[i]);
            }
            //如果获取的不是集合
        } else {
            addName(doms);
        }

        function addName(dom) {
            dom.className = dom.className + ' ' + name;
        }
    },
    removeClass: function(context, name) {
        var doms = $$.$all(context);
        if (doms.length) {
            for (var i = 0, len = doms.length; i < len; i++) {
                removeName(doms[i]);
            }
        } else {
            removeName(doms);
        }

        function removeName(dom) {
            dom.className = dom.className.replace(name, '');
        }
    },
    //判断是否有
    hasClass: function(context, name) {
        var doms = $$.$all(context)
        var flag = true;
        for (var i = 0, len = doms.length; i < len; i++) {
            flag = flag && check(doms[i], name)
        }

        return flag;
        //判定单个元素
        function check(element, name) {
            return -1 < (" " + element.className + " ").indexOf(" " + name + " ")
        }
    },
    //获取
    getClass: function(id) {
        var doms = $$.$all(id)
        return $$.trim(doms[0].className).split(" ")
    }

})

/*内容框架*/
$$.extend($$,{
    //innerHTML的函数版本
    html: function(context,value) {
        var doms = $$.$all(context);

        // var doms = this.elements;   链式访问 + this.element
        //设置
        if (value) {
            for (var i = 0, len = doms.length; i < len; i++) {
                doms[i].innerHTML = value;
            }
        } else {
            return doms[0].innerHTML
        }
    }
})



/*事件模块*/
$$.extend($$, {
    on: function(id, type, fn) {
        var dom = $$.isString(id) ? document.getElementById(id) : id;

        //W3C版本 --火狐 谷歌 等大多数浏览器
        if (dom.addEventListener) {
            dom.addEventListener(type, fn, false);
        } else if (dom.attachEvent) {
            // 如果支持IE
            dom.attachEvent('on' + type, fn)
        }
    },
    un: function(id, type, fn) {
        var dom = $$.isString(id) ? document.getElementById(id) : id;

        //W3C版本 --火狐 谷歌 等大多数浏览器
        if (dom.removeEventListener) {
            dom.removeEventListener(type, fn, false);
        } else if (dom.detachEvent) {
            // 如果支持IE
            dom.detachEvent(type, fn)
        }
    },

    /*点击*/
    click: function(id, fn) {
        this.on(id, 'click', fn);
    },
    /*鼠标移上*/
    mouseover: function(id, fn) {
        this.on(id, 'mouseover', fn);
    },
    /*鼠标离开*/
    mouseout: function(id, fn) {
        this.on(id, 'mouseout', fn);
    },
    /*悬浮*/
    hover: function(id, fnOver, fnOut) {
        if (fnOver) {
            this.on(id, "mouseover", fnOver);
        }
        if (fnOut) {
            this.on(id, "mouseout", fnOut);
        }
    },
    /*获取event对象*/
    getEvent: function(e) {
        return e ? e : window.event;
    },

    /*获取目标元素*/
    getTarget: function(e) {
        var e = $$.getEvent(e);
        return e.target || e.srcElement;
    },

    /*阻止默认行为*/
    preventDefault: function(e) {
        var event = $$.getEvent(event);
        if (event.preventDefault) {
            event.preventDefault();
        } else {
            event.returnValue = false;
        }
    },

    /*阻止冒泡*/
    stopPropagation: function(event) {
        var event = $$.getEvent(event);
        if (event.stopPropagation) {
            event.stopPropagation();
        } else {
            event.cancelBubble = true;
        }
    },
    //事件委托
    delegate: function(pid, eventType, selector, fn) {
        //参数处理
        var parent = $$.$id(pid);

        function handle(e) {
            var target = $$.getTarget(e);
            if (target.nodeName.toLowerCase() === selector || target.id === selector || target.className.indexOf(selector) != -1) {
                // 在事件冒泡的时候，回以此遍历每个子孙后代，如果找到对应的元素，则执行如下函数
                // 为什么使用call，因为call可以改变this指向
                // 大家还记得，函数中的this默认指向window，而我们希望指向当前dom元素本身
                fn.call(target);
            }
        }
        //当我们给父亲元素绑定一个事件，他的执行顺序：先捕获到目标元素，然后事件再冒泡
        //这里是是给元素对象绑定一个事件
        parent[eventType] = handle;
    },

})


/*ajax*/
$$.extend($$, {
    //ajax - 前面我们学习的
    myAjax: function(URL, fn) {
        var xhr = createXHR(); //返回了一个对象，这个对象IE6兼容。
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300 || xhr.status == 304) {
                    fn(xhr.responseText);
                } else {
                    alert("错误的文件！");
                }
            }
        };
        xhr.open("get", URL, true);
        xhr.send();

        //闭包形式，因为这个函数只服务于ajax函数，所以放在里面
        function createXHR() {
            //本函数来自于《JavaScript高级程序设计 第3版》第21章
            if (typeof XMLHttpRequest != "undefined") {
                return new XMLHttpRequest();
            } else if (typeof ActiveXObject != "undefined") {
                if (typeof arguments.callee.activeXString != "string") {
                    var versions = ["MSXML2.XMLHttp.6.0", "MSXML2.XMLHttp.3.0",
                            "MSXML2.XMLHttp"
                        ],
                        i, len;

                    for (i = 0, len = versions.length; i < len; i++) {
                        try {
                            new ActiveXObject(versions[i]);
                            arguments.callee.activeXString = versions[i];
                            break;
                        } catch (ex) {
                            //skip
                        }
                    }
                }

                return new ActiveXObject(arguments.callee.activeXString);
            } else {
                throw new Error("No XHR object available.");
            }
        }
    }

})

/*缓存框架 - 内存篇*/
$$.cache = {
    data: [],
    get: function(key) {
        console.log('111')
        var value = null;
        console.log(this.data)
        for (var i = 0, len = this.data.length; i < len; i++) {
            var item = this.data[i]
            if (key == item.key) {
                value = item.value;
            }
        }
        console.log('get' + value)
        return value;
    },
    add: function(key, value) {
        var json = { key: key, value: value };
        this.data.push(json);
    },
    delete: function(key) {
        var status = false;
        for (var i = 0, len = this.data.length; i < len; i++) {
            var item = this.data[i]
                // 循环数组元素
            if (item.key.trim() == key) {
                this.data.splice(i, 1); //开始位置,删除个数
                status = true;
                break;
            }
        }
        return status;
    },
    update: function(key, value) {
        var status = false;
        // 循环数组元素
        for (var i = 0, len = this.data.length; i < len; i++) {
            var item = this.data[i]
            if (item.key.trim() === key.trim()) {
                item.value = value.trim();
                status = true;
                break;
            }
        }
        return status;
    },
    isExist: function(key) {
        for (var i = 0, len = this.data.length; i < len; i++) {
            var item = this.data[i]
            if (key === item.key) {
                return true;
            } else {
                return false;
            }
        }
    }
}

/*cookie框架*/
$$.cookie = {
    //设置coolie
    setCookie: function(name, value, days, path) {
        var name = escape(name);
        var value = escape(value);
        var expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        path = path == "" ? "" : ";path=" + path;
        _expires = (typeof hours) == "string" ? "" : ";expires=" + expires.toUTCString();
        document.cookie = name + "=" + value + _expires + path;
    },
    //获取cookie值
    getCookie: function(name) {
        var name = escape(name);
        //读cookie属性，这将返回文档的所有cookie
        var allcookies = document.cookie;

        //查找名为name的cookie的开始位置
        name += "=";
        var pos = allcookies.indexOf(name);
        //如果找到了具有该名字的cookie，那么提取并使用它的值
        if (pos != -1) { //如果pos值为-1则说明搜索"version="失败
            var start = pos + name.length; //cookie值开始的位置
            var end = allcookies.indexOf(";", start); //从cookie值开始的位置起搜索第一个";"的位置,即cookie值结尾的位置
            if (end == -1) end = allcookies.length; //如果end值为-1说明cookie列表里只有一个cookie
            var value = allcookies.substring(start, end); //提取cookie的值
            return unescape(value); //对它解码
        } else return ""; //搜索失败，返回空字符串
    },
    //删除cookie
    deleteCookie: function(name, path) {
        var name = escape(name);
        var expires = new Date(0);
        path = path == "" ? "" : ";path=" + path;
        document.cookie = name + "=" + ";expires=" + expires.toUTCString() + path;
    }
}

/*本地存储框架*/
$$.store = (function() {
    var api = {},
        win = window,
        doc = win.document,
        localStorageName = 'localStorage',
        globalStorageName = 'globalStorage',
        storage;

    api.set = function(key, value) {};
    api.get = function(key) {};
    api.remove = function(key) {};
    api.clear = function() {};

    if (localStorageName in win && win[localStorageName]) {
        storage = win[localStorageName];
        api.set = function(key, val) { storage.setItem(key, val) };
        api.get = function(key) {
            return storage.getItem(key) };
        api.remove = function(key) { storage.removeItem(key) };
        api.clear = function() { storage.clear() };

    } else if (globalStorageName in win && win[globalStorageName]) {
        storage = win[globalStorageName][win.location.hostname];
        api.set = function(key, val) { storage[key] = val };
        api.get = function(key) {
            return storage[key] && storage[key].value };
        api.remove = function(key) { delete storage[key] };
        api.clear = function() {
            for (var key in storage) { delete storage[key] } };

    } else if (doc.documentElement.addBehavior) {
        function getStorage() {
            if (storage) {
                return storage }
            storage = doc.body.appendChild(doc.createElement('div'));
            storage.style.display = 'none';
            // See http://msdn.microsoft.com/en-us/library/ms531081(v=VS.85).aspx
            // and http://msdn.microsoft.com/en-us/library/ms531424(v=VS.85).aspx
            storage.addBehavior('#default#userData');
            storage.load(localStorageName);
            return storage;
        }
        api.set = function(key, val) {
            var storage = getStorage();
            storage.setAttribute(key, val);
            storage.save(localStorageName);
        };
        api.get = function(key) {
            var storage = getStorage();
            return storage.getAttribute(key);
        };
        api.remove = function(key) {
            var storage = getStorage();
            storage.removeAttribute(key);
            storage.save(localStorageName);
        }
        api.clear = function() {
            var storage = getStorage();
            var attributes = storage.XMLDocument.documentElement.attributes;;
            storage.load(localStorageName);
            for (var i = 0, attr; attr = attributes[i]; i++) {
                storage.removeAttribute(attr.name);
            }
            storage.save(localStorageName);
        }
    }
    return api;
})();

/*自定义常用模块*/
$$.extend($$,{
    // 延迟执行
    sleep:function(time){
        var now = +new Date();
        while (true) {
            if (new Date() - now > time) {
                break;
            }
        }
    },
    // 统计函数执行时间
    logTime:function(func) {
    //相当于重新包装func，在前面植入一些代码，在后面又植入一些代码
    //这里： 1 在前面植入：当前时间
    //2 函数后面植入统计函数执行事件代码
    return func = (function() {
        var d;
        return func.before(function() {
            d = +new Date();
        }).after(function() {
            alert(new Date() - d);
        });
    })()
}

})


    w.$$ = $$;

})(window)


