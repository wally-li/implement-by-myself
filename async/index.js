/*
 * @Description: implement async's executor
 */
function func2() {
  return spawn(function* () {}, arguments, this)
}

function spawn(generator, args, that) {
  return new Promise((resolve, reject) => {
    function next(awaitValue) {
      let result;
      try {
        result = gen.next(awaitValue);
      } catch (err) {
        //注意这个return
        return reject(err);
      }
      if (result.done) {
        resolve(result.value);
      } else {
        Promise.resolve(result.value).then(value => next(value), err => {
          try {
            gen.throw(err)
          } catch (err) {
            reject(err);
          }
        })
      }
    }
    let gen = generator.apply(that, args);
    next();
  })
}

function spawn(generator, args, that) {
  return new Promise((resolve, reject) => {
    function next(actionFn) {
      let result;
      try {
        result = actionFn();
      } catch (err) {
        //这个return是为了避免后续代码的执行。
        return reject(err);
      }
      if (result.done) {
        resolve(result.value);
      } else {
        Promise.resolve(result.value).then(value => {
          next(() => {
            return gen.next(value);
          })
        }, err => {
          next(() => {
            return gen.throw(err);
          })
        })
      }
    }
    let gen = generator.apply(that, args);
    next(() => {
      return gen.next();
    });
  })
}

function func() {
  return function func2() {
    console.log("first")
  };
}
if (true) {
  function func() {}
}

function func() {
  return () => {
    console.log(this)
    debugger;
  };
}
let a = func.call({});
a();