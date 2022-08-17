/*
 * @Description: implement Promise by myself.
 */
enum PromiseStateType {
  pending = "pending",
  fulfilled = "fulfilled",
  rejected = "rejected",
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
  constructor(
    executor: (
      resolve: (value: unknown) => void,
      reject: (reason: unknown) => void
    ) => void
  ) {
    let resolve: (value: unknown) => void = (value: any) => {
      //调用resolve后，将Promise的状态改为fulfilled，Promise的结果记为value.
      if (this.state === PromiseStateType.pending) {
        this.state = PromiseStateType.fulfilled;
        this.value = value;
      }
    };
    let reject: (reason: unknown) => void = (reason: any) => {
      //调用resolve后，将Promise的状态改为rejected，Promise的拒绝原因记为reason.
      if (this.state === PromiseStateType.pending) {
        this.state = PromiseStateType.rejected;
        this.reason = reason;
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
}
