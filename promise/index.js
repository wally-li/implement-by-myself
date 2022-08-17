/*
 * @Description: implement Promise by myself.
 */
var PromiseStateType;
(function (PromiseStateType) {
    PromiseStateType["pending"] = "pending";
    PromiseStateType["fulfilled"] = "fulfilled";
    PromiseStateType["rejected"] = "rejected";
})(PromiseStateType || (PromiseStateType = {}));
//@ts-ignore
var Promise = /** @class */ (function () {
    //二者共同组成了ECMAScript中的Promise实例的内部属性：[[PromiseResult]]
    function Promise(executor) {
        var _this = this;
        //Promise实例的状态。对应ECMAScript中的Promise实例的内部属性：[[PromiseState]]
        this.state = PromiseStateType.pending;
        //履行Promise时的value。
        this.value = undefined;
        //履行Promise时的reason。
        this.reason = undefined;
        var resolve = function (value) {
            //调用resolve后，将Promise的状态改为fulfilled，Promise的结果记为value.
            if (_this.state === PromiseStateType.pending) {
                _this.state = PromiseStateType.fulfilled;
                _this.value = value;
            }
        };
        var reject = function (reason) {
            //调用resolve后，将Promise的状态改为rejected，Promise的拒绝原因记为reason.
            if (_this.state === PromiseStateType.pending) {
                _this.state = PromiseStateType.rejected;
                _this.reason = reason;
            }
        };
        if (typeof executor === "function") {
            try {
                executor(resolve, reject);
            } catch (err) {
                reject(err);
            }
        }
    }
    return Promise;
}());
//测试用例
let p1 = new Promise(resolve => {
    resolve(1);
});
let p2 = new Promise((resolve, reject) => {
    reject(1);
});
let p3 = new Promise((resolve, reject) => {});
console.log(p1, p2, p3);