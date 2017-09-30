'use strict';
var $NC_ID = 0;
function initMvvm(node){
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
    	bindNode(node);
    }
    //3代表节点为文本
    if(node.nodeType==3){
    	
    	bindTxt(node);
    }

    var childrens=node.childNodes;
    for(var i=0;i<childrens.length;i++) {
    	initMvvm(childrens[i]);
    } 
   
}


var $scope = new Object();
var nodeProcess = [{
	'name':'nc-value',
	'initFunc':function(node,proPath){
		var node_nc_id = $NC_ID++;
		node.onchange=function(){
			//保存值到内存
			setPro(proPath,node.value);
		};
		node.onfocus=function(){
			//将自己设为不需要dom更新
			$NO_REFRESH_NC_ID = node_nc_id;
		}
		node.onblure=function(){
			//将自己设为需要dom更新
			$NO_REFRESH_NC_ID = -1;
		}

		//加入到V2M_大Map里
		if(!$V2M_Map[proPath]){
			$V2M_Map[proPath] = [];
		}
		$V2M_Map[proPath].push({
			'id':node_nc_id,
			'node':node
		});

	}
}];
function bindNode(node){
	for(var i=0;i<nodeProcess.length;i++){
		var val = node.getAttribute(nodeProcess[i].name);
		if(val){
			//如果有相关的指令，就执行指令预处理初始化
			nodeProcess[i].initFunc(node,val);
		}
	}
}

var $NO_REFRESH_NC_ID = -1;
var $V2M_Map = new Object();
function bindTxt(node){
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
		if(!$V2M_Map[commandAry[i]]){
			$V2M_Map[commandAry[i]] = [];
		}
		$V2M_Map[commandAry[i]].push({
			'id':$NC_ID++,
			'nodeTxtAry':nodeTxtAry,
			'node':node
		});
	}
}

function cutCommand(command){
	var start = command.indexOf("{{");
	var end = command.indexOf("}}");
	
	start = start<0?0:start+2;
	if(end < 0){
		return command.substring(start);
	}else{
		return command.substring(start,end);
	}
}


//设置参数
function setPro(proPath,val){
	var pros = proPath.split(".");
	var obj = $scope;
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


function getVal(proPath){
	var pros = proPath.split('.');
	var obj = $scope;
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


//刷新DOM
/*function refreshTxt(proPath,val){
	var reg = new RegExp(proPath,"g");
	if($V2M_Map[proPath]){
		for(var i=0;i<$V2M_Map[proPath].length;i++){
			var nodePack = $V2M_Map[proPath][i];

			nodePack.node.nodeValue = "";
			for(var j=0;j<nodePack.nodeTxtAry.length;j++){
				if(nodePack.nodeTxtAry[j].name == proPath){
					nodePack.nodeTxtAry[j].value = val;
				}

				nodePack.node.nodeValue = nodePack.node.nodeValue+nodePack.nodeTxtAry[j].value;
			}
			
		}
	}
}
*/
var ncV2M_Interval = null;
function ncRefreshDom(){
	for(var proPath in $V2M_Map){
		var val = getVal(proPath);
		val = val?val:'';

		var reg = new RegExp(proPath,"g");
		for(var i=0;i<$V2M_Map[proPath].length;i++){
			var nodePack = $V2M_Map[proPath][i];
			if(nodePack.id == $NO_REFRESH_NC_ID) continue;
			
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

window.onload = function(){
	//绑定
	initMvvm(document);

	ncV2M_Interval = setInterval('ncRefreshDom()',100);
}