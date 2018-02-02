'use strict';
//支持指令：
//1.nc-value  只能写变量，不可以写表达式，双向绑定，凡是有value属性的元素，都可以使用。
//2.nc-for	  只能写命令，row in ary 这样的形式，任何元素都可以使用，但是在循环体内，只有{{$index}}是到处可用，row变量的取值，只能。
//3.nc-if	  支持表达式
//4.ng-class  支持指令，express?class1:class2这样的形式，express可以是表达式
//{{}}		  可以是表达式，可以接|过滤器
//$watch(proPathAry,function)，proPathAry参数是需要监控的变量名数组，function是回调函数
//$unwatch	  
//
//注意事项：
//1.变量必须先声明，否则不在托管范围
//2.变量只能使用a-zA-Z0-9_这些

//暴露给外部的全局对象
//注意nice-mvvm.js要放在第一个引入
var $nc = new Object();
var $WATCH_QUEE = {};
var $watch = function(proPathAry,fun){
	for(var i=0;i<proPathAry.length;i++){
		if(!$WATCH_QUEE[proPathAry[i]]){
			$WATCH_QUEE[proPathAry[i]] = [];
		}
		$WATCH_QUEE[proPathAry[i]].push({
			'proPathAry':proPathAry,
			'fun':fun
		});
	}
};
var $unwatch = function(watchId){
	//TODO:待实现
};

