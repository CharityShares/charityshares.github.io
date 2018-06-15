'use strict';

var dappAddress = "n1fJ4kHR7DAQTeuprBhU1Uvk1NdkYa4pzB9";
var FundShow = function() {

}
FundShow.prototype = {

    init: function() {
        var self = this;
        self.initFundList();
    },
    initFundList:function(){
        var page={"pageSize":paginationObj.page_size,"pageNum":1};
        this.showFundList(page);
        this.showFundSum();
    },
    showFundSum:function(){
        var req_args = [];
        window.postMessage({
            "target": "contentscript",
            "data":{
                "to" : dappAddress,
                "value" : "0",
                "contract" : {
                    "function" : "query_fund_sum",
                    "args" : JSON.stringify(req_args)
                }
            },
            "method": "neb_call"
        }, "*");
    },
    showFundList:function(page){
        var req_args = [];
        req_args.push(page);
        window.postMessage({
            "target": "contentscript",
            "data":{
                "to" : dappAddress,
                "value" : "0",
                "contract" : {
                    "function" : "query_fund_by_page",
                    "args" : JSON.stringify(req_args)
                }
            },
            "method": "neb_call"
        }, "*");
    },
    listenWindowMessage: function() {
        var self = this;
        window.addEventListener('message', function(e) {
            if(e.data && e.data.data && e.data.data.neb_call) {

                if(e.data.data.neb_call.result) {
                    var obj = JSON.parse(e.data.data.neb_call.result);
                    if (obj.type == "fund_list") {
                        self.parseFundInfo(obj);
                    } else if (obj.type == "fund_sum") {
                        self.parseFundSum(obj);
                    } else {
                        console.log("no need attation");
                    }
                    console.log(obj);
                } else {
                    console.log("Access denied");
                }
            }
        });
    },

    parseFundInfo: function(fund_list) {
        if (fund_list.data.length == 0) {
            $("#loading_page").hide();
            $("#fund_list").hide();
            $("#fund_warning").show();
        } else {
            $("#loading_page").hide();
            $("#main_page").show();


            $("#fund_warning").hide();
            $("#fund_list").empty().show();

            var funds = template(document.getElementById('fund_list_t').innerHTML);
            var fund_html = funds({list: fund_list.data});
            $("#fund_list").append(fund_html);
        }



    },
    parseFundSum: function(obj) {
        paginationObj.init(obj.sum);
        paginationObj.showPagination();
    },
}

var fundObj=new FundShow();

function checkNebpay() {
    console.log("check nebpay")
    try{
        var NebPay = require("nebpay");
    }catch(e){
        //alert ("Extension wallet is not installed, please install it first.")
        console.log("no nebpay");
        $("#noExtension").removeClass("hide")
    }


    fundObj = new FundShow();
    fundObj.listenWindowMessage();
    fundObj.init();

}



function initPage() {
    document.addEventListener("DOMContentLoaded", function() {
        $("#fund_warning").hide();
        $("#main_page").hide();
        $("#loading_page").show();
        console.log("web page loaded...");
        setTimeout(checkNebpay,1000);
    });
}

initPage();

var SHOW_NUM_PER_PAGE = 12;

var Pagination = function() {
    this.list_index = [];
    this.page_size = SHOW_NUM_PER_PAGE;
    this.showGoInput = true;
    this.showGoButton = true;
};

Pagination.prototype = {

    init: function(totalNum) {
        this.list_index=[];
        for(var i = 1; i <= totalNum; i++) {
            this.list_index.push(i);
        }
    },


    showPagination: function() {
        var self = this;
        $('#pagination').pagination({
            dataSource: this.list_index,
            pageSize: this.page_size,
            showGoInput: true,
            showGoButton: true,
            callback: function(data, pagination) {
                var click_page_num = pagination.pageNumber;
                var list_offset = data[0];
                self.onChoosePageEvent(click_page_num, list_offset);
            }
        });
    },


    onChoosePageEvent: function(click_page_num, list_offset) {
        console.log("click_page_num = " + click_page_num + "; list_offset=" + list_offset);
        var page={
            "pageSize":this.page_size,
            "pageNum":click_page_num
        };
        fundObj.showFundList(page);
    },
}

var paginationObj = new Pagination();
