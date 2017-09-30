# Nice-MVVM  提供性能良好的MVVM功能
#####兼容ie6以上浏览器

# 支持命令
* nc-value 标签参数命令，用于绑定表单标签的值，双向绑定功能
* {{}} 取值命令
* nc-repeat 循环迭代命令，类似angular的ng-repeat

# 框架提供功能
* $nc.$flush(); 手动渲染
* $nc.$watch('proPath',function(oldVal,newVal){}) 监听内存中值的变化

# 框架架构



## $SCOPE
* $nc 暴露给外部使用的变量，如果不喜欢，或者冲突了，可以修改
* $SCOPE.$DATA 真正用以保存内存变量，与$nc共享
* $SCOPE.$INIT_MVVM 初始化，要做的事情是下面几件
	* 遍历document所有节点，结合$SCOPE.$NODE_PROCESSOR处理工厂，根据节点类型和节点指令来初始化
	* 初始化工作有 绑定事件监听，当表单中的输入框值改变，同步值到内存。设置渲染回调函数render，如果内存值发生改变，此回调函数就是用来渲染对应节点的。
* $SCOPE.$V2M_MAP 存放着所有有取值表达式与标签节点的对应，双向绑定也算取值，一旦检测到值改变，根据这个Map来取对应的节点，调用节点的渲染函数来渲染。
* $SCOPE_DATA_ 是$SCOPE.$DATA的慢备份，用以脏值检测，他的结构如下：
	* 如果$SCOPE.$DATA里数据是这样的：
	```
	{
		user:{
			age:1,
			name:'lisi'
		}

	}
	```
	* 则$SCOPE_DATA_中是这样的，键都变成扁平化的一维
	```
	{
		user.age:1,
		user.name:list
	}
	```