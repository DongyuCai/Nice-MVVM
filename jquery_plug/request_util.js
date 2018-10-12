'use strict'
//包装请求异常处理
$.GET_SUCCESS_CALL_BACK_FUN = function(successCallback){
    var ERROR_CALL_BACK = function(result){
        $.SUCCESS("操作成功");
        if(successCallback){
            successCallback(result);
        }
    }
    return ERROR_CALL_BACK;
}

$.GET_ERROR_CALL_BACK_FUN = function(errorCallback){
    var ERROR_CALL_BACK = function(XMLHttpRequest, textStatus, errorThrown){
        if(XMLHttpRequest.status == 401){
            //需要登录
            bootbox.alert(XMLHttpRequest.responseText, function(){ 
                location.href="/login.html";
            });
            
        }else{
            if(!XMLHttpRequest.status && !XMLHttpRequest.responseText){
                XMLHttpRequest.responseText = "抱歉！服务器开小差了~";
            }

            $.ERROR(XMLHttpRequest.responseText);
        }

        if(errorCallback){
            errorCallback(XMLHttpRequest, textStatus, errorThrown);
        }
    }
    return ERROR_CALL_BACK;
}

$.SUBMIT_FORM = function(formId,url,successCallback,errorCallback){
    $(".btn[data-loading-text]").button('loading');

    var XJP_ADMIN_TOKEN = $.cookie('XJP_ADMIN_TOKEN');
    if(!XJP_ADMIN_TOKEN){
        //跳转登录页
        location.href="/login.html";
    }else{
        var SUCCESS_CALL_BACK = $.GET_SUCCESS_CALL_BACK_FUN(successCallback);
        var ERROR_CALL_BACK = $.GET_ERROR_CALL_BACK_FUN(errorCallback);
        $.submitForm(formId,API_URL+url,{"XJP_ADMIN_TOKEN": XJP_ADMIN_TOKEN},SUCCESS_CALL_BACK,ERROR_CALL_BACK,function(){
            $(".btn[data-loading-text]").button('reset');
        });
    }
};

$.GET = function (url,data,successCallback,errorCallback){
    $(".btn[data-loading-text]").button('loading');

    var XJP_ADMIN_TOKEN = $.cookie('XJP_ADMIN_TOKEN');
    if(!XJP_ADMIN_TOKEN){
        //跳转登录页
        location.href="/login.html";
    }else{
        var ERROR_CALL_BACK = $.GET_ERROR_CALL_BACK_FUN(errorCallback);
        $.get(API_URL+url,data,{"XJP_ADMIN_TOKEN": XJP_ADMIN_TOKEN},successCallback,ERROR_CALL_BACK,function(){
            $(".btn[data-loading-text]").button('reset');
        });
    }
};


$.POST = function(url,data,successCallback,errorCallback){
    $(".btn[data-loading-text]").button('loading');

    var XJP_ADMIN_TOKEN = $.cookie('XJP_ADMIN_TOKEN');
    if(!XJP_ADMIN_TOKEN){
        //跳转登录页
        location.href="/login.html";
    }else{
        var SUCCESS_CALL_BACK = $.GET_SUCCESS_CALL_BACK_FUN(successCallback);
        var ERROR_CALL_BACK = $.GET_ERROR_CALL_BACK_FUN(errorCallback);
        $.post(API_URL+url,data,{"XJP_ADMIN_TOKEN": XJP_ADMIN_TOKEN},SUCCESS_CALL_BACK,ERROR_CALL_BACK,function(){
            $(".btn[data-loading-text]").button('reset');
        });
    }
};

$.PUT = function(url,data,successCallback,errorCallback){
    $(".btn[data-loading-text]").button('loading');

    var XJP_ADMIN_TOKEN = $.cookie('XJP_ADMIN_TOKEN');
    if(!XJP_ADMIN_TOKEN){
        //跳转登录页
        location.href="/login.html";
    }else{
        var SUCCESS_CALL_BACK = $.GET_SUCCESS_CALL_BACK_FUN(successCallback);
        var ERROR_CALL_BACK = $.GET_ERROR_CALL_BACK_FUN(errorCallback);
        $.put(API_URL+url,data,{"XJP_ADMIN_TOKEN": XJP_ADMIN_TOKEN},SUCCESS_CALL_BACK,ERROR_CALL_BACK,function(){
            $(".btn[data-loading-text]").button('reset');
        });
    }
};

$.DELETE = function(url,data,successCallback,errorCallback){
    $(".btn[data-loading-text]").button('loading');

    var XJP_ADMIN_TOKEN = $.cookie('XJP_ADMIN_TOKEN');
    if(!XJP_ADMIN_TOKEN){
        //跳转登录页
        location.href="/login.html";
    }else{
        var SUCCESS_CALL_BACK = $.GET_SUCCESS_CALL_BACK_FUN(successCallback);
        var ERROR_CALL_BACK = $.GET_ERROR_CALL_BACK_FUN(errorCallback);
        $.delete(API_URL+url,data,{"XJP_ADMIN_TOKEN": XJP_ADMIN_TOKEN},SUCCESS_CALL_BACK,ERROR_CALL_BACK,function(){
            $(".btn[data-loading-text]").button('reset');
        });
    }
};