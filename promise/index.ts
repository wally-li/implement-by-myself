/*
 * @Description: implement Promise by myself.
 */
enum PromiseStateType {
  pending = "pending",
  fulfilled = "fulfilled",
  rejected = "rejected",
}
const isBrowser = typeof window !== "undefined" ? true : false;
//模拟微任务
function simulateMicroTask(callback: () => void): void {
  //浏览器环境 使用MutationObserver模拟微任务
  if (isBrowser) {
    let counter = 1;
    const textNode = document.createTextNode(String(counter));
    const mutationInstance = new MutationObserver(callback);
    mutationInstance.observe(textNode, {
      characterData: true,
    });
    textNode.data = String(counter + 1);
  }
  //node环境 使用 process.nextTick模拟微任务
  else {
    //@ts-ignore
    process.nextTick(() => {
      callback();
    });
  }
}
function onceCall(
  resolve: (value: unknown) => void,
  reject: (reason: unknown) => void
): {
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
} {
  let called = false;
  return {
    resolve(vlaue) {
      if (!called) {
        called = true;
        resolve(vlaue);
      }
    },
    reject(reason) {
      if (!called) {
        called = true;
        reject(reason);
      }
    },
  };
}
//@ts-ignore
class Promise {
  //Promise实例的状态。对应ECMAScript中的Promise实例的内部属性：[[PromiseState]]
  private state: PromiseStateType = PromiseStateType.pending;
  //履行Promise时的value。
  private value: any = undefined;
  //履行Promise时的reason。
  private reason: any = undefined;
  //二者共同组成了ECMAScript中的Promise实例的内部属性：[[PromiseResult]]

  //用于存放fulfilled的回调函数
  private onFulfilledCallbacks: Array<() => void> = [];
  //用于存放rejected的回调函数
  private onRejectedCallbacks: Array<() => void> = [];
  constructor(
    executor: (
      resolve: (value: unknown) => void,
      reject: (reason: unknown) => void
    ) => void
  ) {
    let realResolve: (value: unknown) => void = (value: any) => {
      //情况一
      if (this === value) {
        return realReject(
          new TypeError("Chaining cycle detected for promise #<Promise>")
        );
      } else if (
        (typeof value === "object" && value !== null) ||
        typeof value === "function"
      ) {
        try {
          let then = value.then;
          if (typeof then === "function") {
            const { resolve, reject } = onceCall(realResolve, realReject);
            try {
              return then.call(value, resolve, reject);
            } catch (err) {
              return reject(err);
            }
          }
        } catch (err) {
          realReject(err);
        }
      }
      //调用resolve后，将Promise的状态改为fulfilled，Promise的结果记为value.
      if (this.state === PromiseStateType.pending) {
        this.state = PromiseStateType.fulfilled;
        this.value = value;
        simulateMicroTask(() => {
          for (
            let index = 0;
            index < this.onFulfilledCallbacks.length;
            index++
          ) {
            this.onFulfilledCallbacks[index]();
          }
        });
      }
    };
    let realReject: (reason: unknown) => void = (reason: any) => {
      //调用resolve后，将Promise的状态改为rejected，Promise的拒绝原因记为reason.
      if (this.state === PromiseStateType.pending) {
        this.state = PromiseStateType.rejected;
        this.reason = reason;
        simulateMicroTask(() => {
          for (
            let index = 0;
            index < this.onRejectedCallbacks.length;
            index++
          ) {
            this.onRejectedCallbacks[index]();
          }
        });
      }
    };
    const { resolve, reject } = onceCall(realResolve, realReject);
    if (typeof executor === "function") {
      try {
        executor(resolve, reject);
      } catch (err) {
        reject(err);
      }
    }
  }

  then(onFulfilled?: (value?: any) => any, onRejected?: (reason?: any) => any) {
    return new Promise((resolve, reject) => {
      onFulfilled =
        typeof onFulfilled === "function" ? onFulfilled : (value) => value;
      onRejected =
        typeof onRejected === "function"
          ? onRejected
          : (reason) => {
              throw reason;
            };
      if (this.state === PromiseStateType.fulfilled) {
        simulateMicroTask(() => {
          try {
            resolve(onFulfilled!(this.value));
          } catch (err) {
            reject(err);
          }
        });
      } else if (this.state === PromiseStateType.rejected) {
        simulateMicroTask(() => {
          try {
            resolve(onRejected!(this.reason));
          } catch (err) {
            reject(err);
          }
        });
      } else {
        this.onFulfilledCallbacks.push(() => {
          try {
            resolve(onFulfilled!(this.value));
          } catch (err) {
            reject(err);
          }
        });
        this.onRejectedCallbacks.push(() => {
          try {
            resolve(onRejected!(this.reason));
          } catch (err) {
            reject(err);
          }
        });
      }
    });
  }
}
//@ts-ignore
Promise.defer = Promise.deferred = function () {
  let dfd = {};
  //@ts-ignore
  dfd.promise = new Promise((resolve, reject) => {
    //@ts-ignore
    dfd.resolve = resolve;
    //@ts-ignore
    dfd.reject = reject;
  });
  return dfd;
};
//@ts-ignore
module.exports = Promise;
