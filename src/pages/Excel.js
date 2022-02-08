import React from 'react';
import axios from 'axios';
import { config } from '../config';

import { ExportToExcel } from '../components/export-to-excel';

function Excel() {
  const [data, setData] = React.useState([]);
  const fileName = 'myfile'; // here enter filename for your excel file

  React.useEffect(() => {
    let { token } = localStorage.getItem('auth')
      ? JSON.parse(localStorage.getItem('auth'))
      : {};
    const fetchData = () => {
      axios
        .get(`${config.api_host}/api/allOrderItems`, {
          headers: {
            authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          let result = res.data;
          let newResult = [
            ...result.data.map((order) => {
              return {
                ...order,
              };
            }),
          ];

          // let newResult = [
          //   ...result.data.map((order) => {
          //     return {
          //       order_items: order.order_items.map((data) => data.name),
          //     };
          //   }),
          // ];
          setData(newResult);
        });
    };
    fetchData();
  }, []);

  return (
    <div>
      <ExportToExcel apiData={data} fileName={fileName} />
    </div>
  );
}

export default Excel;
