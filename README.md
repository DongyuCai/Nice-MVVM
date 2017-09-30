# Nice-MVVM  提供性能良好的MVVM功能
#####兼容ie6以上浏览器

# 支持命令
* nc-value 标签参数命令，用于绑定表单标签的值，双向绑定功能
* {{}} 取值命令
* nc-repeat 循环迭代命令，类似angular的ng-repeat

# 框架提供功能
* $nc.$flush(); 手动渲染
* $nc.$watch('proPath',function(oldVal,newVal){}) 监听内存中值的变化
