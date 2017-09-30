'use strict';
//暴露给外部的全局对象
//注意nice-mvvm.js要放在第一个引入
var $nc = new Object();

window.onload = function(){
	var $SCOPE = {
		'$DATA': $nc
	};
	var $SCOPE_DATA_ = new Object();//副本，用于脏值检测和同步
	
	$SCOPE.$NODE_ID_POINT = 0;//节点id指针
	$SCOPE.$UNREFRESH_NODE_ID = -1;//排除在外，不需要同步的节点id
	$SCOPE.$V2M_NODE_MAP = new Object();//存放VM渲染的节点对象

	$SCOPE.$NODE_PROCESSOR = [{
		'commandName':'nc-value',
		'initFunc':function(node,proPath){
			var node_nc_id = $SCOPE.$NODE_ID_POINT++;
			node.onchange=function(){
				//保存值到内存
				$SCOPE.$SET_VAL(proPath,node.value);
			};
			node.onfocus=function(){
				//将自己设为不需要dom更新
				$SCOPE.$UNREFRESH_NODE_ID = node_nc_id;
			}
			node.onblure=function(){
				//将自己设为需要dom更新
				$SCOPE.$UNREFRESH_NODE_ID = -1;
			}

			//加入到V2M_大Map里
			if(!$SCOPE.$V2M_NODE_MAP[proPath]){
				$SCOPE.$V2M_NODE_MAP[proPath] = [];
			}
			$SCOPE.$V2M_NODE_MAP[proPath].push({
				'id':node_nc_id,
				'node':node
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

		var start = content.indexOf("{{");
		var end = content.indexOf("}}");
		if(start <0 || end <= 0){
			return false;
		}

		var nodeTxtAry = [];
		var commandAry = [];
		var stop = false;
		for(;!stop;){
			var first = content.substring(0,start);
			var second = content.substring(start+2,end);
			commandAry.push(second);
			var content = content.substring(end+2);
			start = content.indexOf("{{");
			end = content.indexOf("}}");

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
			if(!$SCOPE.$V2M_NODE_MAP[commandAry[i]]){
				$SCOPE.$V2M_NODE_MAP[commandAry[i]] = [];
			}
			$SCOPE.$V2M_NODE_MAP[commandAry[i]].push({
				'id':$SCOPE.$NODE_ID_POINT++,
				'nodeTxtAry':nodeTxtAry,
				'node':node
			});
		}
	}

	//设置参数
	$SCOPE.$SET_VAL = function(proPath,val){
		var pros = proPath.split(".");
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
		var pros = proPath.split('.');
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
		}

		return null;
	}

	$SCOPE.$GET_PRO_SOLID_MAP = function(pKey,obj,valMap){
		if(obj instanceof Object){
			for(var key in obj){
				$SCOPE.$GET_PRO_SOLID_MAP(pKey+"."+key,obj[key],valMap);
			}
		} else if(obj instanceof Array){
			for(var i=0;i<obj.length;i++){
				$SCOPE.$GET_PRO_SOLID_MAP(pKey+"["+i+"]",obj[i],valMap);
			}
		} else {
			valMap[pKey]=obj;
		}
	}

	$SCOPE.$SYNC_SCOPE_DATA_ = function(proSolidMap){
		var keyArray = [];
		for(var key in proSolidMap){
			if(!$SCOPE_DATA_[key]){
				//不存在，直接创建
				$SCOPE_DATA_[key] = proSolidMap[key];
				keyArray.push(key.substring(1));
			}else{
				if($SCOPE_DATA_[key] !== proSolidMap[key]){
					$SCOPE_DATA_[key] = proSolidMap[key];
					keyArray.push(key.substring(1));
				}
			}
		}
		return keyArray;
	}

	$SCOPE.$FLUSH = function(){

		//计算的出，需要进行同步的proPath
		//深度优先遍历
		var proSolidMap = {};
		$SCOPE.$GET_PRO_SOLID_MAP('',$SCOPE.$DATA,proSolidMap);
		var needSyncPro =  $SCOPE.$SYNC_SCOPE_DATA_(proSolidMap);

		

		for(var index=0;index<needSyncPro.length;index++){
			var proPath = needSyncPro[index];
			var val = $SCOPE.$GET_VAL(proPath);
			val = val||val===0||val==='0'?val:'';

			var reg = new RegExp(proPath,"g");
			for(var i=0;i<$SCOPE.$V2M_NODE_MAP[proPath].length;i++){
				var nodePack = $SCOPE.$V2M_NODE_MAP[proPath][i];
				if(nodePack.id == $SCOPE.$UNREFRESH_NODE_ID) continue;
				
				if(nodePack.nodeTxtAry){
					//纯文本节点
					nodePack.node.nodeValue = "";
					for(var j=0;j<nodePack.nodeTxtAry.length;j++){
						if(nodePack.nodeTxtAry[j].name == proPath){
							nodePack.nodeTxtAry[j].value = val;
						}

						nodePack.node.nodeValue = nodePack.node.nodeValue+nodePack.nodeTxtAry[j].value;
					}
				}else{
					//value处理
					nodePack.node.value=val;

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
	    for(var i=0;i<childrens.length;i++) {
	    	$SCOPE.$INIT_MVVM(childrens[i]);
	    } 
	}

	$SCOPE.$INIT_MVVM(document);

	$SCOPE.$INTERVAL = setInterval(function(){
		$SCOPE.$FLUSH();
	},100);
}