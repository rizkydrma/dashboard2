import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Chart from 'react-apexcharts';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';

import StatusCard from '../components/status-card/StatusCard';
import Table from '../components/table/Table';
import Badge from '../components/badge/Badge';

import { Link } from 'react-router-dom';

import { getDataDashboard } from '../api/dashboard';

import { socket } from '../app/websocket';

const orderStatus = {
  preparing: 'primary',
  delivery: 'warning',
  done: 'success',
  refund: 'danger',
};

const statusPayment = {
  waiting_payment: 'warning',
  done: 'success',
};

const contentPayment = {
  waiting_payment: 'waiting',
  done: 'done',
};

const Dashboard = () => {
  const [visitor, setVisitor] = useState(0);
  const themeReducer = useSelector((state) => state.theme.mode);
  const initChartOption = {
    series: [
      {
        name: 'Penjualan',
        data: [10, 10],
      },
    ],
    options: {
      color: ['#6ab04c', '#2980b9'],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
      },
      colors: ['#00BAEC'],
      fill: {
        gradient: {
          enabled: true,
          opacityFrom: 0.55,
          opacityTo: 0,
        },
      },
      xaxis: {
        categories: [1, 2],
      },
      legend: {
        position: 'top',
      },
      grid: {
        show: false,
      },
    },
  };
  let date = new Date();
  const month = date.toLocaleString('default', { month: 'long' });
  let year = date.getFullYear();

  const [orders, setOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [statusCards, setStatusCards] = useState([]);

  const [chartOption, setChartOption] = useState(initChartOption);

  const fetchOrders = useCallback(async () => {
    let { data } = await getDataDashboard();

    if (data.error) {
      return;
    }

    setOrders(data.latestOrders);
    setTopProducts(data.topProducts);
    setStatusCards([
      {
        icon: 'bx bx-cart',
        count: visitor,
        title: 'Daily visits',
      },
      {
        icon: 'bx bx-dollar-circle',
        count: `Rp. ${data.grandTotal}`,
        title: 'Total income',
      },
      {
        icon: 'bx bx-receipt',
        count: data.totalOrders,
        title: 'Total orders',
      },
    ]);
    setVisitor(data.customerCount);

    setChartOption({
      series: [
        {
          name: 'Penjualan',
          data: data.orders.totalOrdersChart.map((order) => order.totalAmount),
        },
        {
          name: 'Order',
          data: data.orders.sumOrdersChart.map((order) => order.count),
        },
      ],
      options: {
        color: ['#6ab04c', '#2980b9'],
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: 'smooth',
        },
        colors: ['#00BAEC'],
        fill: {
          gradient: {
            enabled: true,
            opacityFrom: 0.55,
            opacityTo: 0,
          },
        },
        xaxis: {
          categories: data.orders.totalOrdersChart.map((order) =>
            order._id.slice(8, 10),
          ),
        },
        legend: {
          position: 'top',
        },
        grid: {
          show: false,
        },
      },
    });
  }, [visitor]);

  const topProductsColumns = useMemo(
    () => [
      { Header: 'Name', accessor: '_id' },
      { Header: 'Jumlah', accessor: 'qty' },
    ],
    [],
  );
  const topProductsData = useMemo(() => [...topProducts], [topProducts]);

  let ordersData = useMemo(
    () => [
      ...orders.map((order) => {
        return {
          ...order,
          order_items: order.order_items.map(
            (item) =>
              `${item.name} ${item.variant ? '(' + item.variant + ')' : ''} x ${
                item.qty
              }`,
          ),
        };
      }),
    ],
    [orders],
  );

  const ordersColumns = useMemo(
    () => [
      {
        Header: 'Order No',
        accessor: 'order_number',
        maxWidth: 10,
        widht: 5,
      },
      {
        Header: 'Order Items',
        accessor: 'order_items',
        Cell: ({ value }) => {
          return value.map((val, idx) => (
            <span key={idx}>
              {`${val}`}
              <br />
            </span>
          ));
        },
        maxWidth: 100,
        widht: 50,
      },
      { Header: 'Customer', accessor: 'user.full_name' },
      { Header: 'No Table', accessor: 'notable' },
      {
        Header: 'Tanggal',
        accessor: 'createdAt',
        Cell: ({ value }) => {
          return format(new Date(value), 'dd-MMM HH:mm ');
        },
      },
      {
        Header: 'Status Pay',
        accessor: 'status_payment',
        Cell: ({ value }) => {
          return (
            <Badge
              type={statusPayment[value]}
              content={contentPayment[value]}
            />
          );
        },
      },
      {
        Header: 'Proggres Order',
        accessor: 'status_order',
        Cell: ({ value }) => {
          return <Badge type={orderStatus[value]} content={value} />;
        },
      },
    ],
    [],
  );

  useEffect(() => {
    fetchOrders();
    socket.on('thisNewOrder', (data) => {
      fetchOrders();
    });

    socket.on('customerCount', (data) => {
      setVisitor(data.customerCount);
    });

    return function cleanup() {
      socket.off('thisNewOrder', (data) => {
        console.log('socket off' + data);
      });

      socket.off('customerCount', (data) => {
        console.log('socket off' + data);
      });
    };
  }, [fetchOrders]);

  return (
    <>
      <h2 className="page-header">Dashboard | {`${month}-${year}`}</h2>
      <div className="row">
        <div className="col-8 col-md-12">
          <div className="row">
            {statusCards.map((item, index) => (
              <div className="col-4 col-md-6 col-sm-12" key={index}>
                <StatusCard
                  icon={item.icon}
                  count={item.count}
                  title={item.title}
                />
              </div>
            ))}
            <div className="col-12">
              <div className="card full-height">
                {chartOption && (
                  <Chart
                    options={
                      themeReducer === 'theme-mode-dark'
                        ? {
                            ...chartOption.options,
                            theme: { mode: 'dark' },
                          }
                        : {
                            ...chartOption.options,
                            theme: { mode: 'light' },
                          }
                    }
                    series={chartOption.series}
                    height="270"
                    type="area"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-4 col-md-12">
          <div className="card">
            <div className="card__header">
              <h4>Top Sales Product</h4>
            </div>
            <div className="card__body">
              {topProducts.length > 0 && (
                <Table columns={topProductsColumns} data={topProductsData} />
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-12 col-md-12">
          <div className="card">
            <div className="card__header">
              <h4>Latest Order</h4>
            </div>
            <div className="card__body">
              {orders.length > 0 && (
                <Table columns={ordersColumns} data={ordersData} />
              )}
            </div>
            <div className="card__footer">
              <Link to="/orders">View All</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
