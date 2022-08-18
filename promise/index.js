/*
 * @Description: implement Promise by myself.
 */
var PromiseStateType;
(function (PromiseStateType) {
    PromiseStateType["pending"] = "pending";
    PromiseStateType["fulfilled"] = "fulfilled";
    PromiseStateType["rejected"] = "rejected";
})(PromiseStateType || (PromiseStateType = {}));
var isBrowser = typeof window !== "undefined" ? true : false;
//模拟微任务
function simulateMicroTask(callback) {
    //浏览器环境 使用MutationObserver模拟微任务
    if (isBrowser) {
        var counter = 1;
        var textNode = document.createTextNode(String(counter));
        var mutationInstance = new MutationObserver(callback);
        mutationInstance.observe(textNode, {
            characterData: true
        });
        textNode.data = String(counter + 1);
    }
    //node环境 使用 process.nextTick模拟微任务
    else {
        //@ts-ignore
        process.nextTick(function () {
            callback();
        });
    }
}

function onceCall(resolve, reject) {
    var called = false;
    return {
        resolve: function (vlaue) {
            if (!called) {
                called = true;
                resolve(vlaue);
            }
        },
        reject: function (reason) {
            if (!called) {
                called = true;
                reject(reason);
            }
        }
    };
}
//@ts-ignore
var Promise = /** @class */ (function () {
    function Promise(executor) {
        var _this = this;
        //Promise实例的状态。对应ECMAScript中的Promise实例的内部属性：[[PromiseState]]
        this.state = PromiseStateType.pending;
        //履行Promise时的value。
        this.value = undefined;
        //履行Promise时的reason。
        this.reason = undefined;
        //二者共同组成了ECMAScript中的Promise实例的内部属性：[[PromiseResult]]
        //用于存放fulfilled的回调函数
        this.onFulfilledCallbacks = [];
        //用于存放rejected的回调函数
        this.onRejectedCallbacks = [];
        var realResolve = function (value) {
            //情况一
            if (_this === value) {
                return realReject(new TypeError("Chaining cycle detected for promise #<Promise>"));
            } else if ((typeof value === "object" && value !== null) ||
                typeof value === "function") {
                try {
                    var then = value.then;
                    if (typeof then === "function") {
                        var _a = onceCall(realResolve, realReject),
                            resolve_1 = _a.resolve,
                            reject_1 = _a.reject;
                        try {
                            return then.call(value, resolve_1, reject_1);
                        } catch (err) {
                            return reject_1(err);
                        }
                    }
                } catch (err) {
                    realReject(err);
                }
            }
            //调用resolve后，将Promise的状态改为fulfilled，Promise的结果记为value.
            if (_this.state === PromiseStateType.pending) {
                _this.state = PromiseStateType.fulfilled;
                _this.value = value;
                simulateMicroTask(function () {
                    for (var index = 0; index < _this.onFulfilledCallbacks.length; index++) {
                        _this.onFulfilledCallbacks[index]();
                    }
                });
            }
        };
        var realReject = function (reason) {
            //调用resolve后，将Promise的状态改为rejected，Promise的拒绝原因记为reason.
            if (_this.state === PromiseStateType.pending) {
                _this.state = PromiseStateType.rejected;
                _this.reason = reason;
                simulateMicroTask(function () {
                    for (var index = 0; index < _this.onRejectedCallbacks.length; index++) {
                        _this.onRejectedCallbacks[index]();
                    }
                });
            }
        };
        var _a = onceCall(realResolve, realReject),
            resolve = _a.resolve,
            reject = _a.reject;
        if (typeof executor === "function") {
            try {
                executor(resolve, reject);
            } catch (err) {
                reject(err);
            }
        }
    }
    Promise.prototype.then = function (onFulfilled, onRejected) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            onFulfilled =
                typeof onFulfilled === "function" ? onFulfilled : function (value) {
                    return value;
                };
            onRejected =
                typeof onRejected === "function" ?
                onRejected :
                function (reason) {
                    throw reason;
                };
            if (_this.state === PromiseStateType.fulfilled) {
                simulateMicroTask(function () {
                    try {
                        resolve(onFulfilled(_this.value));
                    } catch (err) {
                        reject(err);
                    }
                });
            } else if (_this.state === PromiseStateType.rejected) {
                simulateMicroTask(function () {
                    try {
                        resolve(onRejected(_this.reason));
                    } catch (err) {
                        reject(err);
                    }
                });
            } else {
                _this.onFulfilledCallbacks.push(function () {
                    try {
                        resolve(onFulfilled(_this.value));
                    } catch (err) {
                        reject(err);
                    }
                });
                _this.onRejectedCallbacks.push(function () {
                    try {
                        resolve(onRejected(_this.reason));
                    } catch (err) {
                        reject(err);
                    }
                });
            }
        });
    };
    return Promise;
}());
//@ts-ignore
Promise.defer = Promise.deferred = function () {
    var dfd = {};
    //@ts-ignore
    dfd.promise = new Promise(function (resolve, reject) {
        //@ts-ignore
        dfd.resolve = resolve;
        //@ts-ignore
        dfd.reject = reject;
    });
    return dfd;
};
//@ts-ignore
module.exports = Promise;