"use strict";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2020-04-01T10:17:24.185Z",
    "2020-05-08T14:11:59.604Z",
    "2020-07-26T17:01:17.194Z",
    "2020-07-28T23:36:17.929Z",
    "2020-08-01T10:51:36.790Z",
  ],
  currency: "EUR",
  locale: "pt-PT", // de-DE
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2020-04-10T14:43:26.374Z",
    "2020-06-25T18:49:59.371Z",
    "2020-07-26T12:01:20.894Z",
  ],
  currency: "EUR",
  locale: "pt-PT",
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

/////////////////////////////////////////////////
// Functions
//we are formatting d date in every movement & labelbalane acc to the locale given in d accounts
const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  const daysPased = calcDaysPassed(new Date(), date);
  if (daysPased === 0) return "Today"; //return is like a break statement that stops executing once d func is reached
  if (daysPased === 1) return "Yesterday";
  if (daysPased <= 7) return `${daysPassed} days ago`;

  return new Intl.DateTimeFormat(locale).format(date);
  /*
  const day= `${date.getDate()}`.padStart(2,0);
  const month= `${date.getMonth()+1}`.padStart(2,0);
  const year= date.getFullYear();
  return `${day}/${month}/${year}`
*/
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = "";

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? "deposit" : "withdrawal";

    const date = new Date(acc.movementsDates[i]); //technique for looping over 2 arrays at d same time.what we have is access to d movements
    //dates arr which are in strings but should be coverted to proper date.we can only call methods on objects

    const displayDate = formatMovementDate(date, currentAccount.locale);

    const formattedMov = formatCur(mov, acc.locale, acc.currency);
    /* new Intl.NumberFormat(acc.locale,{
  style: 'currency',
  currency: acc.currency
}).format(mov) */
    //we applied d formatter on d movements in d acc
    //d currency is completely independent from d locale,meaning d val/num will still be in the locale of d current user
    //but currency changes based on d options style

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;
    //tofixed was used to round up movements val to 2dp
    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