window.onload = function(){

	//*********************** $nc如果冲突，以上代码可以修改****************
	var $SCOPE = {
		'$DATA': $nc
	};

	var $SCOPE_DATA_ = new Object();//副本，用于脏值检测和同步
	
	$SCOPE.$NODE_ID_POINT = 0;//节点id指针
	$SCOPE.$UNREFRESH_NODE_ID = -1;//排除在外，不需要同步的节点id
	$SCOPE.$V2M_NODE_MAP = new Object();//存放VM渲染的节点对象

	$SCOPE.$ADD_V2M_NODE_MAP = function(expression,nodePack){
		//转换数组的表达形式
		expression = expression.replace(/\[/g,'.');
		expression = expression.replace(/\]/g,'');

		var tryAry = true;
		for(var pro in $SCOPE_DATA_){
			if(expression.indexOf(pro) >= 0){
				if(expression.indexOf('.'+pro) < 0 && expression.indexOf(pro+'.') < 0){
					if(!$SCOPE.$V2M_NODE_MAP[pro]){
						$SCOPE.$V2M_NODE_MAP[pro] = [];
					}
					tryAry = false;
					$SCOPE.$V2M_NODE_MAP[pro].push(nodePack);
				}
			}
		}

		if(tryAry){
			var proReg = new RegExp(expression+'\\.[0-9]+\\..*');
			for(var pro in $SCOPE_DATA_){
				if(proReg.test(pro)){
					if(!$SCOPE.$V2M_NODE_MAP[expression]){
						$SCOPE.$V2M_NODE_MAP[expression] = [];
					}
					$SCOPE.$V2M_NODE_MAP[expression].push(nodePack);
					break;
				}
			}
		}

		

		//每次有新的节点push进来的时候，需要讲对应key的数据副本清空重新渲染
		// delete $SCOPE_DATA_['.'+proPath];
	}


	//proPath表示单一的参数，不是表达式
	//express表示表达式，只有nc-if、{{}}有
	//command表示指令，nc-for和nc-class都是
	$SCOPE.$NODE_PROCESSOR = [{
		'commandName':'nc-value',//双向绑定
		'initFunc':function(node,proPath){
			var node_nc_id = $SCOPE.$NODE_ID_POINT++;

			var onchangeFun = node.onchange;
			node.onchange=function(){
				//保存值到内存
				$SCOPE.$SET_VAL(proPath,node.value);

				//调用用户原生方法
				if(onchangeFun){
					onchangeFun();
				}
			};
			
			var onfocusFun = node.onfocus;
			node.onfocus=function(){
				//将自己设为不需要dom更新
				$SCOPE.$UNREFRESH_NODE_ID = node_nc_id;
				//调用用户原生方法
				if(onfocusFun){
					onfocusFun();
				}
			}

			var onblurFun = node.onblur;
			node.onblur=function(){
				//将自己设为需要dom更新
				$SCOPE.$UNREFRESH_NODE_ID = -1;
				//调用用户原生方法
				if(onblurFun){
					onblurFun();
				}
			}

			//加入到V2M_大Map里
			$SCOPE.$ADD_V2M_NODE_MAP(proPath,{
				'id':node_nc_id,
				'node':node,
				'expression':proPath,
				'render':function(proPath,val){
					this.node.value=val;
				}
			});
		}
	},{
		'commandName':'nc-for',//for循环
		'initFunc':function(node,command){
			var node_nc_id = $SCOPE.$NODE_ID_POINT++;
			//比如row in records，records是数组，这里在V2M_MAP里的键，是recrods，而不是records[0]这样。
			var flag = command.substring(0,command.indexOf(' in '));
			flag = flag.replace(/ +/g,'');
			var flagReg = new RegExp(flag+'.','g');
			var proPath = command.substring(command.indexOf(' in ')+4);
			proPath = proPath.replace(/ +/g,'');

			var NEW_NODE_MAP = {
				'id':node_nc_id,
				'node':node,
				'expression':proPath,
				'render':function(proPath,val){
					//如果新的val的长度，和当前的dom节点列表已经不一致，那么需要重新加载节点，否则不需要加载新的节点
					
					if(val.length > this.newNodeAry.length){

						//有下一个兄弟节点，就在这个兄弟节点前使劲插入
						for(var i=this.newNodeAry.length;i<val.length;i++){

							//替换nc-for指令
							var newHtml = this.nodeHtml.replace(/nc-for='[^']+'/g,'');
							newHtml = newHtml.replace(/nc-for="[^"]+"/g,'');

							//替换row.
							newHtml = newHtml.replace(flagReg,proPath+'['+i+'].');
							//替换$index
							newHtml = newHtml.replace(/\{\{ *\$index *\}\}/g,i);

							var lowerNewHtml = newHtml.toLowerCase();
							//newHtml在拼接和处理前，需要补全
							//tr需要补充到table
							//option需要补充到select
							var level = 1;
							if(lowerNewHtml.indexOf('<tr') == 0){
								newHtml = '<table><tbody>'+newHtml+'</tbody></table>';
								level = 2;
							}else if(lowerNewHtml.indexOf('<option') == 0){
								newHtml = '<select>'+newHtml+'</select>';
								level=1;
							}else if(lowerNewHtml.indexOf('<ul') == 0){
								newHtml = '<ul>'+newHtml+'</ul>';
								level=1;
							}else{
								level=0;
							}
							//补全之后的newHtml，知道层级，添加到临时div后可以获取
							var tmpDiv =  document.createElement('div');
							tmpDiv.innerHTML = newHtml;
							var newNode = tmpDiv.childNodes[0];
							for(var j=0;j<level;j++){
								newNode = newNode.childNodes[0];
							}
							

							if(this.nextSibling){
								this.parentNode.insertBefore(newNode,this.nextSibling);
							}else{
								this.parentNode.appendChild(newNode);
							}
							this.newNodeAry.push(newNode);
							//初始化新加的节点
							$SCOPE.$INIT_MVVM(newNode);
						}
					} else if(val.length < this.newNodeAry.length){
						var removeNum = this.newNodeAry.length-val.length;
						for(var i=0;i<removeNum;i++){
							var removeNode = this.newNodeAry.pop();
							this.parentNode.removeChild(removeNode);
						}
					}
				},
				'parentNode':node.parentNode,
				'nextSibling':node.nextSibling,//下一个兄弟节点，用来循环插标签
				'newNodeAry':[]
			};


			//初始化的时候，就隐藏掉这个需要遍历的节点
			node.parentNode.removeChild(node);

			//原始节点html副本
			var tmpDiv = document.createElement('div');
			tmpDiv.appendChild(node);
			var cloneHtml = tmpDiv.innerHTML;
			NEW_NODE_MAP['nodeHtml'] = cloneHtml;

			//加入到V2M_大Map里
			$SCOPE.$ADD_V2M_NODE_MAP(proPath,NEW_NODE_MAP);
		}
	},{
		'commandName':'nc-if',//双向绑定
		'initFunc':function(node,expression){
			var node_nc_id = $SCOPE.$NODE_ID_POINT++;

			//加入到V2M_大Map里
			$SCOPE.$ADD_V2M_NODE_MAP(expression,{
				'id':node_nc_id,
				'node':node,
				'expression':expression,
				'render':function(expression,val){
					if(val){
						if(!this.node.parentNode){
							if(this.nextSibling){
								this.parentNode.insertBefore(this.node,this.nextSibling);
							}else{
								this.parentNode.appendChild(this.node);
							}
						}
					}else{
						this.parentNode.removeChild(this.node);
					}
				},
				'parentNode':node.parentNode,
				'nextSibling':node.nextSibling//下一个兄弟节点，用来循环插标签
			});
		}
	},{
		'commandName':'nc-class',//双向绑定
		'initFunc':function(node,command){
			var node_nc_id = $SCOPE.$NODE_ID_POINT++;

			var words = command.split('?');
			command = words[0];
			var vals = words[1].split(':');


			//加入到V2M_大Map里
			$SCOPE.$ADD_V2M_NODE_MAP(command,{
				'id':node_nc_id,
				'node':node,
				'expression':command,
				'render':function(command,val){
					if(val){
						this.node.setAttribute('class',vals[0]);
						this.node.setAttribute('className',vals[0]);//ie8以下
					}else{
						this.node.setAttribute('class',vals[1]);
						this.node.setAttribute('className',vals[1]);//ie8以下
					}
				}
			});
		}
	}];


	$SCOPE.$BIND_NODE = function(node){
		for(var i=0;i<$SCOPE.$NODE_PROCESSOR.length;i++){
			var val = node.getAttribute($SCOPE.$NODE_PROCESSOR[i].commandName);
			if(val){
				//如果有相关的指令，就执行指令预处理初始化
				$SCOPE.$NODE_PROCESSOR[i].initFunc(node,val);
			}
		}
	}

	$SCOPE.$BIND_TXT = function(node){
		var content = node.nodeValue;

		var start = content.indexOf('{{');
		var end = content.indexOf('}}');
		if(start <0 || end <= 0){
			return false;
		}

		var nodeTxtAry = [];
		var commandAry = [];
		var stop = false;
		for(;!stop;){
			var first = content.substring(0,start);
			var second = content.substring(start+2,end);
			//转换数组的表达形式
			second = second.replace(/\[/g,'.');
			second = second.replace(/\]/g,'');
			var filter = '';
			if(second.indexOf('|')>0){
				filter = second.substring(second.indexOf('|')+1);
				second = second.substring(0,second.indexOf('|'));

			}
			commandAry.push({
				command:second,
				filter:filter
			});
			var content = content.substring(end+2);
			start = content.indexOf('{{');
			end = content.indexOf('}}');

			nodeTxtAry.push({
				'name':first,
				'value':first
			});
			nodeTxtAry.push({
				'name':second,
				'value':''
			});
			if(start <0 || end <= 0){
				//如果下面没有需要解析的{{}}了，就结束，把卒后一个content拼接上
				nodeTxtAry.push({
					'name':content,
					'value':content
				});
				stop = true;
			}
		}

		for(var i=0;i<commandAry.length;i++){
			$SCOPE.$ADD_V2M_NODE_MAP(commandAry[i].command,{
				'id':$SCOPE.$NODE_ID_POINT++,
				'node':node,
				'expression':commandAry[i].command,
				'render':function(expression,val){
					if(this.expressionFilter){
						var param = isNaN(val)?'\''+val+'\'':val;
						val = eval(this.expressionFilter+'('+param+')');
					}

					this.node.nodeValue = '';
					for(var j=0;j<this.nodeTxtAry.length;j++){
						if(this.nodeTxtAry[j].name == expression){
							this.nodeTxtAry[j].value = val;
						}

						this.node.nodeValue = this.node.nodeValue+this.nodeTxtAry[j].value;
					}
				},
				'expressionFilter':commandAry[i].filter,
				'nodeTxtAry':nodeTxtAry//节点中文本的组成
			});
		}
	}

	//设置参数
	$SCOPE.$SET_VAL = function(proPath,val){
		proPath = proPath.replace(/\[/g,'.');
		proPath = proPath.replace(/\]/g,'');
		var pros = proPath.split('.');
		var obj = $SCOPE.$DATA;
		for(var i=0;i<pros.length;i++){
			if(i<pros.length-1){
				if(!obj[pros[i]]){
					obj[pros[i]] = new Object();
				}
			}else{
				obj[pros[i]] = val;
			}
			obj = obj[pros[i]];
		}
	}

	$SCOPE.$GET_VAL = function(proPath){
		//proPath其实是指令里的具体参数值
		//有可能是 name
		//有可能是 !name
		//还有可能是 name.something 或者 age-1这样
		for(var pro in $SCOPE_DATA_){
			if(proPath.indexOf(pro) >= 0){
				var words = proPath.split(pro);
				//比如 ' user.name' 按照'user.name'分解会有一个空格和一个'user.name'
				if(words.length>1){
					var newProPath = '';
					for(var i=0;i<words.length-1;i++){
						if(words[i].length > 0){
							if(words[i].substring(words[i].length-1)=="."){
								newProPath = newProPath+words[i]+pro;
							}else{
								newProPath = newProPath+words[i]+'$SCOPE.$DATA.'+pro;
							}
						}else{
							newProPath = newProPath+words[i]+'$SCOPE.$DATA.'+pro;
						}
					}
					proPath = newProPath+words[words.length-1];
				}
			}else{
				//cotinue;
			}
		}		
		

		

		/*var pros = proPath.split('.');
		var obj = $SCOPE.$DATA;
		for(var i=0;i<pros.length;i++){
			if(i == pros.length-1){
				//到底了
				return obj[pros[i]];
			}else{
				if( obj[pros[i]]){
					obj = obj[pros[i]];
				}else{
					return null;
				}
			}
		}*/
		try{
			//如果里面含有数组的成分，比如$SCOPE.$DATA.ary.0.name，应该改成...ary[0].name
			var words = proPath.split('.');
			proPath = '';
			for(var i=0;i<words.length;i++){
				if(proPath.length > 0){
					if(isNaN(words[i])){
						proPath = proPath+'.';
					}else{
						//如果是纯数字，改成数组方式取
						proPath = proPath+'[';
					}
				}

				proPath = proPath+words[i];

				if(!isNaN(words[i])){
					//如果是纯数字，改成数组方式取
					proPath = proPath+']';
				}
			}

			var result = eval(proPath);
			return result;
		}catch(err){
		  	return undefined;
		}
	}

	$SCOPE.$GET_PRO_SOLID_MAP = function(pKey,DATA,emptyProSolidMap){
		if(pKey){
			emptyProSolidMap[pKey]=DATA;
			pKey = pKey+'.';
		}else{
			pKey = '';
		}
		if(DATA instanceof Object){
			for(var key in DATA){
				$SCOPE.$GET_PRO_SOLID_MAP(pKey+key,DATA[key],emptyProSolidMap);
			}
		}
	}

	$SCOPE.$SYNC_SCOPE_DATA_ = function(proSolidMap){
		var keys = {};
		
		// 数据版本不一致，需要同步的字段
		for(var proPath in proSolidMap){
			do{
				if($SCOPE_DATA_[proPath] !== undefined && $SCOPE_DATA_[proPath].value === proSolidMap[proPath]){
					//如果存在并且已经最新，不需要同步
					break;
				}

				var version = 1;
				if($SCOPE_DATA_[proPath] !== undefined){
					version = $SCOPE_DATA_[proPath]['version']+1;
				}
				$SCOPE_DATA_[proPath] = {
					'version': version,
					'value': proSolidMap[proPath]
				};

				keys[proPath]=$SCOPE_DATA_[proPath]['version'];
			}while(false);
		}

		//数据到dom节点版本不一致，需要同步的
		for(var proPath in $SCOPE_DATA_){
			var version = $SCOPE_DATA_[proPath]['version'];
			do{
				if(keys[proPath] !== undefined) {
					//已经存在的要同步字段，就不需要重复添加到等待同步了
					break;
				}

				//如果值已经删除了，同样需要更新dom，但是版本还是要一致的
				if(proSolidMap[proPath] === undefined){
					//清楚副本
					delete $SCOPE_DATA_[proPath];
					keys[proPath] = version;
					break;
				}

				for(var i=0;$SCOPE.$V2M_NODE_MAP[proPath] && i<$SCOPE.$V2M_NODE_MAP[proPath].length;i++){
					if($SCOPE.$V2M_NODE_MAP[proPath][i]['version'] !== version){
						keys[proPath] = version;
						break;
					}
				}

			}while(false);
		}

		//根据keys，向上追溯，所有这条线的，都需要渲染
		var needSyncProPath = new Object();
		for(var proPath in keys){
			needSyncProPath[proPath] = keys[proPath];

			var end = proPath.lastIndexOf('.');
			while(end > 0){
				proPath = proPath.substring(0,end);
				needSyncProPath[proPath]=keys[proPath];
				end = proPath.lastIndexOf('.');
			}
		}

		return needSyncProPath;
	}

	$SCOPE.$FLUSH = function(){

		//计算的出，需要进行同步的proPath
		//深度优先遍历
		var proSolidMap = {};
		$SCOPE.$GET_PRO_SOLID_MAP(null,$SCOPE.$DATA,proSolidMap);

		var needSyncProPath =  $SCOPE.$SYNC_SCOPE_DATA_(proSolidMap);


		for(var proPath in needSyncProPath){
			for(var i=0;$SCOPE.$V2M_NODE_MAP[proPath] !== undefined && i<$SCOPE.$V2M_NODE_MAP[proPath].length;i++){
				var nodePack = $SCOPE.$V2M_NODE_MAP[proPath][i];
				if(nodePack.id == $SCOPE.$UNREFRESH_NODE_ID) continue;

				//flush dom
				nodePack['version'] = needSyncProPath[proPath];

				var val = $SCOPE.$GET_VAL(nodePack.expression);
				if(val === undefined){
					val = '';
				}
				nodePack.render(nodePack.expression,val);

			}

			//flush $watch data
			if($WATCH_QUEE[proPath] && $WATCH_QUEE[proPath].length > 0){
				for(var j=0;j<$WATCH_QUEE[proPath].length;j++){
					var $watchObj = $WATCH_QUEE[proPath][j];
					
					var execStatement = '$watchObj.fun(';
					for(var k=0;k<$watchObj.proPathAry.length;k++){
						execStatement = execStatement+'$SCOPE.$DATA.'+$watchObj.proPathAry[k]+'';
						if(k<$watchObj.proPathAry.length-1){
							execStatement = execStatement+',';
						}
					}
					execStatement = execStatement+')';
					eval(execStatement);
				}
			}
		}
	}

	$SCOPE.$INIT_MVVM = function(node){
	    ///Attribute  nodeType值为2，表示节点属性
	    ///Comment    nodeType值为8，表示注释文本
	    ///Document   nodeType值为9，表示Document
	    ///DocumentFragment   nodeType值为11，表示Document片段
	    ///Element            nodeType值为1，表示元素节点
	    ///Text               nodeType值为3，表示文本节点
	    var total=0;
	    //1代表节点的类型为Element
	    if(node.nodeType==1) {
	    	//初始化节点
	    	$SCOPE.$BIND_NODE(node);
	    }
	    //3代表节点为文本
	    if(node.nodeType==3){
	    	
	    	$SCOPE.$BIND_TXT(node);
	    }

	    var childrens=node.childNodes;
	    for(var i=0;childrens !== undefined && i<childrens.length;i++) {
	    	$SCOPE.$INIT_MVVM(childrens[i]);
	    }
	}

	$SCOPE.$FLUSH();
	$SCOPE.$INIT_MVVM(document);

	$SCOPE.$INTERVAL = setInterval(function(){
		$SCOPE.$FLUSH();
	},1);
}