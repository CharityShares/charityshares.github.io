"use strict";



var FundEntity = function(text) {
  if (text) {
    var obj = JSON.parse(text);
    this.name = obj.name;
    this.idea = obj.idea;
    this.from = obj.from;
    this.key = obj.key;



  } else {
    this.name = "";
    this.idea = "";
    this.from = "";
    this.key = "";

  }
};
FundEntity.prototype = {
  toString: function() {
    return JSON.stringify(this);
  }
};
var CharityShare = function() {
  LocalContractStorage.defineMapProperty(this, "funds", {
    parse: function(text) {
      return new FundEntity(text);
    },
    stringify: function(o) {
      return o.toString();
    }
  });
  LocalContractStorage.defineMapProperty(this, "names");
  LocalContractStorage.defineProperty(this, "fund_list_size");
  LocalContractStorage.defineMapProperty(this, "fund_array");
  LocalContractStorage.defineMapProperty(this, "addrs");


};


CharityShare.prototype = {
  init: function() {
    if (this.fund_list_size == null) {
      this.fund_list_size = 0;
    }
  },


  _validateData: function(name) {

    if (name === "") {
      throw new Error("empty field / value");
    }


    if (name.length > 64) {
      throw new Error("Invalid length. Max name length 64 and 250 for desription");
    }

    return true;
  },

  _isEmpty: function() {
    var incomingPayment = Blockchain.transaction.value;
    if (incomingPayment.eq(0)) {
      return true;
    } else {
      return false;
    }
  },

  cN: function(name) {
    return this.names.get(name);

  },

  save: function(text) {
    var checker = {
      "success": true,
      "message": "Fund will be successfully created in one block confirmation! Be sure to set transaction value to 0!"
    };
    if (!this._isEmpty()) {
      throw new Error("It is free to create a fund. Please set transaction value to 0");
    }

    var obj = text;
    var addr = Blockchain.transaction.from;

    obj.name = obj.name.trim();
    obj.key = obj.key.trim();
    obj.name = obj.name.toLowerCase();
    obj.from = addr;
    this._validateData(obj.name);
    if (obj.idea.length > 250) {
      throw new Error("Invalid length. Max length for description is 250 symbols");
    }
    if (this.addrs.get(addr)) {
      throw new Error("Sorry, you can create only one charity Fund!");
    }
    if (this.names.get(obj.name)) {
      throw new Error("Fund name is already reserved. Try another one!");
    }


    this.names.put(obj.name, obj.from);
    this.addrs.put(obj.from, obj.name);
    var fund = new FundEntity();
    fund.name = obj.name;
    fund.from = obj.from;
    fund.idea = obj.idea;

    fund.key = obj.key;


    var index = this.fund_list_size;
    this.fund_array.put(index, fund.key);

    this.funds.put(fund.key, fund);
    this.fund_list_size += 1;

    return checker;

  },
  send: function() {

    var len = arguments.length;
    var ammount = Blockchain.transaction.value;
    var from = Blockchain.transaction.from;
    var counter = 0;
    var counter2 = 0;
    for (var j = 0; j < len; j += 1) {
      arguments[j] = arguments[j].trim();
      arguments[j] = arguments[j].toLowerCase();
      if (this.names.get(arguments[j])) {
        counter += 1;
      }
      counter2 += 1;
    }

    if (!(counter === counter2)) {
      Blockchain.transfer(from, ammount);
      throw new Error("Transaction failed. Be sure to enter valid Fund names!");
      
    }
    for (var i = 0; i < len; i += 1) {
      arguments[i] = arguments[i].trim();
      arguments[i] = arguments[i].toLowerCase();
      var wallet = this.names.get(arguments[i]);

      var result = Blockchain.transfer(wallet, ammount / len);

    }

    return {
      "success": true,
      "message": "The money has been transferred!"
    }

  },

  query_fund_by_page: function(page) {
    var result = {
      success: false,
      type: "fund_list",
      data: [],
      sum: 0
    };
    var pageNum = 1;
    var pageSize = 10;
    if (page != undefined && page != null) {
      if (page.pageNum != undefined && page.pageNum != null) {
        pageNum = page.pageNum;
      }
      if (page.pageSize != undefined && page.pageSize != null) {
        pageSize = page.pageSize;
      }
    }
    var number = this.fund_list_size;
    result.sum = number;
    var key;
    var fund;
    for (var i = (pageNum - 1) * pageSize; i < number && i < (pageNum * pageSize); i++) {
      key = this.fund_array.get(number - i - 1);
      fund = this.funds.get(key);

      var temp = {
        key: fund.key,
        name: fund.name,
        idea: fund.idea,

      };

      result.data.push(temp);
    }
    if (result.data === "") {
      result.success = false;
    } else {
      result.success = true;
    }
    return result;
  },
  query_fund_sum: function() {
    var result = {
      success: false,
      type: "fund_sum",
      sum: 0
    };
    result.sum = this.fund_list_size;
    result.success = true;
    return result;
  },



  fund_list_size: function() {
    return this.fund_list_size;
  }
}

module.exports = CharityShare;
