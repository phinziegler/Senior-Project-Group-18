# TypeScript
TypeScript is much like JavaScript, except now with (mostly) strict types. This document is meant to act like a crash-course which goes over the basics of TypeScript. If you bump into TypeScript trouble from outside the scope of this document just hit me up on Discord with a screenshot and I may be able to help, otherwise, TypeScript problems are extremely Google-able.

## JavaScript things
JavaScript has no strict type rules. So in Java where you would have to say `int myInt = 0`, in javascript you simply say `let myInt = 0` and javascript deals with the typing on its own, much like Python.
Additionally, you could say `const myInt = 0` if you are certain that the value `myInt` will never change after it is assigned.

JavaScript also has different data types than Java.
1. String
2. Number
3. Boolean
4. undefined
5. null
6. Object
7. a few more we wont worry about

These are all mostly self explanatory except for a few notes: 
1. Undefined means no value has been assigned to a variable after being declared.
2. Null means a value is empty/does not exist (no value)
3. There is no distinction between doubles/floats and integers. Number values are treated as decimal containing.
4. Booleans are extremely wack because the other data types are allowed to be evaluated as booleans. You can literally plug in an object into the condition of an if statement and it will return true or false depending on the type of object, and what it contains. Same goes for numbers, null, and undefined values. The behavior is confusing and inconsistent, and as such this feature should be avoided unless you really know what you are doing.

## TypeScript
JavaScript is really easy to use for small projects, but when things scale up, it can become very easy to lose track of which data types certain data is, and lose track of which properties are available on certain objects deep within the code, thus, the need for TypeScript.

TypeScript compiles down to JavaScript, which is awesome because now you can get compilation errors which tell you when you are misusing data, and forces you to maintain data unambiguity. No more inexplicable runtime errors! 
It is also awesome because now you can get code completion, which is a massive game changer.

In TypeScript you assign a type to a variable like so.
```ts
let myData: string;
```
Now I can do...
```ts
myData = "a string"
```

And of course you could do this on one line as well.
```ts
let myData: string = "a string";
```

<strong>IMPORTANT:</strong> When defining the type for a variable, if it is one of the basic JavaScript types (like in the list above), you must use lowercase letters. Use `let myData: string;` NOT `let myData: String;`. Making this mistake can cause some really frustrating errors.

### Good to know types
1. boolean
2. number
3. string
5. Tuple
6. enum
7. any
8. void

Note the lowercase letters.

### Arrays
Arrays are pretty important. Here's how you use them in TypeScript.

```ts
let myArr: number[] = [1,2,3];
let myDoubleArr: number[][] = [myArr, [4,5,6]];     // a double number array
```

You could also do.
```ts
let myArr: Arrat<number> = [1,2,3];
let myDoubleArr: Array<Array<number>> = [myArr, [4,5,6]];     // a double number array
let myDoubleArr2: Array<number>[] = [myArr, [4,5,6]];     // another way for double number array
```

NOTE: You will also see this `Type<subtype>` form when using certain objects like `Map`

### Tuples
```ts
// Declare a tuple type
let x: [string, number];
// Initialize it
x = ["hello", 10];
```

### The Any Type
There is a way to allow Typescript typing rules to be ignored, this is by setting a variable's type to `any`. Using the `any` type should be avoided at all costs, but there are still occasional use cases. For example, when using imported modules which don't specify types...
```ts
let myVar: any = functionFromImportedModule();
```
This allows us to use a function from an external library without dealing with compilation errors. That said, most npm libraries do have typescript types which can be imported and used. There is however, one example where this is not the case in `src/client/routes/ErrorPage.tsx` if you wanted to check that out.

### Functions
How do you write functions in typescript?
```ts
// basic function with return type of string
function wowFunc(): string {
    return "wow!";
}

// with parameters and return type of number
function addNumbers(x: number, y: number): number {
    return x + y;
}
```

### Function types AS a type
Functions in TypeScript can take in other functions as parameters, so how would you define their type?
NOTE: In java you make lambda functions like `() -> {}`, in TypeScript you make them like `() => {}`

```ts
// myFunc must be assigned to a function which takes 2 number inputs and returns a number output
let myFunc: (a: number, b: number) => number;

// assign myFunc to a value using lambda function notation =>
myFunc = (x: number, y: number):number => {
    return x + y;
}

myFunc(1,2);    // returns 3
```

### Custom Types
You can declare your own types, and that is very epic.
```ts
type NumArr = number[];

// now you can do
type DoubleNumArr = NumArr[];

// now
let myDoubleArr: DoubleNumArr = [[1,2,3], [4,5,6]];     // a double number array
```
Once you have declared a custom type you can use it exactly how you use any of the other basic types.

```ts
type MyFunc: (x: number) => void;
let myFunc: MyFunc = (x: number) => {console.log(x)};
myFunc(10);     // prints "10" to the console
```

### Generics
```ts
type Arr<T> = T[];

type DoubleArr<T> = Arr<T>[];

let myDoubleArr: DoubleArr<string> = [["1","2","3"], ["4","5","6"]];
```

## JSON
JSON stands for JavaScript Object Notation. Here is an example of how you would use it to define a basic object using JavaScript.
```js
let basicObject = {
    property1: "hello",
    property2: 123
}
```
Now you could access the `number` value `123` by using `basicObject.property2`

You can also nest objects like so...
```js
let myObject = {
    property1: "hello",
    property2: 123,
    nestedObject: {
        arr: [1, 2, 3],
        name: "wow!"
    }
}
```
Now I could access the `string` value `"wow!"` by using `myObject.nestedObject.name`. I could also access the `number` value `2` by using `myObject.nestedObject.arr[1]`

## TypeScript Objects
TypeScript objects wont like when you just start adding properties and values to objects willy-nilly like you can in JavaScript. It is usually best practice to create an `interface` to define object formations.
In the `basicObject` example, before you could create the object you would have to define an interface for it like so.
```ts
interface Basic {
    property1: string,
    property2: number
}
```
Now we have a `Basic` type. Now to create `myObject` again, the code is almost the same, except that now we must define the type of the object before we start giving it values.

```ts
interface Basic {
    property1: string,
    property2: number
}

let basicObject: Basic = {
    property1: "hello",
    property2: 123
}
```
It is also worth noting that you can define object types in a shorthand way, which does not require defining an interface.
```ts
let basicObject: {property1: string, property2: 123} = {
    property1: "hello",
    property2: 123
}
```
But this is not recommended for complicated objects, or data definitions which are used elsewhere in code.

Now just to really hammer it in, here is how you would do the more complicated `myObject` example in TypeScript.

```ts
interface NestedObject {
    arr: number[],
    name: string
}

interface OutsideObject {
    property1: string,
    property2: number,
    nestedObject: NestedObject
}

let myObject = {
    property1: "hello",
    property2: 123,
    nestedObject: {
        arr: [1, 2, 3],
        name: "wow!"
    }
}
```

# Thats all for now gamers
Again, there may be some typescript features you stumble across that you don't understand. Just hit your boy up if you need help with something.