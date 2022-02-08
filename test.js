const serverData = [
  {
    code: 1,
    item: 'ball',
    salesman: 'Braan',
    quantity: 5,
    price: 10.0,
  },
  {
    code: 1,
    item: 'shoe',
    salesman: 'Alex',
    quantity: 5,
    price: 20.0,
  },
  {
    code: 1,
    item: 'ball',
    salesman: 'Max',
    quantity: 3,
    price: 10.0,
  },
  {
    code: 1,
    item: 'shirt',
    salesman: 'Braan',
    quantity: 5,
    price: 15.0,
  },
];

const result = serverData
  .map((item, i, array) => {
    const defaultValue = {
      code: item.code,
      item: item.item,
      quantity: 0,
      price: 0,
    };
    const finalValue = array
      .filter((other) => other.item === item.item) //we filter the same items
      .reduce((accum, currentVal) => {
        //we reduce them into a single entry
        accum.quantity += currentVal.quantity;
        accum.price += currentVal.price;
        return accum;
      }, defaultValue);

    return finalValue;
  })
  .filter((item, thisIndex, array) => {
    //now our new array has duplicates, lets remove them
    const index = array.findIndex(
      (otherItem, otherIndex) =>
        otherItem.item === item.item &&
        otherIndex !== thisIndex &&
        otherIndex > thisIndex,
    );

    return index === -1;
  });

console.log(result);
