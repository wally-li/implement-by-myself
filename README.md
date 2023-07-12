<a name="yebx1"></a>
# 概述
现如今，`Promise`可谓大行其道。如果不太理解`Promise`的相关特性，你很难阅读别人的代码，也无法优雅的进行异步编程。
<a name="LtOL0"></a>
# Promise的历史渊源
其实`Promise`的概念很早就诞生了，甚至比`javascript`年纪还大。在`javascript`中，最早的`Promise`机制出现在`JQuery`中，但是还没形成相关规范。后来`CommonJS`制定的`Promise/A`规范日渐流行。到了2012年，`Promise/A+`组织制定了同名的`Promise`规范：`Promise/A+`规范。`ECMAScript`规范中关于`Promise`的内容遵循的就是`Promise/A+`规范。<br />**所以，我们就按照**`**Promise/A+**`**规范，来实现我们自定义的**`**Promise**`**。如果我们能通过**`**Promise/A+**`**规范提供的测试用例，则说明，我们自定义的**`**Promise**`**也成为了**`**Promise/A+**`**规范的一种实现。**
<a name="yfSoC"></a>
## 什么是`Promise/A+`规范
所谓规范，实际上是一个指南，指导你如何实现。所以说他并不是具体的实现代码。这个规范其实不算长，所以值得大家一读，可以让我们对`ECMAScript`中的`Promise`有更深层次的理解。
<a name="Nbw3o"></a>
# Promise主要解决了什么问题
以往的异步编程，为了获取到异步任务的结果，我们通常是使用回调函数的形式。当异步任务有了结果，就调用这个函数将异步任务的结果交给回调函数进行处理。**但是如果异步任务嵌套过多，就会造成回调地狱的情况。非常不利于代码的阅读和维护。**<br />`Promise`就是用来解决这个问题的，通过`Promise`的链式调用，我们可以优雅的进行异步编程。将嵌套过多的回调函数扁平化，链路化。
<a name="AWXju"></a>
# 手写`Promise`
手写`Promise`至少需要我们对`Promise`展现的特性有足够多的了解，只有充分的了解，才能更好的实现它。经历这个过程，你至少能有以下收获：
:::info

1. **为什么**`**Promise**`**可以进行链式调用。**
1. **为什么**`**Promise**`**可以异常穿透。**
1. **为什么传递给**`**then**`**的参数会是异步任务。**
1. `**Promise.all**`**，**`**Promise.race**`**是如何实现的。**

**.....**
:::
接下来，让我们来严格按照`Promise/A+`规范来实现我们自己的`Promise`。
<a name="kyqS9"></a>
## 实现一个最基本的`Promise`类
我们知道，`Promise`是一个类，用来创建一个`Promise`实例。我们需要传递一个执行器函数。
```javascript
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
        //执行器函数是同步执行的。
        executor(resolve, reject);
      } catch (err) {
        reject(err);
      }
    }
  }
}

```
看懂这里，你至少需掌握了以下的知识点：(规范中均有提及)
:::info

1. `Promise`实例存在三种状态：`pending`(初始态)，`fulfilled`和`rejected`。一个实例只能进行一次状态变更：要么是从`pending`到`fulfilled`，要么是从`pending`到`rejected`.
1. `value`代表履行`Promise`(承诺或期约)的结果，当状态从`pending`到`fulfilled`时进行填充。

`reason`代表拒绝`Promise`的原因，当状态从`pending`到`rejected`时进行答复。二者其实就构成了`ECMAScript`中`Promise`实例中的内部属性`[[PromiseResult]]`的值。