//we create a reusable function inside of d func for formatting currencies
const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(value);
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter((mov) => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter((mov) => mov > 0)
    .map((deposit) => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(" ")
      .map((name) => name[0])
      .join("");
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

//IMPLEMENTING COUNTDOWN TIMERS
const startLogTimer = function () {
  const tick = () => {
    const min = String(Math.trunc(time / 60)).padStart(2, 0); //we convert d date to a str to apply pad
    const sec = String(time % 60).padStart(2, 0);
    //3.in each call,print time remaining to the UI
    labelTimer.textContent = `${min}:${sec}`;

    //4.when t=0sec, stop timer and log user out
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = "Login to get started";
      containerApp.style.opacity = 0;
    }

    //decrease time by 1s
    time--;
  };

  //1.we set timer to 5mins
  let time = 120;
  tick();
  //2.call timer every second
  const timer = setInterval(tick, 1000);
  return timer;
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;
//FAKE ALWAYS LOGGED IN
//currentAccount=account1;
//containerApp.style.opacity= 100;
//padstart(2 charc long, pad with a 0)ensures every date has 2 characters
//Experiment date
const now = new Date();
const options = {
  hour: "numeric",
  minute: "numeric",
  day: "numeric",
  month: "long", //2-digit(02 for feb)... dec rather than 2-dig(12)
  year: "numeric",
  weekday: "long", //thursday
};
const locale = navigator.language;
console.log(locale);
//we can get the users locality rather than manually coding for diff countries
//meaning d users browser will automatically read d date and location of user

labelDate.textContent = new Intl.DateTimeFormat(locale, options).format(now);
//this is using the date format api prov by js to format dates according to our locations
//ISO language to get formats for diff countries.it receives 2 parameters(country str for date,time format)
//to also get the time format, we can specify it using this api

btnLogin.addEventListener("click", function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    (acc) => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(" ")[0]
    }`;
    containerApp.style.opacity = 100;

    //Create current date and time for label balance
    const now = new Date();
    const options = {
      hour: "numeric",
      minute: "numeric",
      day: "numeric",
      month: "numeric", //2-digit(02 for feb)... dec rather than 2-dig(12)
      year: "numeric",
      //weekday: 'long'//thursday
    };
    //const locale= navigator.language;
    //console.log(locale);
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);
    //you are going to personalize this project in your style

    /*
    const day= `${now.getDay()}`.padStart(2,0)
    const month= `${now.getMonth()+1}`.padStart(2,0)
    const year= `${now.getFullYear()}`
    labelDate.textContent= `${day}/${month}/${year}`
    */

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = "";
    inputLoginPin.blur();

    //timer
    if (timer) clearInterval(timer); //if timer exists,upon t=0s,log out user by clearing time interval
    timer = startLogTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    (acc) => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = "";

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);
    //Add transfer dates
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());
    // Update UI
    updateUI(currentAccount);
    //reset timer
    clearInterval(timer);
    timer = startLogTimer();
  }
});

btnLoan.addEventListener("click", function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value); //rounds d val down

  if (
    amount > 0 &&
    currentAccount.movements.some((mov) => mov >= amount * 0.1)
  ) {
    //we include a settimeout func in d request of a loan
    setTimeout(() => {
      // Add movement
      currentAccount.movements.push(amount);
      //Add loan dates
      currentAccount.movementsDates.push(new Date().toISOString());
      // Update
      updateUI(currentAccount);
      //reset timer
      clearInterval(timer);
      timer = startLogTimer();
    }, 2500);
  }
  inputLoanAmount.value = "";
});

btnClose.addEventListener("click", function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      (acc) => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = "";
});

let sorted = false;
btnSort.addEventListener("click", function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
//numbers are always stored in a 64 base 2 format.fractions are difficult reps in base 2 format
//base 10: 0-9
//base 2: 0-1
/*
console.log(23===23.00)
//conversion
console.log(0.1+0.2)//we cant do really precise and scientific calc using js
console.log(Number('23')) 
console.log(+'23');//the + operator convert d string to a number automatically

//parse: this accepts 2 args,d string to be converted to a num,& the base of d num we're using
//regex is the base of the numeral system we're using
console.log(Number.parseInt('23'))//only allows use of int not decimals
//parse.float allows us use decimals
console.log(Number.parseFloat('2.5rem'))//we are calling functions on number objects
//parse are global variables,meaning they can stand on their own

//isNaN is used to check if any value is NaN
console.log(Number.isNaN(20))//is 20 not a num,,false
console.log(Number.isNaN('20'))// its also not a num but a regular value


//checking if a value is a number/not using isFinite.this is a more trusted way
console.log(Number.isFinite(20))
console.log(Number.isFinite('20'))
console.log(Number.isFinite('20px'))
console.log(Number.isFinite(23 / 0))

//checking if a value is an integer
console.log(Number.isInteger(20))
console.log(Number.isInteger(20.00))
*/
//MATH AND ROUNDING
console.log(Math.sqrt(25));
console.log(25 ** (1 / 2)); //** stands for exponential
console.log(Math.max(5, 23, 15, 18, 20));
console.log(Math.max(5, "23", 15, 18, 20)); //it does type coercion meaning it converts to a num

console.log(Math.min(5, 23, 15, 18, 20));
console.log(Math.PI); // gives d value of pie 3.142

const area = (radius) => Math.PI * Number.parseFloat(radius) ** 2;
console.log(area(10));
console.log(Math.trunc(Math.random() * 6) + 1); //math.trunc gives a single integer value.+1 allows us btw 1&6

const randomInt = (min, max) =>
  Math.trunc(Math.random() * (max - min) + 1) + min;
//0...1
//console.log(randomInt(10,20))

//rounding integers
//math.trunc removes any decimal& rounds to its nearest int
/*
console.log(Math.round(23.3));
console.log(Math.round(23.3));

console.log(Math.ceil(23.3));//rounds up to d num above it
console.log(Math.ceil(23.9));//rounds up to d num above it

console.log(Math.floor(23.3));//rounds down to d num before it
console.log(Math.floor(23.9));//23
//floor & trunc do the same thing(cut off dec) when dealing with +ve num but are diff with -ve num
console.log(Math.floor(-23.3));//most preferred as it rounds up-ve num accurately
console.log(Math.trunc(-23.3));

//rounding decimals
//toFixed is used but it will always return a str and not a real num
console.log((2.7).toFixed(0));//js does boxing by converting d primitives(num)to an obj& calls d method on it
console.log((2.7).toFixed(3));//fix to 3dp
console.log((2.745).toFixed(2));
console.log(+(2.745).toFixed(2));//+ operand coverts str to number
*/
//REMAINDER OPERATOR
//it returns d remainder of a division
/*
console.log(5 % 2);//5= 2*2 + 1
console.log(5 / 2);

console.log(8 % 3);//8=3*2 +2
console.log(8 / 3);

const num= [1,4,7,10,13,16,19,22]
const odd= num.filter(cur=> cur%2===1);
console.log(odd);

const isEven= n=> n%2===0
console.log(isEven(8));
console.log(isEven(15));
console.log(isEven(20));
//quick exercise: colour every 2nd row of our movement with orangered
containerMovements.addEventListener('click',function(e){
e.preventDefault()
Array.from(document.querySelectorAll('.movements__row')).forEach((cur,ind)=>{
  ind%2===0 ? cur.style.backgroundColor= 'orangered' : cur.style.backgroundColor= '#fff'
})
})
*/
/*
//BIGINT
//its a special type of int introduced in 2020.we learnt num are stored internally in 64bits.ie.64 pieces of 0/1
//only 53 are used to store d num,while d rest stores d positions,etc.
console.log(2 ** 53-1);//max number stored in js
console.log(Number.MAX_SAFE_INTEGER);
console.log(2 ** 53+1);//unsafe nums cos we have exited d safest integer limit of 52
console.log(2 ** 53+2);
//bigint n(big Int)is used to store numbers as large as we want
console.log(42356790485857375957573975n)
console.log(BigInt(42356790485857375957573975))
//operations with bigint
//we cant mix bigint and regular nums together
console.log(42356790485857375957573975n * 100000000000n);
console.log(42356790485857375957573975n + 100000000000n);
const huge= 42356790485857375957573975n;
const reg= 25;
console.log(huge*BigInt(reg));
//exceptions using bigint are d comparison operators & plus operators when working with strings
console.log(20n>15)
console.log(20n===20);//false
console.log(20n==20);//true as js converts 20n to a regular num(type coercion)
console.log(typeof 20n)

//string concatenations
console.log(huge + ' is REALLY big')//bigint is converted to a reg number

//divisions
console.log(20n/20n);
console.log(20n/3n);//rounds up to closest integer
*/
//CREATING DATES & TIMES
//4 ways to create date in js
/*
const now= new Date();
console.log(now);

console.log(new Date('Wed Jan 11 2023 12:51:33'))
console.log(new Date('December 25,2022'))//parse string in date constructor

console.log(new Date(2037, 10, 11, 12, 10, 5))
console.log(new Date(2037, 10, 33, 12, 10, 5))

console.log(new Date(0));
console.log(new Date(3*24*60*60*1000));//timestamp of day 3
*/
//working with dates
/*
const future= new Date(2037, 10, 11, 12, 10)
console.log(future.getFullYear())
console.log(future.getMonth())//the 10th mnth is actually nov cos its reading is 0 based
console.log(future.getDate())
console.log(future.getDay())//gets d day of the week with 0 being sunday
console.log(future.getHours())
console.log(future.getMinutes())
console.log(future.getSeconds())
console.log(future.toISOString())//nicely formated string to.ISO to convert date obj to a str that can be stored somewhere
//timestamp is the millisec that has passed since jan1,1970
console.log(future.getTime());
console.log(new Date(2141550600000));
console.log(Date.now())//current timestamp

future.setFullYear(2040);
console.log(future)
*/
/*
//OPERATIONS WITH DATES
//1.we wish to get d number of days from millisec
//func for getting difference btw days
const calcDaysPassed= (date1,date2)=> Math.abs(date2 - date1)/(1000*60*60*24);

const display= calcDaysPassed(new Date(2037,3,14), new Date(2037,3,24));
console.log(display);

//INTERNATIONALIZING DATES
//INT DATES APIs-IT ALLOWS us format numbers&strings according to diff languanges

//INTERNATIONALIZING numbers
//this works similar to date-format which accepts 2 arg(d locale str for d country,options obj which we specify its ppt)
const num= 750450000.550;
const option= {
  style: 'currency',//d 3 allowed styles for numberformat are(unit,percent & currency)
  //unit: 'mile-per-hour',
  currency: 'EUR',//for currency,we have to specify it cos its not specified by d locale of d country
  //useGrouping: false//to avoid using separators though its optional
  //for more ppt in this formatNumber obj, see MDN for details
}

console.log('US:  ',new Intl.NumberFormat('en-US',option).format(num))
console.log('Germany:  ',new Intl.NumberFormat('de-DE',option).format(num))
console.log('Nigeria:  ',new Intl.NumberFormat('en-NG',option).format(num))//symbol of currency comes 1st
console.log('Portugal:  ',new Intl.NumberFormat('pt-PT',option).format(num))
console.log(navigator.language,new Intl.NumberFormat(navigator.language,option).format(num))//local browser
*/
//SETTIMEOUT & SET-INTERVALS(INTRO TO ASYNC JAVASCRIPT)
//settimeout runs just once after a time interval has occured.However,we can clear a timeout bfore  its timer elapses
//it schedules a func to run after a certain amnt of time.the callback only runs once after d timer elapses
//set-interval keeps running forever till we stop it
/*
const ingredients= ['olives','lettuce']
const pizzaTimer= setTimeout((...ing) => {
  console.log(`Here is your Pizza!! with ${ing[0]} and ${ing[1]}`)
}, 3000,...ingredients);
console.log('Waiting...')
if(ingredients.includes('spinach')) clearTimeout(pizzaTimer);

//SET-INTERVAL-to allow a func keep running over and overagain within a time-interval
setInterval(()=>{//this displays d date every 2s without an end 
  const now= new Date();
  console.log(now)
},2000)
//build a real clock that displays d time in hrs,mins,sec

//LAST PART OF THIS PROJECT
//IMPLEMENTING COUNTDOWN TIMERS
*/
