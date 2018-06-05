

'use strict';

var dappAddress = "n1inc1vtdDgxidis9ZubEC3EwXEs9WaqhBf";

var InputFund = function() {

}
InputFund.prototype = {

    init: function() {
        var self = this;
        $("#submit").click(function() {
            self.commitFund();
        });
    },

    commitFund: function() {

        var fund_downloadUrl = $("#fund_downloadUrl").val();
        var fund_name = $("#fund_name").val();
        var fund_description = $("#fund_description").val();

        if(fund_name == "") {
            warning_note = "Fill all fields";
            $("#fund_input_warning").html(warning_note);
            $("#fund_input_warning").show();

            return;
        }
        if(fund_description == "") {
            warning_note = "Fill all fields";
            $("#fund_input_warning").html(warning_note);
            $("#fund_input_warning").show();

            return;

        }



        var func = "save";
        var req_arg_item = {
            "name": fund_name,
            "idea": fund_description,
            "key": fund_downloadUrl

        };
        var req_args = [];
        req_args.push(req_arg_item);

        window.postMessage({
            "target": "contentscript",
            "data":{
                "to" : dappAddress,
                "value" : "0",
                "contract" : {
                    "function" : func,
                    "args" : JSON.stringify(req_args),
                }
            },
            "method": "neb_sendTransaction"
        }, "*");
        window.postMessage({
            "target": "contentscript",
            "data":{
                "to" : dappAddress,
                "value" : "0",
                "contract" : {
                    "function" : func,
                    "args" : JSON.stringify(req_args),
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
                    console.log(obj);
                    if(obj.success==true){

                        alert(obj.message);
                    }
                 else {
                  alert(obj.message);
                }
            }
      }  });
    },

}

var inputFundObj;

function checkNebpay() {
    console.log("check nebpay")
    try{
        var NebPay = require("nebpay");
    }catch(e){

        console.log("no nebpay");
        $("#noExtension").removeClass("hide")
    }


    inputFundObj = new InputFund();
    inputFundObj.init();
    inputFundObj.listenWindowMessage();
}



function initPage() {

    document.addEventListener("DOMContentLoaded", function() {
        console.log("web page loaded...");


        setTimeout(checkNebpay,1000);
    });
}

initPage();