3. **创建实例的时候，需要传递一个函数，我们称为执行器函数。这个函数存在两个形式参数，并且这两个形式参数也是函数，形式参数对应的实际参数是**`**Promise**`**内部提供的，交由你去调用，这两个函数一个叫**`**resolve**`**，用来将**`**Promise**`**的状态转为**`**fulfilled**`**，并填充结果**`**value**`**。一个叫**`**reject**`**，用来将**`**Promise**`**的状态转为**`**rejected**`**，并答复原因**`**reject**`**。**
3. 并且执行器函数`executor`的调用是在`constructor`中进行的。所以执行器函数是同步执行的。
3. 当执行器函数执行过程中，主动抛出了错误，这个时候应该返回一个失败的`Promise`实例，并且`reason`应该为抛出的错误`err`。所以，我这里使用了一个`try...catch`的结构进行包裹，进行错误的捕获工作。
:::
<a name="x17iF"></a>
### 测试一下
```javascript
let p1 = new Promise(resolve => {
  resolve(1);
});
let p2 = new Promise((resolve, reject) => {
  reject(1);
});
let p3 = new Promise((resolve, reject) => {});
```
![image.png](https://cdn.nlark.com/yuque/0/2022/png/25896210/1660734142526-14c02408-03cc-4a02-8f42-d8eeafdeb7dc.png#clientId=u3ce54ed1-6d8d-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=173&id=uc20ef214&margin=%5Bobject%20Object%5D&name=image.png&originHeight=346&originWidth=1850&originalType=binary&ratio=1&rotation=0&showTitle=false&size=101510&status=done&style=shadow&taskId=ua02591fb-497f-4835-8e36-321ea305a56&title=&width=925)<br />目前来讲，我们已经完成了我们第一个小目标，完成了`Promise`类的大致流程的搭建。
<a name="Ew69M"></a>
## 实现基本态`then`方法
`then`方法可以说是`Promise`链式调用的灵魂，其他方法如`catch`，`finally`都是`then`方法的变种。
```javascript
  then(onFulfilled?: (value?: any) => any, onRejected?: (reason?: any) => any) {
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
        onFulfilled!(this.value);
      });
    } else if (this.state === PromiseStateType.rejected) {
      simulateMicroTask(() => {
        onRejected!(this.reason);
      });
    } else {
      this.onFulfilledCallbacks.push(() => {
        onFulfilled!(this.value);
      });
      this.onRejectedCallbacks.push(() => {
        onRejected!(this.reason);
      });
    }
  }
```
我们知道，`then`方法可以接收两个参数，都是函数：

1. 一个是`fulfilled`状态下的回调函数`onFulfilled`，它接收`fulfilled`状态下的结果，也就是我们前面提到的`value`。
1. 一个是`rejected`状态下的回调函数`onRejected`， 它接收`rejected`状态下的原因，也就是我们前面提到的`reason`。
:::tips
注意千万不要和`resolve`，`reject`这两个函数弄混了。他们四个函数长得确实有点像。因为存在一定的关联性。<br />但是`onFulfilled`和`onRejected`是用于是状态变更下的回调。<br />而`resolve`，`reject`是用于变更状态。
:::
有了这点知识，我们再来回顾上面的代码，首先，我们对传入的参数进行了一个预处理：
```javascript
//当不是函数时，初始化为(value) => value
onFulfilled =
  typeof onFulfilled === "function" ? onFulfilled : (value) => value;
//当不是函数时，初始化为(reason) => { throw reason; }
onRejected =
  typeof onRejected === "function"
  ? onRejected
  : (reason) => {
    throw reason;
  };
```
**可别小看这两行初始化的代码：**<br />**对**`**onFulfilled**`**的初始化是当**`**then**`**方法无实参传入，或者实参不是函数情况的处理。**<br />**对**`**onRejected**`**的初始化是Promise能进行异常穿透的根本原因！**<br />对于这两句话的理解可能还得结合后面的处理。但是我们可以先举两个小🌰：
```javascript
//在浏览器中，这样也会返回一个fulfilled状态的Promise实例。
Promise.resolve(1).then();
//Promise的链式调用中，我们往往只需要在最后面进行异常的捕获(catch)就行了。这也就是我们常说的异常穿透机制。
//这个就是因为我们对onRejected的处理。
Promise.reject(1).then(() => {}).then(() => {}).then(() => {}).catch(() => {})
```

---

下面的一系列`if/else`的逻辑无非在表达三件事：
:::info

1. **当我们调用**`**then**`**方法时，**`**Promise**`**实例已经是**`**fulfill**`**状态的时候，我们是不是直接调用**`**onFulfill**`**函数就行了。**
1. **当我们调用**`**then**`**方法时，**`**Promise**`**实例已经是**`**reject**`**状态的时候，我们是不是直接调用**`**onReject**`**函数就行了。**
1. **当我们调用**`**pending**`**时，**`**Promise**`**实例仍是**`**pending**`**的时候，我们是不是应该把回调函数都存起来在状态变更的时候，再进行调用呢！**
:::
上面三句话，可以说是`Promise`的精髓之一了。这是一定要弄懂的。但是我们还有着些许的疑问：
<a name="zoSHG"></a>
### 疑问一：simulateMicroTask是什么
在调用`onFulfilled`和`onRejected`的时候，我们使用这个`simulateMicroTask`函数进行了包裹。这是为了符合规范中，`onFulfilled`和`onRejected`属于异步任务的要求。当然规范其实并未限制异步任务是宏任务还是微任务。我们可以使用`setTimeout`这类宏任务来实现它，也能使用`MutationObserver`这类微任务来实现它。**在这里，我采用的是在浏览器环境，使用**`**MutationObserver**`**来实现，因为**`**ECMAScript**`**中的**`**Promise**`**的回调函数就是表现为微任务的。在**`**node**`**环境是用的是**`**process.nextTick**`**。**
```javascript
const isBrowser = typeof window !== "undefined" ? true : false;
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
```
<a name="pQfyS"></a>
### 疑问二：pending状态时，回调函数保存到哪里
`pending`状态时，我们需要保存回调函数。那我们应该保存在哪里呢？<br />**答：保存在实例对象上。**<br />所以我们需要在上面的构造函数中新增两行代码：<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/25896210/1660744993649-e085eb51-0031-41ed-8ffb-47eb44bc1af7.png#clientId=u541f7aa6-83f2-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=137&id=u0c82b921&margin=%5Bobject%20Object%5D&name=image.png&originHeight=274&originWidth=1296&originalType=binary&ratio=1&rotation=0&showTitle=false&size=76280&status=done&style=shadow&taskId=u5aa6ccf9-8ba3-44d2-be50-e1baae492ad&title=&width=648)
<a name="rjxaN"></a>
### 疑问三，保存的回调函数数组的执行时机在何时
**状态变更之时，便是我们回调函数执行之日。**<br />那我们会在哪里改变状态呢？<br />答：`resolve`和`reject`中。<br />所以我们需要重新修改下`resolve`和`reject`的代码：<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/25896210/1660804686344-7b0710e7-a497-44bf-8616-867c16afdf56.png#clientId=u150add28-6b50-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=506&id=u531eca71&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1012&originWidth=1506&originalType=binary&ratio=1&rotation=0&showTitle=false&size=141667&status=done&style=shadow&taskId=ua6186fb2-1a16-4ed5-bcef-4a768f7fff1&title=&width=753)至此，我们已经实现了基本态的`Promise`。
<a name="VnQSR"></a>
## 实现进化态`then`方法
进化态`then`方法，主要目标是实现`Promise`的链式调用。首先，小问一个问题：为什么`Promise`可以进行链式调用？<br />**原因很简单，就是因为**`**Promise.then**`**方法本身会返回一个**`**Promise**`**实例，这个**`**Promise**`**实例的状态和结果跟回调函数**`**onResolve**`**和**`**onRejected**`**的执行情况息息相关。**<br />**根据我们上面所描述的，我们重新设计一下**`**then**`**方法：**<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/25896210/1660745991349-1764c955-4e14-4525-bd9e-2f3b39c81e03.png#clientId=u541f7aa6-83f2-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=865&id=u8ccd6d2d&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1730&originWidth=1518&originalType=binary&ratio=1&rotation=0&showTitle=false&size=243027&status=done&style=shadow&taskId=ucef19d4d-eb15-4ad2-b4b4-f71da8d0d00&title=&width=759)<br />这个地方就是定义`then`方法会返回一个`Promise`实例。实例的结果和状态取决于回调函数的执行情况。图中有四个回调函数的调用都被`try...catch`结构所包裹。这是因为规范规定：**如果回调函数调用过程中，抛出错误，就应该返回失败的**`**Promise**`**，失败原因为抛出的错误。**<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/25896210/1660746469962-9f19fc29-1e53-4d2d-ba13-100e55d2183e.png#clientId=u541f7aa6-83f2-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=45&id=ue950f16d&margin=%5Bobject%20Object%5D&name=image.png&originHeight=90&originWidth=1536&originalType=binary&ratio=1&rotation=0&showTitle=false&size=32619&status=done&style=shadow&taskId=u1d160490-a384-4d78-9a2f-fc26dc93641&title=&width=768)<br />当回调函数正常执行时，应该以回调函数的返回值作为`resolve`函数的实参，也就是作为`Promise`实例的结果`value`。<br />举个🌰：
```javascript
new Promise((resolve, reject) => {
  resolve(1);
}).then(res => {
  return 2;
});
//这个链式调用的最终结果是返回一个成功的Promise实例，并且成功的结果是2.
```
<a name="Qysae"></a>
## 实现究极形态then方法（实则优化`resolve`方法）
> 首先说，这段逻辑属于Promise中很绕的一部分，所以很多东西只可意会不可言传。建议先多看规范。

现在我们可以已经可以实现`Promise`的链式调用了。但是还存在一个严重的问题：
```javascript
new Promise((resolve, reject) => {
  resolve(1);
}).then(() => {
  return new Promise((resolve, reject) => {
  resolve(1);
});
})
```
当我们的回调函数`onReject`和`onFulfilled`返回一个`Promise`实例的时候：现在我们的`Promise`实现方案会将这个`Promise`作为`then`方法返回的`Promise`实例的`value`值。但是实际上，规范中其实对这种情况有所描述：<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/25896210/1660750135830-ca5d615d-78a5-4d31-be7e-207d5b0ec709.png#clientId=u541f7aa6-83f2-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=49&id=uc18f25c1&margin=%5Bobject%20Object%5D&name=image.png&originHeight=98&originWidth=1584&originalType=binary&ratio=1&rotation=0&showTitle=false&size=33981&status=done&style=shadow&taskId=u21fcf147-d1b9-4d3f-b942-0b54ed4bc38&title=&width=792)

---

这个地方我有必要说明一下，这个地方我没有按照规范的逻辑逻辑走（**规范并没有说直接对回调函数的执行结果调用**`**resolve**`**方法，这是我自己的思路。**）。首先说规范的思路：

1. 拿到回调函数`onReject`和`onFulfilled`的返回值`x`.
1. 拿到`x`的值，执行这个方法：`**[[Resolve]](promise2, x)**`。这个方法是一个伪方法。也就是说他没有具体的实现代码，只提供思路。
1. 这个伪方法其实很简单，就是对回调函数的返回值进行分类讨论：

![image.png](https://cdn.nlark.com/yuque/0/2022/png/25896210/1660750376811-93eaff05-8f91-4ed5-b652-3a22dde8cb46.png#clientId=u541f7aa6-83f2-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=693&id=u871b4eb1&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1386&originWidth=1748&originalType=binary&ratio=1&rotation=0&showTitle=false&size=482548&status=done&style=shadow&taskId=ub5a999c0-26df-4854-b350-65f6d7344a9&title=&width=874)
:::info

1. 情况一，`promise`和`x`指向同一个对象的时候，报错，`promise`就是`then`方法的返回值。`x`就是回调函数的返回结果。两者一致时报错。这就是一种套娃的情况。我先表示一下什么情况下会出现这种情况：
:::
```javascript
let x = new Promise((resolve, reject) => {
  resolve(1);
}).then(() => x);
```
:::info

2. 情况二，当`x`是一个`Promise`对象的时候，应该以这个`Promise`对象的结果和状态作为最终`then`方法返回的`Promise`实例的结果和状态。
:::
:::info

3. 情况三，就比较饶了。当`return`的结果是一个`thenable`结构的时候。应该将`resolvePromise`方法和`rejectPromise`方法传递给它：
   1. 如果`rejectPromise`方法被调用，则`then`方法返回一个失败的`Promise`方法。
   1. 如果`resolvePromise`方法被调用，则对拿到的值又走一遍`[[Resolve]](promise2, x)`的逻辑。实际上是形成了一种递归调用。（这地方很绕很绕，一开始是懵的，是很正常的，因为我的表达能力有限。）
   1. 如果调用过程，报错，则`then`方法返回失败的`Promise`方法。
:::
thenable的含义这里出现了一个概念：`thenable`。所谓`thenable`的含义就是对象或者函数如果实现了`then`方法这个接口，就属于`thenable`。可见，`Promise`对象一定是`thenable`。
:::info

4. 情况四，如果`x`不属于上面的情况，则`then`方法以`x`为结果，返回成功的`Promise`实例。
:::

---

:::info
上面的逻辑，可以说很绕很绕。**但是我觉得上面只在做一件事儿：当返回值是**`**thenable**`**的时候（**`**Promise**`**也是**`**thenable**`**)，对其做解包。(请理解我这句话。)**<br />**我们要不断地取出**`**thenable**`**结构中的**`**then**`**方法的第一个参数(这个参数是个函数)，接收到的值，直到接收到的值不是一个**`**thenable**`**结构，则说明这个值是**`**then**`**方法返回的**`**Promise**`**实例的状态才会真正确定，并且**`**Promise**`**的结果正好该值。**
:::
举个🌰：
```javascript
new Promise((resolve, reject) => {
  resolve(1);
}).then(() => {
  return {
    then: (a) => {
      a({
        then: (a) => {
          a(1);
        } 
      }) 
    }
  }
})
```
这个`then`方法返回的`Promise`实例的最终结果`value`应该是`1`，看懂这个应该会对你理解上面描述的这个`[[Resolve]](promise2, x)`方法会有所帮助。

---

总而言之，`[[Resolve]](promise2, x)`在进行一个解包的操作。我现在按照它的思路来实现一下这个伪方法（我见网上也有人是这样写的）:
```javascript
then(onFulfilled?: (value?: any) => any, onRejected?: (reason?: any) => any) {
  ......
  let promise2 = new Promise((resolve, reject) => {
    if (this.state === PromiseStateType.fulfilled) {
      simulateMicroTask(() => {
        try {
          let x = (onFulfilled!(this.value));
          promiseResolutionProcedure(promise2, x, resolve, reject);
        } catch (err) {
          reject(err);
        }
      });
    } 
  });
  ......
}
//这个函数就是对那个[[Resolve]](promise2, x)伪方法的具体实现。网上别人的思路。
function promiseResolutionProcedure (promise2, x, resolve, reject) {
  if (promise2 === x) { 
    return reject(new TypeError('Chaining cycle detected for promise #<Promise>'))
  }
  let called;
  if ((typeof x === 'object' && x != null) || typeof x === 'function') { 
    try {
      let then = x.then;
      if (typeof then === 'function') { 
        then.call(x, y => { 
          if (called) return;
          called = true;
          resolvePromise(promise2, y, resolve, reject); 
        }, r => {
          if (called) return;
          called = true;
          reject(r);
        });
      } else {
        resolve(x);
      }
    } catch (e) {
      if (called) return;
      called = true;
      reject(e)
    }
  } else {
    resolve(x)
  }
}
```
但是，我们来思考一个问题，解包(自创的名词，规范中没有这个概念。)这个动作在这里做真的好吗。因为使用`Promise`的同学应该都知道，`resolve`函数也表现了解包这种行为：
```javascript
new Promise(resolve => {
  resolve(new Promise(resolve => resolve(1)))
})
```
![image.png](https://cdn.nlark.com/yuque/0/2022/png/25896210/1660753510525-b37021f1-4cc0-4856-bd82-6dfe93ecd841.png#clientId=u541f7aa6-83f2-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=63&id=uaabf6dae&margin=%5Bobject%20Object%5D&name=image.png&originHeight=126&originWidth=530&originalType=binary&ratio=1&rotation=0&showTitle=false&size=23705&status=done&style=shadow&taskId=u61ea800b-ba50-4028-a744-16f61f25f27&title=&width=265)<br />那我们为什么不把解包这个动作放到`resolve`函数中呢？所以我这样去实现它：
```javascript
//废弃
// try {
//   let x = (onFulfilled!(this.value));
//   promiseResolutionProcedure(promise2, x, resolve, reject);
// } catch (err) {
//   reject(err);
// }
//新方案
try {
  resolve(onFulfilled!(this.value));
} catch (err) {
  reject(err);
}
```
那现在我们需要在`resolve`中实现解包，所以我们不得不重新改造一下`resolve`函数的实现：<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/25896210/1660754591345-6492b8d2-5a57-4dda-ba40-79ceca8e95d0.png#clientId=u541f7aa6-83f2-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=541&id=u45a74a74&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1082&originWidth=1700&originalType=binary&ratio=1&rotation=0&showTitle=false&size=192169&status=done&style=shadow&taskId=u438cf1c4-2b70-4e4b-88de-82b79b26101&title=&width=850)
:::info

1. **这里，我十分巧妙的使用了**`**this**`**来处理了情况一，因为**`**constructor**`**中的**`**this**`**就是指向的构造出来的**`**Promise**`**实例。**
1. **第二点，同样也巧妙，我这里并没有对**`**Promise**`**和其他**`**thenable**`**结构进行区分，因为我认为所有**`**thenable**`**的解包逻辑是一样的，根本不存在任何区别。我的处理逻辑很简单，也是通过递归。当我发现你是一个**`**thenable**`**结构的时候，我就会一直派**`**resolve**`**函数去拿到你真正的结果。只有你不是**`**thenable**`**结构的时候，**`**resolve**`**才能发挥其真正的作用，那就是改变**`**Promise**`**实例的状态，填充结果**`**value**`**。请务必注意我**`**return**`**语句的使用。**
1. 为什么`then`方法要进行`try...catch`？如果`value`是`Promise`的时候，是不可能会有同步的错误被抛出从而被`try...catch...`捕获到的。但是我们得考虑自定义的`then`方法的情况：

:::
```javascript
new Promise(resolve => {
  resolve({
    then() {
      throw 1;
    }
  })
})
```
:::info

4. 为什么要使用`call`调用`then`方法，而不是直接使用`value.then`。这二者调用时，`this`指向是一样的，为什么要脱裤子放屁，多此一举呢。

事实上，每次属性的访问都是有可能造成副作用的。比如当他是一个访问器属性的时候，这个时候，必然会执行一次`get`。如果使用`value.then`就会又造成一次`get`方法的调用。
:::
```javascript
let obj = {};
let number = 0;
Object.defineProperty(obj, 'then', {
  get() {
    //这就是副作用!!!
    number++;
    return function() {
      throw 1;
    }
  }
})
new Promise((resolve, reject) => {
  then() {
      throw 1;
    }
})
```
至此，我们已经基本实现了`resolve`方法的解包功能。
<a name="XrstM"></a>
## 完善resolve/reject方法
我们搭建的`Promise`方法其实已经完成了`80%`的工作，但是它还存在一个严重的缺陷：那就是规范中提到的这句话：<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/25896210/1660806385717-84a23958-2f2f-45de-b932-cfd36bc5b4c3.png#clientId=u150add28-6b50-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=53&id=u5f708564&margin=%5Bobject%20Object%5D&name=image.png&originHeight=106&originWidth=1448&originalType=binary&ratio=1&rotation=0&showTitle=false&size=40571&status=done&style=shadow&taskId=u08eb1670-8427-4128-9272-7798d78e066&title=&width=724)<br />说人话就是，**如果我们的**`**resolve**`**方法被调用过之后，之后所有的**`**reject**`**和**`**resolve**`**方法的调用将会被忽略。**<br />可能有同学会想，我们好像已经实现了这个效果：
```javascript
new Promise((resolve, reject) => {
  resolve(1);
  resolve(2);
  resolve(3);
  reject(4);
})
```
这个结果最终会是`fulfilled`状态的`Promise`实例，并且是结果`value`是`1`。
但是，我们思考一个问题，它是怎么实现忽略后续执行的`resolve/reject`方法的。其实后续的`resolve/reject`方法还是按部就班的被执行了，只是第一次执行的`resolve`方法改变了`Promise`实例的状态，导致后续的执行并没有产生实际的效果。<br />**总而言之，它是通过状态的改变，来变相规避了重复调用的问题。**
:::
但是，考虑一种情景，如果状态的改变不是同步执行的呢？这不就会出问题了吗？举个🌰：
```javascript
new Promise((resolve, reject) => {
  resolve( new Promise((res) => {
    res(1);
  }));
  reject(2);
})
```

1. 当我们`resolve`一个`Promise`的时候，我们会调用它的`then`方法，然后将`resolve`和`reject`传递给`then`方法。但是`then`调用回调函数是异步的。所以状态的改变不会立即到来。
1. 这时同步代码继续执行，`reject(2)`，这时候`Promise`的状态被这行代码修改掉了。即使前面的异步任务执行也无力回天了，因为状态已经被改变了。

最后的表现效果为`reject`方法发挥了作用。而前面的`resolve`方法被覆盖了。这显然不是规范想要达到的效果。那我们应该重新思考一下了：
:::tips
**明确目标**：我们要达到的目标是`resolve`/`reject`方法只要有一个被调用，其他调用`resolve`/`reject`都会被忽略。
:::
我这里想到的思路是通过闭包来达到我们的目的：
```javascript
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
```
这里就是使用`called`作为标志，只要暴露出来的`resolve`，`reject`方法任意一个被调用。就会导致标志置为`true`，从而免疫一切后续调用。<br />所以我们现在使用的`resolve`和`reject`要被`onceCall`进行一次包裹，所以我们对原来的`resolve`和`reject`进行一次重命名：<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/25896210/1660810639477-6cc8e731-b8b5-4cd7-96ea-749112f44265.png#clientId=u150add28-6b50-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=505&id=uf7879e67&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1010&originWidth=2702&originalType=binary&ratio=1&rotation=0&showTitle=true&size=852425&status=done&style=shadow&taskId=ued52e7fd-8b7e-4d29-a801-42204ed810e&title=%E9%87%8D%E6%96%B0%E6%94%B9%E9%80%A0resolve&width=1351 "重新改造resolve")![image.png](https://cdn.nlark.com/yuque/0/2022/png/25896210/1660810712825-34ede535-d7d7-4d97-bd35-74a99d7049c5.png#clientId=u150add28-6b50-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=385&id=u9dcf5403&margin=%5Bobject%20Object%5D&name=image.png&originHeight=770&originWidth=2220&originalType=binary&ratio=1&rotation=0&showTitle=true&size=502590&status=done&style=shadow&taskId=u80bacc06-f5ad-4202-ab39-6d8c24cb417&title=%E9%87%8D%E5%91%BD%E5%90%8Dresject&width=1110 "重命名resject")<br />将`resolve`重命名为`realResolve`,将`reject`重命名为`realReject`。<br />**然后对传入**`**executor**`**函数中的**`**resolve**`**和**`**reject**`**先进行一次**`**onceCall**`**包裹**：<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/25896210/1660820744782-749cdfca-237c-4249-a185-55f5848f29b4.png#clientId=u150add28-6b50-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=161&id=u218436ac&margin=%5Bobject%20Object%5D&name=image.png&originHeight=322&originWidth=1098&originalType=binary&ratio=1&rotation=0&showTitle=false&size=40528&status=done&style=shadow&taskId=u51312895-5c33-4c97-8daa-76789214084&title=&width=549)<br />**此时，我们代码中用到的**`**resolve**`**和**`**reject**`**都是被包裹后的。只有**`**realResolve**`**和**`**realReject**`**才是原始的。**<br />**图中还对**`**realResolve**`**方法进行了一些调整：**

1. `**reject**`**改为**`**realReject**`

![image.png](https://cdn.nlark.com/yuque/0/2022/png/25896210/1660811375697-068f17e1-5f92-47a0-ac6d-efbb6b69d195.png#clientId=u150add28-6b50-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=175&id=u0a11bb56&margin=%5Bobject%20Object%5D&name=image.png&originHeight=350&originWidth=1706&originalType=binary&ratio=1&rotation=0&showTitle=false&size=91124&status=done&style=shadow&taskId=u3a89aabd-adfe-445f-863e-6549c0f81ea&title=&width=853)<br />这是因为`**realResolve**`**被调用，则说明**`**resolve**`**方法一定被调用了。那么**`**called**`**已经为**`**true**`**了。所以这时候调用**`**reject**`**肯定是不起作用的，所以得调用**`**realReject**`**。**

2. **又增加了一个**`**try...catch...**`**的结构，这个结构是为了捕获访问**`**value.then**`**时，可能会抛出的异常，举个🌰：**
```javascript
let value = {};
Object.defineProperty(value, 'then', {
  get() {
    throw 1;
  }
})
```

3. **对传递给**`**then**`**方法的**`**resolve**`**和**`**reject**`**也进行了一次**`**onceCall**`**的包裹。**
:::info
其实对于`Promise`实例来说，传递的`resolve`和`reject`不可能被重复调用。那`onceCall`包裹的意义在哪里呢？<br />这是因为要考虑`thenable`结构的情况：
:::
```javascript
var thenableInstance = {
  then(resolve, reject) {
    resolve();
    resolve();
    reject();
  }
}
```
**既然会出现多次调用的情况，那么也同样面临之前描述的那种问题，所以仍然需要进行一次**`**onceCall**`**的包裹。**
<a name="vGI9O"></a>
# 验证Promise的规范性
我们前文说过，我们的自定义的`Promise`会遵循`Promise/A+`组织推出的`Promise/A+`规范。为了验证大家的`Promise`是否合乎规范。`Promise/A+`组织也有相应的`NPM`包来进行校验：`promises-aplus-tests`。该`npm`包中有872条测试用例，完全通过则证明合乎规范。
:::info

1. 下载`npm`包，`npm install promises-aplus-tests`
1. 改造我们的手写实现文件,文件尾部添加如下代码：
:::

```javascript
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
```
:::info

3. 执行命令：`npx promises-aplus-tests <你的手写文件路径>`
:::
即可完成测试。
> 通过这个测试包，我们可以有效的排查我们未考虑到的情况，在整个代码的形成过程中，可见我其实考虑很多边界情况。这也是借助这个库帮助我完成的，不断优化代码逻辑。没有什么事情是一蹴而就的。

我已自测：<br />![image.png](https://cdn.nlark.com/yuque/0/2022/png/25896210/1660830519353-06fab998-080b-427a-8c5e-2d73b94b9dd4.png#clientId=u06c58007-d711-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=46&id=u657b8fc8&margin=%5Bobject%20Object%5D&name=image.png&originHeight=92&originWidth=524&originalType=binary&ratio=1&rotation=0&showTitle=true&size=4380&status=done&style=none&taskId=uebbe6f61-bbdb-45f0-a689-6b04c3a92bc&title=%E8%87%AA%E6%B5%8B%E7%BB%93%E6%9E%9C&width=262 "自测结果")

---

如果想参考我的代码，[请点这里！](https://github.com/luoyichoumeimei/implement-by-myself)代码提交的历史是和文章思路是保持一致的。不过我使用了`typescript`，所以我经过了一次编译，关注`promise/index.js`文件即可。
<a name="DToOD"></a>
# 完善后续API
后续API基本都是基于`then`方法的变种。
<a name="J3JXn"></a>
## Promise.prototype.catch
```javascript
catch(onRejected?: (reason?: any) => any) {
    return this.then(undefined, onRejected);
  }
```
<a name="w8apO"></a>
## Promise.protype.finally
```javascript
 finally(callback: () => void) {
    this.then(
      (value) => {
        return new Promise((resolve) => {
          resolve(callback());
        }).then(() => value);
      },
      (reason) => {
        return new Promise((resolve) => {
          resolve(callback());
        }).then(() => {
          throw reason;
        });
      }
    );
  }
```
:::info
相对来讲，`finally`的逻辑会有点绕：

1. 当成功的`Promise`调用`finally`方法时：
   1. 如果`finally`方法的回调函数不抛出错误或返回错误的`Promise`实例，则返回和当前成功`Promise`状态和结果一致的`Promise`。
   1. 如果`finally`方法的回调函数抛出错误或返回错误的`Promise`实例，则返回状态为失败，结果为回调函数抛出的错误内容的`Promise`。
2. 当失败的`Promise`调用`finally`方法时：
   1. 如果`finally`方法的回调函数不抛出错误或返回错误的`Promise`实例，则返回和当前成功`Promise`状态和结果一致的`Promise`。
   1. 如果`finally`方法的回调函数抛出错误或返回错误的`Promise`实例，则返回状态为失败，结果为回调函数抛出的错误内容的`Promise`。
:::
<a name="ILeYu"></a>
## Promise.resolve
```javascript
static resolve(value: unknown) {
    return new Promise((resolve, reject) => {
      resolve(value);
    });
  }
```
<a name="cAsQv"></a>
## Promise.reject
```javascript
  static reject(reason: unknown) {
    return new Promise((resolve, reject) => {
      reject(reason);
    });
  }
```
<a name="gOSfn"></a>
## Promise.all
```javascript
  static all(list: any[]) {
    return new Promise((resolve, reject) => {
      //暂存成功数组元素的结果，务必和数组元素是一一对应关系
      const results: any[] = [];
      //记录成功状态的数量。作为标志。
      let fulfilledCount: number = 0;
      function fulfillPromise(value: unknown, index: number) {
        results[index] = value;
        if (++fulfilledCount === list.length) {
          resolve(results);
        }
      }
      for (let index = 0; index < list.length; index++) {
        Promise.resolve(list[index]).then((value) => {
          fulfillPromise(value, index);
        }, reject);
      }
    });
  }
```
主要思路就是每次数组元素成功的时候，进行判断是不是所有元素都成功了，是的话就返回成功的`Promise`。
<a name="zYmTd"></a>
## Promise.race
```javascript
  static race(list: any[]) {
    return new Promise((resolve, reject) => {
      for (let index = 0; index < list.length; index++) {
        Promise.resolve(list[index]).then(resolve, reject);
      }
    });
  }
```
就是比谁跑的快~
<a name="dXeRQ"></a>
# 写在最后
行文至此，身心俱疲。如有纰漏，不吝赐教。(后面的API硬敲的，没测hh~卒...)
