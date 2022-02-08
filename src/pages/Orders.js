import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';

import {
  fetchOrders,
  goToNextPage,
  goToPrevPage,
  setPage,
} from '../redux/Orders/actions';

import { getOneOrder, updateOneOrder, deleteOneOrder } from '../api/orders';
import statusOrderData from '../assets/JsonData/status-order.json';
import statusPaymentData from '../assets/JsonData/status-payment.json';

import Badge from '../components/badge/Badge';
import Pagination from '../elements/Pagination/Pagination';
import Table from '../components/table/Table';
import Modal from '../elements/Modal/Modal';

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import StatusCard from '../components/status-card/StatusCard';

import { socket } from '../app/websocket';

const orderStatus = {
  preparing: 'primary',
  delivery: 'warning',
  delivered: 'success',
};

const statusPayment = {
  waiting_payment: 'warning',
  done: 'success',
};

const contentPayment = {
  waiting_payment: 'waiting',
  done: 'done',
};

let startDate = new Date();
let endDate = new Date();

const Orders = () => {
  const dispatch = useDispatch();
  const [show, setShow] = useState(false);
  const [detailOrder, setDetailOrder] = useState([]);
  const [payment, setPayment] = useState();
  const [progress, setProgress] = useState();
  const [success, setSuccess] = useState(false);
  const [date, setDate] = useState([
    {
      startDate: new Date(startDate.setHours(0, 0, 0)),
      endDate: new Date(endDate.setHours(23, 59, 59)),
      key: 'selection',
    },
  ]);

  const MySwal = withReactContent(Swal);
  let orders = useSelector((state) => state.orders);
  let user = useSelector((state) => state.auth.user);

  let ordersData = useMemo(
    () => [
      ...orders.data.map((order) => {
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
    [orders.data],
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

  const fetchOneOrder = async (id) => {
    setShow(true);
    let { data } = await getOneOrder(id);
    if (data.error) {
      console.log(data.error);
      return;
    }

    setDetailOrder(data);
    setPayment(data.status_payment);
    setProgress(data.status_order);
  };

  const onSave = useCallback(
    async (payment, progress) => {
      let id = detailOrder._id;
      let payload = { status_payment: payment, status_order: progress };
      let data = await updateOneOrder(id, payload);

      if (data.error) {
        console.log(data.error);
        return;
      }

      setShow(false);
      setSuccess(true);
    },
    [detailOrder],
  );

  const onDelete = useCallback(
    async (id) => {
      MySwal.fire({
        title: 'Do you want to Delete?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#7c40ff',
        cancelButtonColor: '#ff5353',
        confirmButtonText: 'Delete',
      }).then(async (result) => {
        if (result.isConfirmed) {
          let data = await deleteOneOrder(id);
          if (data.error) {
            MySwal.fire({
              text: data.message,
              icon: 'error',
              confirmButtonText: 'OK',
            });
          }
          MySwal.fire('Deleted!', data.message, 'success');
          setSuccess(true);
        }
      });
    },
    [MySwal],
  );

  const tableHooks = (hooks) => {
    hooks.visibleColumns.push((columns) => [
      ...columns,
      {
        id: 'Action',
        Header: 'Action',
        Cell: ({ row }) => (
          <>
            <Badge
              onClick={() => fetchOneOrder(row.original._id)}
              type="success"
              content="edit"
            />{' '}
            {user.role === 'admin' && (
              <Badge
                onClick={() => onDelete(row.original._id)}
                type="danger"
                content="delete"
              />
            )}
          </>
        ),
      },
    ]);
  };

  const handleFilterDate = (item) => {
    setDate([item.selection]);
  };

  useEffect(() => {
    dispatch(fetchOrders(date));
    setSuccess(false);
    socket.on('thisNewOrder', (data) => {
      dispatch(fetchOrders(date));
    });

    socket.on('updateOrder', (data) => {
      dispatch(fetchOrders(date));
    });

    return function cleanup() {
      socket.off('thisNewOrder', (data) => {
        console.log('socket off ' + data);
      });

      socket.off('updateOrder', (data) => {
        console.log('socket update order off ' + data);
      });
    };
  }, [dispatch, orders.currentPage, success, date]);

  return (
    <>
      <h1 style={{ fontSize: '1.5rem', marginBottom: 15 }}>Orders</h1>
      <div className="row">
        <div className="col-3 col-md-6 col-sm-12">
          <StatusCard
            icon="bx bx-cart"
            count={orders.totalItems}
            title="Total Orders"
          />
        </div>
        <div className="col-3 col-md-6 col-sm-12">
          <StatusCard
            icon="bx bx-cart"
            count={
              orders.fullData.filter(
                (data) => data.status_order === 'preparing',
              ).length
            }
            title="Preparing"
            color="blue"
          />
        </div>
        <div className="col-3 col-md-6 col-sm-12">
          <StatusCard
            icon="bx bx-cart"
            count={
              orders.fullData.filter((data) => data.status_order === 'delivery')
                .length
            }
            title="Delivery"
            color="orange"
          />
        </div>
        <div className="col-3 col-md-6 col-sm-12">
          <StatusCard
            icon="bx bx-cart"
            count={
              orders.fullData.filter(
                (data) => data.status_order === 'delivered',
              ).length
            }
            title="Delivered"
            color="green"
          />
        </div>
      </div>

      <div className="card">
        <div className="card__body">
          <Table
            columns={ordersColumns}
            data={ordersData}
            tableHooks={tableHooks}
            withFeature
            filterDate={handleFilterDate}
            date={date}
          />
        </div>
        <div className="card__footer">
          <Pagination
            totalItems={orders.totalItems}
            page={orders.currentPage}
            perPage={orders.perPage}
            onChange={(page) => dispatch(setPage(page))}
            onNext={(_) => dispatch(goToNextPage())}
            onPrev={(_) => dispatch(goToPrevPage())}
          />
        </div>
      </div>
      <Modal
        show={show}
        onClose={() => setShow(false)}
        title="Edit Data Order"
        onSave={() => onSave(payment, progress)}
      >
        {user.role !== 'kitchen' && user.role !== 'waiter' && (
          <>
            <h3>Status Pay</h3>
            <div className="payment-option">
              {statusPaymentData.map((status, idx) => (
                <div key={idx}>
                  <input
                    type="radio"
                    name="status_payment"
                    value={status.name}
                    id={status.name}
                    checked={status.name === payment}
                    onChange={() => setPayment(status.name)}
                  />
                  <label className={status.color} htmlFor={status.name}>
                    {status.name}
                  </label>
                </div>
              ))}
            </div>
          </>
        )}

        <h3>Progress Order</h3>
        <div className="payment-option">
          {statusOrderData.map((status, idx) => (
            <div key={idx}>
              <input
                type="radio"
                name="status_order"
                value={status.name}
                id={status.name}
                checked={status.name === progress}
                disabled={!status.policy.includes(user.role)}
                onChange={() => setProgress(status.name)}
              />
              <label className={status.color} htmlFor={status.name}>
                {status.name}
              </label>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default Orders;
